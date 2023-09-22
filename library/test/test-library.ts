import * as Chai from "chai";
import {expect} from "chai";
import ChaiExclude from "chai-exclude";
import Web3 from "web3";
import {Account} from "web3-core";
import {CredentialCreationOptions} from "../src/credential/CredentialCreationOptions";
import {IssuerDidValidityChecker} from "../src/credential/IssuerDidValidityChecker";
import {IssuerValidityChecker} from "../src/credential/IssuerValidityChecker";
import {EcdsaSecp256k1Proof} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1ProofManager,
    EcdsaSecp256k1VerificationOptions
} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023Manager} from "../src/credential/status/RevocationList2023Manager";
import {RevocationList2023CredentialStatus} from "../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredential} from "../src/credential/VerifiableCredential";
import {VerifiableCredentialManager} from "../src/credential/VerifiableCredentialManager";
import {VerifiablePresentationManager} from "../src/credential/VerifiablePresentationManager";
import {CredentialRegistryServiceManager} from "../src/resolver/CredentialRegistryService";
import {DidContainer, DidResolver} from "../src/resolver/DidResolver";
import {InvalidArgumentError} from "../src/utils/InvalidArgumentError";
import {JsonLdContextLoader} from "../src/utils/JsonLdContextLoader";
import {FileContext, FileContextLoader} from "./utils/FileContextLoader";
import {FileUtils} from "./utils/FileUtils";

Chai.use(ChaiExclude);
/*
interface TestContext {
    readonly didResolver: DidResolver;
    readonly chainId: number;
    readonly verifiableCredentialManager: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >;
    readonly verifiableCredentialManagerNoStatus: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >;
    readonly verifiablePresentationManager: VerifiablePresentationManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions,
        EcdsaSecp256k1ProofManager
    >;
    readonly serviceManager: CredentialRegistryServiceManager;
    readonly jsonLdContextLoader: JsonLdContextLoader;
    readonly userAccount1: Account;
    readonly userAccount2: Account;
    readonly userAccount3: Account;

    readonly userDid: DidContainer;
    readonly rootDid: DidContainer;
    readonly issuerDid: DidContainer;
    readonly issuer2Did: DidContainer;
}

const CONTRACT_ADDRESS = "0x7279DF8aCE9630abF78ea2F46c88be7BB6190aa6";
const CONTRACT_ABI_PATH = "../contract/build/src/contracts/ChainOfTrustDidSsi.json";
const GAS_LIMIT = 6721900;

/*
async function createCredential(
    parent: DidContainer,
    child: DidContainer,
    resolver: DidResolver,
    credentialManager: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        RevocationList2023Status,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >,
    loader: JsonLdContextLoader
) {
    return (await credentialManager.createVerifiableCredential<{id: string}>(
        {
            additionalContexts: [
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.ssicot.com/certification-credential",
                "https://www.ssicot.com/RevocationList2023"
            ],
            additionalTypes: ["CertificationCredential"],
            credentialSubject: {
                id: child.did
            },
            issuer: parent.did,
            expirationDate: new Date("2024-01-01T19:24:24Z"),
            credentialStatus: {
                id: `${parent.did}#revoc-1`,
                type: "RevocationList2023"
            }
        },
        {
            chainId: await resolver.getChainId(),
            verificationMethod: `${parent.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: parent.privateKey,
            documentLoader: loader
        }
    )) as TrustCredential;
}

async function addToChain(
    parent: DidContainer,
    child: DidContainer,
    resolver: DidResolver,
    credentialManager: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        RevocationList2023Status,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >,
    loader: JsonLdContextLoader
) {
    const credential = await createCredential(parent, child, resolver, credentialManager, loader);
    const trustedIssuers = new Set<string>();
    trustedIssuers.add(parent.did);

    await resolver.updateTrustCertification(
        credential,
        {
            chainIssuers: trustedIssuers,
            directIssuers: new Set<string>(),
            blacklistedIssuers: new Set<string>()
        },
        loader,
        `${child.did}#auth-key-1`,
        child.address
    );
}

function printObjectWithTitle(objectToPrint: object, title: string) {
    console.log();
    console.log("============================", title, "============================ ");
    console.log(util.inspect(objectToPrint, {showHidden: false, depth: null, colors: true}));
}

async function printDidDocument(
    did: string,
    resolver: DidResolver,
    serviceManager: ServiceManager<Service, any>,
    title: string
) {
    const result = await resolver.resolveRepresentation(did, {
        accept: "application/did+ld+json",
        additionalContexts: [CredentialRegistryServiceManager.CREDENTIAL_REGISTRY_CONTEXT],
        serviceManagers: [serviceManager]
    });

    printObjectWithTitle(result, title);
}

async function printAuthentication(did: string, resolver: DidResolver, title: string) {
    const result = await resolver.resolveAuthentication(did, {
        accept: "application/did+ld+json"
    });
    printObjectWithTitle(result, title);
}

async function printAssertionMethod(did: string, resolver: DidResolver, title: string) {
    const result = await resolver.resolveAssertionMethod(did, {
        accept: "application/did+ld+json"
    });
    printObjectWithTitle(result, title);
}

async function printService(
    did: string,
    resolver: DidResolver,
    serviceManager: ServiceManager<Service, any>,
    title: string
) {
    const didUrl = DidUtils.parseDidUrl(did);
    const result = await resolver.resolveService(`${didUrl?.did}?service=${didUrl?.fragment}`, {
        accept: "application/did+ld+json",
        additionalContexts: [CredentialRegistryServiceManager.CREDENTIAL_REGISTRY_CONTEXT],
        serviceManagers: [serviceManager]
    });
    printObjectWithTitle(result, title);
}

async function printChain(did: string, resolver: DidResolver, title: string) {
    const result = await resolver.resolveChain(did);
    printObjectWithTitle(result, title);
}

async function printDidUrl(
    didUrl: string,
    resolver: DidResolver,
    omitCredentialStatus: boolean,
    title: string
) {
    const result = await resolver.resolveDidUrl(didUrl, {
        accept: "application/did+ld+json",
        omitCredentialStatus
    });

    printObjectWithTitle(result, title);
}
 *




function copyObject<T>(object: T): T {
    return Object.assign({}, object);
}

let testContext: TestContext;

async function initializeTest() {
    const web3 = new Web3("http://127.0.0.1:7545");
    web3.eth.handleRevert = true;

    const didResolver = new DidResolver(
        web3,
        JSON.parse(await FileUtils.readFileContent(CONTRACT_ABI_PATH)).abi,
        CONTRACT_ADDRESS,
        GAS_LIMIT
    );

    const proofManager = new EcdsaSecp256k1ProofManager(web3, didResolver);
    const credentialStatusManager = new RevocationList2023Manager(didResolver);
    const issuerValidityChecker: IssuerValidityChecker = new IssuerDidValidityChecker(didResolver);
    const verifiableCredentialManager = new VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >(didResolver, issuerValidityChecker, proofManager, credentialStatusManager);
    const verifiableCredentialManagerNoStatus = new VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >(didResolver, issuerValidityChecker, proofManager);
    const verifiablePresentationManager = new VerifiablePresentationManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions,
        EcdsaSecp256k1ProofManager
    >(web3, didResolver, proofManager);

    const serviceManager = new CredentialRegistryServiceManager();

    // User:     0x06d7DE5A05B432646fdd7b3F41135403795D1189
    //           0x6BC673ae31775008ed55341142d9A96231B28FE7
    //           0x3C9b4af61A55424b04Ed1Df21CE04fA707de19De
    // Root:     0xE5d0B7D5E3675034efC721F6c584BE784331CB30
    // Issuer:   0xd14DaC2057Bd0BEbF442fa3C5be5b2b69bbcbe35
    // Issuer 2: 0x051D7D273D7e18a13F5F13C284293fe5e4adFfCB

    // Create the user
    const userAccount1 = web3.eth.accounts.privateKeyToAccount(
        "0xc26901d0ca79738b55232a31f8667b0b5d5216c32be3a5e0fd753e7f4ba46477"
    );
    const userAccount2 = web3.eth.accounts.privateKeyToAccount(
        "0x2e65851492b5a0ebf91d70d851d4219890a080503edbebef7ab3de09df5e9987"
    );
    const userAccount3 = web3.eth.accounts.privateKeyToAccount(
        "0xfd5180ffbf6105e387dbed852263ede6cc7f7fb052eef069b05c6ac888221a01"
    );
    const userDid = await didResolver.createNewDidFromAccount(userAccount1);
    // Create the root issuer
    const rootAccount = web3.eth.accounts.privateKeyToAccount(
        "0x50b61dabbc9da5455fc48fe8c16e25bb779ca41d56ae9b4528dfc3d4f9b25bbd"
    );

    const rootDid = await didResolver.createNewDidFromAccount(rootAccount);
    // Create the child issuer
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(
        "0x67033ee23107c92bfaafc3a1da45983460e4d5d65687c63ee9e89b746802f02f"
    );

    const issuerDid = await didResolver.createNewDidFromAccount(issuerAccount);

    // Create the seconds child issuer
    const issuer2Account = web3.eth.accounts.privateKeyToAccount(
        "0xee74f8327a49605098489303610016949e64303769e54b727aee1f806f96ea69"
    );

    const issuer2Did = await didResolver.createNewDidFromAccount(issuer2Account);
    const fileLoader = new FileContextLoader("./context");
    const jsonLdContextLoader = new JsonLdContextLoader([
        fileLoader.createContextLoader(FileContext.DID_DOCUMENT_LOADER),
        fileLoader.createContextLoader(FileContext.CHAIN_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.CERTIFICATION_CREDENTIAL_LOADER),
        fileLoader.createContextLoader(FileContext.DID_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.REVOCATION_LIST_LOADER)
    ]);

    testContext = {
        didResolver,
        chainId: await didResolver.getChainId(),
        verifiableCredentialManager,
        verifiableCredentialManagerNoStatus,
        verifiablePresentationManager,
        serviceManager,
        jsonLdContextLoader,
        userAccount1,
        userAccount2,
        userAccount3,
        userDid,
        rootDid,
        issuerDid,
        issuer2Did
    };
}

describe("Verifiable credentials", () => {
    let credentialCreationOptions: CredentialCreationOptions<
        {
            id: string;
        },
        RevocationList2023Status
    >;
    let proofCreationOptions: EcdsaSecp256k1CreationOptions;
    let referenceCredential: VerifiableCredential<
        {
            id: string;
        },
        EcdsaSecp256k1Proof,
        RevocationList2023Status
    >;
    let referenceCredentialNoStatus: VerifiableCredential<
        {
            id: string;
        },
        EcdsaSecp256k1Proof,
        RevocationList2023Status
    >;

    before(async () => await initializeTest());

    beforeEach(async () => {
        credentialCreationOptions = {
            additionalContexts: [
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.ssicot.com/certification-credential",
                "https://www.ssicot.com/RevocationList2023"
            ],
            additionalTypes: ["CertificationCredential"],
            credentialSubject: {
                id: testContext.userDid.did
            },
            issuer: testContext.issuerDid.did,
            expirationDate: new Date("2024-01-01T19:24:24Z"),
            credentialStatus: {
                id: `${testContext.issuerDid.did}#revoc-1`,
                type: "RevocationList2023"
            }
        };
        proofCreationOptions = {
            verificationMethod: `${testContext.issuerDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: testContext.issuerDid.privateKey,
            documentLoader: testContext.jsonLdContextLoader
        };
        referenceCredential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.ssicot.com/certification-credential",
                "https://www.ssicot.com/RevocationList2023"
            ],
            type: ["VerifiableCredential", "CertificationCredential"],
            credentialSubject: {
                id: "did:ssi-cot-eth:1337:06d7de5a05b432646fdd7b3f41135403795d1189"
            },
            issuer: "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35",
            issuanceDate: "",
            expirationDate: "2024-01-01T19:24:24Z",
            credentialStatus: {
                id: "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#revoc-1",
                type: "RevocationList2023"
            },
            proof: {
                created: "",
                jws: "",
                proofPurpose: "assertionMethod",
                type: "EcdsaSecp256k1RecoverySignature2020",
                verificationMethod:
                    "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#assert-key-1"
            }
        };
        referenceCredentialNoStatus = copyObject(referenceCredential);
        delete referenceCredentialNoStatus.credentialStatus;
    });

    it("Credential creation", async () => {
        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
        expect(credential.proof.jws).to.match(
            /^eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19[.][.][A-Za-z0-9\-_]{87}$/
        );
        expect(new Date(credential.issuanceDate)).to.be.lessThanOrEqual(new Date());
        expect(new Date(credential.proof.created)).to.be.lessThanOrEqual(new Date());
    });
    it("Invalid issuer", async () => {
        credentialCreationOptions.issuer = "https//www.issuers.com/123";
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("No status manager", async () => {
        delete credentialCreationOptions.credentialStatus;
        const credential =
            await testContext.verifiableCredentialManagerNoStatus.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            );
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredentialNoStatus);
    });
    it("No status", async () => {
        delete credentialCreationOptions.credentialStatus;
        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredentialNoStatus);
    });
    it("No status manager but status specified", async () => {
        expect(
            testContext.verifiableCredentialManagerNoStatus.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Status manager supporting a different type", async () => {
        credentialCreationOptions.credentialStatus!.type = "NewType";
        expect(
            testContext.verifiableCredentialManagerNoStatus.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Credential creation no contexts", async () => {
        const newOptions = credentialCreationOptions as unknown as CredentialCreationOptions<{}>;
        newOptions.additionalContexts = [];
        newOptions.additionalTypes = [];
        newOptions.credentialSubject = {};
        delete newOptions.credentialStatus;

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        const newReferenceCredential = referenceCredential as VerifiableCredential<
            {},
            EcdsaSecp256k1Proof,
            RevocationList2023Status
        >;
        newReferenceCredential["@context"] = ["https://www.w3.org/2018/credentials/v1"];
        newReferenceCredential.credentialSubject = {};
        newReferenceCredential.type = ["VerifiableCredential"];
        delete newReferenceCredential.credentialStatus;

        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(newReferenceCredential);
    });
    it("Credential with identifier", async () => {
        credentialCreationOptions.id = "https://www.ids.com/123";

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        referenceCredential.id = "https://www.ids.com/123";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
    });
    it("Credential without expiration", async () => {
        delete credentialCreationOptions.expirationDate;

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        delete referenceCredential.expirationDate;
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
    });
    it("Invalid DID as verification method", async () => {
        proofCreationOptions.verificationMethod = "did:example:123#abc";
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Invalid verification method DID URL", async () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#abc";
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Invalid assertion method", async () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#auth-key-1";
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Assertion method with different key", async () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:06d7de5a05b432646fdd7b3f41135403795d1189#assert-key-1";
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Missing contexts", async () => {
        credentialCreationOptions.additionalContexts.pop();
        expect(
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
        ).to.be.rejectedWith(InvalidArgumentError);
    });
    it("Credential proof with domain", async () => {
        proofCreationOptions.domain = "https://www.domain.com/my-domain";

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        referenceCredential.proof.domain = "https://www.domain.com/my-domain";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
    });
    it("Credential proof with challenge", async () => {
        proofCreationOptions.challenge = "https://www.domain.com/challenge-8";

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        referenceCredential.proof.challenge = "https://www.domain.com/challenge-8";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
    });
    it("Credential proof with domain and challenge", async () => {
        proofCreationOptions.domain = "https://www.domain.com/my-new-domain";
        proofCreationOptions.challenge = "https://www.domain.com/challenge-90";

        const credential = await testContext.verifiableCredentialManager.createVerifiableCredential(
            credentialCreationOptions,
            proofCreationOptions
        );
        referenceCredential.proof.domain = "https://www.domain.com/my-new-domain";
        referenceCredential.proof.challenge = "https://www.domain.com/challenge-90";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredential);
    });
});

/*
async function testLibrary(): Promise<void> {
    const web3 = new Web3("http://127.0.0.1:7545");
    web3.eth.handleRevert = true;

    const resolver = new DidResolver(
        web3,
        JSON.parse(await FileUtils.readFileContent(CONTRACT_ABI_PATH)).abi,
        CONTRACT_ADDRESS,
        GAS_LIMIT
    );

    const proofManager = new EcdsaSecp256k1ProofManager(web3, resolver);
    const revocationManager = new RevocationList2023Manager(resolver);
    const credentialManager = new VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        RevocationList2023Status,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >(resolver, proofManager, revocationManager);
    const presentationManager = new VerifiablePresentationManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions,
        EcdsaSecp256k1ProofManager
    >(web3, resolver, proofManager);

    const serviceManager = new CredentialRegistryServiceManager();

    // User:     0x06d7DE5A05B432646fdd7b3F41135403795D1189
    //           0x6BC673ae31775008ed55341142d9A96231B28FE7
    //           0x3C9b4af61A55424b04Ed1Df21CE04fA707de19De
    // Root:     0xE5d0B7D5E3675034efC721F6c584BE784331CB30
    // Issuer:   0xd14DaC2057Bd0BEbF442fa3C5be5b2b69bbcbe35
    // Issuer 2: 0x051D7D273D7e18a13F5F13C284293fe5e4adFfCB

    // Create the user
    const userAccount = web3.eth.accounts.privateKeyToAccount(
        "0xc26901d0ca79738b55232a31f8667b0b5d5216c32be3a5e0fd753e7f4ba46477"
    );
    const userAccount2 = web3.eth.accounts.privateKeyToAccount(
        "0x2e65851492b5a0ebf91d70d851d4219890a080503edbebef7ab3de09df5e9987"
    );
    const userAccount3 = web3.eth.accounts.privateKeyToAccount(
        "0xfd5180ffbf6105e387dbed852263ede6cc7f7fb052eef069b05c6ac888221a01"
    );
    const userDid = await resolver.createNewDidFromAccount(userAccount);
    // Create the root issuer
    const rootAccount = web3.eth.accounts.privateKeyToAccount(
        "0x50b61dabbc9da5455fc48fe8c16e25bb779ca41d56ae9b4528dfc3d4f9b25bbd"
    );

    const rootDid = await resolver.createNewDidFromAccount(rootAccount);
    // Create the child issuer
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(
        "0x67033ee23107c92bfaafc3a1da45983460e4d5d65687c63ee9e89b746802f02f"
    );

    const issuerDid = await resolver.createNewDidFromAccount(issuerAccount);

    // Create the seconds child issuer
    const issuer2Account = web3.eth.accounts.privateKeyToAccount(
        "0xee74f8327a49605098489303610016949e64303769e54b727aee1f806f96ea69"
    );

    const issuer2Did = await resolver.createNewDidFromAccount(issuer2Account);
    const fileLoader = new FileContextLoader("./context");
    const loader = new JsonLdContextLoader([
        fileLoader.createContextLoader(FileContext.DID_DOCUMENT_LOADER),
        fileLoader.createContextLoader(FileContext.CHAIN_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.CERTIFICATION_CREDENTIAL_LOADER),
        fileLoader.createContextLoader(FileContext.DID_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.REVOCATION_LIST_LOADER)
    ]);

    await resolver.clear(userDid.account.address);

    /*
     *
     * Test the services
     *
     *

    const serviceToAdd: CredentialRegistryService = {
        id: `${issuerDid.did}#issuer-service`,
        type: "CredentialRegistry",
        serviceEndpoint: "https://www.issuer-service.com"
    };
    const serviceToAdd2: CredentialRegistryService = {
        id: `${issuerDid.did}#verifier-service`,
        type: "CredentialRegistry",
        serviceEndpoint: {
            registries: [
                "https://www.issuer-service.com/verifier",
                "https://www.new-issuer-service.com"
            ]
        }
    };

    const serviceToUpdate: CredentialRegistryService = {
        id: serviceToAdd.id,
        type: "CredentialRegistry",
        serviceEndpoint: {
            registries: [
                "https://www.new-issuer-service.com",
                "https://www.issuer-service.com/credentials"
            ]
        }
    };

    await resolver.addService(
        serviceToAdd,
        serviceManager,
        `${issuerDid.did}#auth-key-1`,
        issuerDid.address
    );
    await printService(serviceToAdd.id, resolver, serviceManager, "Issuer new service");
    await printDidDocument(
        issuerDid.did,
        resolver,
        serviceManager,
        "Issuer document after addition"
    );

    await resolver.updateService(
        serviceToUpdate,
        serviceManager,
        `${issuerDid.did}#auth-key-1`,
        issuerDid.address
    );
    await printService(serviceToAdd.id, resolver, serviceManager, "Issuer service");
    await printDidDocument(issuerDid.did, resolver, serviceManager, "Issuer document after update");

    await resolver.addService(
        serviceToAdd2,
        serviceManager,
        `${issuerDid.did}#auth-key-1`,
        issuerDid.address
    );
    await printService(serviceToAdd2.id, resolver, serviceManager, "Issuer service2");
    await printDidDocument(
        issuerDid.did,
        resolver,
        serviceManager,
        "Issuer document after addition 2"
    );

    await resolver.removeService(
        serviceToUpdate.id,
        `${issuerDid.did}#auth-key-1`,
        issuerDid.address
    );
    await printDidDocument(
        issuerDid.did,
        resolver,
        serviceManager,
        "Issuer document after deletion"
    );

    /*
     *
     * Test the assertion methods
     *
     *

    await resolver.addAssertionMethod(
        `${userDid.did}#my-new-assert`,
        userAccount2.address,
        `${userDid.did}#auth-key-1`,
        userDid.address
    );
    await printAssertionMethod(`${userDid.did}#my-new-assert`, resolver, "User new assert");
    await printDidDocument(userDid.did, resolver, serviceManager, "User document after addition");
    await resolver.updateAssertionMethod(
        `${userDid.did}#my-new-assert`,
        userAccount3.address,
        `${userDid.did}#auth-key-1`,
        userDid.address
    );
    await printAssertionMethod(`${userDid.did}#my-new-assert`, resolver, "User updated assert");
    await printDidDocument(userDid.did, resolver, serviceManager, "User document after update");
    await resolver.removeAssertionMethod(
        `${userDid.did}#assert-key-1`,
        `${userDid.did}#auth-key-1`,
        userDid.address
    );
    await printDidDocument(userDid.did, resolver, serviceManager, "User document after deletion");

    /*
     *
     * Test the authentication methods
     *
     *

    await resolver.addAuthentication(
        `${userDid.did}#my-new-auth`,
        userAccount2.address,
        `${userDid.did}#auth-key-1`,
        userDid.address
    );
    await printAuthentication(`${userDid.did}#my-new-auth`, resolver, "User new auth");
    await resolver.updateAuthentication(
        `${userDid.did}#auth-key-1`,
        userAccount3.address,
        `${userDid.did}#my-new-auth`,
        userAccount2.address
    );
    await printAuthentication(`${userDid.did}#auth-key-1`, resolver, "User updated key 1");
    await printDidDocument(userDid.did, resolver, serviceManager, "User document");
    await resolver.removeAuthentication(
        `${userDid.did}#auth-key-1`,
        `${userDid.did}#my-new-auth`,
        userAccount2.address
    );
    await printDidDocument(userDid.did, resolver, serviceManager, "User document after deletion");

    /*
     *
     * Test the chain of trust, DID resolution, DID URL dereferencing and credential revocation
     *
     *

    await addToChain(rootDid, issuerDid, resolver, credentialManager, loader);
    await addToChain(issuerDid, issuer2Did, resolver, credentialManager, loader);

    await printDidDocument(issuerDid.did, resolver, serviceManager, "Issuer");
    await printChain(issuerDid.did, resolver, "Issuer chain");
    await printChain(issuer2Did.did, resolver, "Issuer 2 chain");

    // Deactivate the root
    await resolver.deactivate(`${rootDid.did}#auth-key-1`, rootDid.address);
    await printChain(issuer2Did.did, resolver, "Issuer 2 chain after root deactivation");
    await printDidDocument(
        issuer2Did.did,
        resolver,
        serviceManager,
        "Issuer 2 after root deactivation"
    );

    // Revoke the credential
    await resolver.revokeVerifiableCredential(
        {
            id: `${issuerDid.did}#revoc-1`,
            type: "RevocationList2023"
        },
        `${issuerDid.did}#auth-key-1`,
        issuerDid.address
    );
    await printChain(issuer2Did.did, resolver, "Issuer 2 chain after revocation");
    await printDidDocument(issuer2Did.did, resolver, serviceManager, "Issuer 2 after revocation");

    await resolver.removeTrustCertification(`${issuer2Did.did}#auth-key-1`, issuer2Did.address);
    await printChain(issuer2Did.did, resolver, "Issuer 2 chain after remove");
    await printDidDocument(issuer2Did.did, resolver, serviceManager, "Issuer 2 after remove");

    await resolver.deactivate(`${issuer2Did.did}#auth-key-1`, issuer2Did.address);
    await printChain(issuer2Did.did, resolver, "Issuer 2 chain after deactivation");
    await printDidDocument(issuer2Did.did, resolver, serviceManager, "Issuer 2 after deactivation");

    /*
     *
     * Test the invalid DIDs and DID URLs
     *
     *

    await printDidDocument(
        `${issuerDid.did.slice(0, -2)}aa`,
        resolver,
        serviceManager,
        "Generated on-the-fly"
    );
    await printDidUrl(`${issuerDid.did}#aaaaaa`, resolver, true, "Error DID URL");
    await printDidUrl(`${issuerDid.did}#aaaaaa`, resolver, false, "Not revoked");

    /*
     *
     * Test verifiable presentations
     *
     *
    const credential = await createCredential(
        issuerDid,
        userDid,
        resolver,
        credentialManager,
        loader
    );
    const presentation = await presentationManager.createVerifiablePresentation(
        {
            additionalContexts: [],
            additionalTypes: [],
            verifiableCredentials: [credential]
        },
        {
            chainId: await resolver.getChainId(),
            proofPurpose: "assertionMethod",
            verificationMethod: `${issuerDid.did}#assert-key-1`,
            privateKey: issuerDid.privateKey,
            documentLoader: loader
        }
    );

    printObjectWithTitle(presentation, "Verifiable presentation");
    await presentationManager.verifyPresentation(presentation, {
        chainId: await resolver.getChainId(),
        expectedProofPurpose: "assertionMethod",
        documentLoader: loader
    });

    await resolver.clear(userDid.account.address);
}

testLibrary()
    .then()
    .catch((e) => console.error(e));
*/

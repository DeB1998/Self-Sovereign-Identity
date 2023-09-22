import * as console from "console";
import {PromiEvent, TransactionReceipt} from "ethereum-abi-types-generator";
import Web3 from "web3";
import {EcdsaSecp256k1Proof} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1ProofManager,
    EcdsaSecp256k1VerificationOptions
} from "../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023Manager} from "../src/credential/status/RevocationList2023Manager";
import {RevocationList2023CredentialStatus} from "../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredentialManager} from "../src/credential/VerifiableCredentialManager";
import {
    CredentialRegistryService,
    CredentialRegistryServiceManager
} from "../src/resolver/CredentialRegistryService";
import {DidContainer, DidResolver, TrustCredential} from "../src/resolver/DidResolver";
import {JsonLdContextLoader} from "../src/utils/JsonLdContextLoader";
import {FileContext, FileContextLoader} from "./utils/FileContextLoader";
import {FileUtils} from "./utils/FileUtils";

const CONTRACT_ADDRESS = "0x243B34Ea76a38FEF9D309528AA4a2ECBE9BBfA0A";
const CONTRACT_ABI_PATH = "../contract/build/src/contracts/ChainOfTrustDidSsi.json";
const GAS_LIMIT = 6721900;

/*
async function printGas(
    title: string,
    result: Promise<PromiEvent<TransactionReceipt>>
): Promise<void> {
    console.log(title, ": ", (await result).gasUsed);
}

async function printGasAndClear(
    title: string,
    result: Promise<PromiEvent<TransactionReceipt>>,
    resolver: DidResolver
): Promise<void> {
    await printGas(title, result);
    await resolver.clear();
}

async function addToChain(
    parent: DidContainer,
    child: DidContainer,
    didResolver: DidResolver,
    credentialManager: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        RevocationList2023Status,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >,
    loader: JsonLdContextLoader
): Promise<void> {
    const credential = (await credentialManager.createVerifiableCredential<{id: string}>(
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
            chainId: await didResolver.getChainId(),
            verificationMethod: `${parent.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: parent.privateKey,
            documentLoader: loader
        }
    )) as TrustCredential;
    const trustedIssuers = new Set<string>();
    trustedIssuers.add(parent.did);

    await printGas(
        "updateTrustCertification",
        didResolver.updateTrustCertification(
            credential,
            {
                chainIssuers: trustedIssuers,
                directIssuers: new Set<string>(),
                blacklistedIssuers: new Set<string>()
            },
            loader,
            `${child.did}#auth-key-1`,
            child.address
        )
    );
}

async function doTest(): Promise<void> {
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

    const serviceManager = new CredentialRegistryServiceManager();

    // User:     0x06d7DE5A05B432646fdd7b3F41135403795D1189
    //           0x6BC673ae31775008ed55341142d9A96231B28FE7
    //           0x3C9b4af61A55424b04Ed1Df21CE04fA707de19De
    // Root:     0xE5d0B7D5E3675034efC721F6c584BE784331CB30
    // Issuer:   0xd14DaC2057Bd0BEbF442fa3C5be5b2b69bbcbe35
    // Issuer 2: 0x051D7D273D7e18a13F5F13C284293fe5e4adFfCB

    // Create the root issuer
    const rootAccount = web3.eth.accounts.privateKeyToAccount(
        "0x50b61dabbc9da5455fc48fe8c16e25bb779ca41d56ae9b4528dfc3d4f9b25bbd"
    );
    const rootDid = await resolver.createNewDidFromAccount(rootAccount);
    // Create the child issuer
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(
        "0x67033ee23107c92bfaafc3a1da45983460e4d5d65687c63ee9e89b746802f02f"
    );

    const issuer = await resolver.createNewDidFromAccount(issuerAccount);

    const fileLoader = new FileContextLoader("./context");
    const loader = new JsonLdContextLoader([
        fileLoader.createContextLoader(FileContext.DID_DOCUMENT_LOADER),
        fileLoader.createContextLoader(FileContext.CHAIN_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.CERTIFICATION_CREDENTIAL_LOADER),
        fileLoader.createContextLoader(FileContext.DID_RESOLUTION_LOADER),
        fileLoader.createContextLoader(FileContext.REVOCATION_LIST_LOADER)
    ]);
    const issuerDid = issuer.did;
    const issuerAddress = issuer.address;

    const service: CredentialRegistryService = {
        id: `${issuerDid}#issuer-service`,
        type: "CredentialRegistry",
        serviceEndpoint: "https://www.issuer-service.com"
    };

    web3.eth.defaultAccount = issuerAddress;

    /*
     * Not reified
     *
    await resolver.clear();
    // Services
    await printGasAndClear(
        "addService",
        resolver.addService(service, serviceManager, `${issuerDid}#auth-key-1`, issuerAddress),
        resolver
    );
    // Assertion methods
    await printGasAndClear(
        "addAssertionMethod",
        resolver.addAssertionMethod(
            `${issuerDid}#my-new-assert`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    await printGasAndClear(
        "updateAssertionMethod",
        resolver.updateAssertionMethod(
            `${issuerDid}#assert-key-1`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    await printGasAndClear(
        "removeAssertionMethod",
        resolver.removeAssertionMethod(
            `${issuerDid}#assert-key-1`,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    // Authentication
    await printGasAndClear(
        "addAuthentication",
        resolver.addAuthentication(
            `${issuerDid}#my-new-auth`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    await printGasAndClear(
        "updateAuthentication",
        resolver.updateAuthentication(
            `${issuerDid}#auth-key-1`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    // Trust certification
    await addToChain(rootDid, issuer, resolver, credentialManager, loader);
    await resolver.clear();
    // Revoke credentials
    await printGasAndClear(
        "revokeVerifiableCredential",
        resolver.revokeVerifiableCredential(
            {
                id: `${issuerDid}#revoc-1`,
                type: "RevocationList2023"
            },
            `${issuerDid}#auth-key-1`,
            issuerAddress
        ),
        resolver
    );
    // Deactivate
    await printGasAndClear(
        "deactivate",
        resolver.deactivate(`${issuerDid}#auth-key-1`, issuerAddress),
        resolver
    );

    /*
     * Reified
     *
    console.log("Ignore");
    await resolver.clear();
    await addToChain(rootDid, issuer, resolver, credentialManager, loader);

    console.log();
    console.log("Reified");
    console.log();

    // Services
    await printGas(
        "addService",
        resolver.addService(service, serviceManager, `${issuerDid}#auth-key-1`, issuerAddress)
    );
    await printGas(
        "updateService",
        resolver.updateService(service, serviceManager, `${issuerDid}#auth-key-1`, issuerAddress)
    );
    await printGas(
        "removeService",
        resolver.removeService(service.id, `${issuerDid}#auth-key-1`, issuerAddress)
    );
    // Assertion methods
    await printGas(
        "addAssertionMethod",
        resolver.addAssertionMethod(
            `${issuerDid}#my-new-assert`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    await printGas(
        "updateAssertionMethod",
        resolver.updateAssertionMethod(
            `${issuerDid}#my-new-assert`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    await printGas(
        "removeAssertionMethod",
        resolver.removeAssertionMethod(
            `${issuerDid}#my-new-assert`,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    // Authentication
    await printGas(
        "addAuthentication",
        resolver.addAuthentication(
            `${issuerDid}#my-new-auth`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    await printGas(
        "updateAuthentication",
        resolver.updateAuthentication(
            `${issuerDid}#my-new-auth`,
            issuerAddress,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    await printGas(
        "removeAuthentication",
        resolver.removeAuthentication(
            `${issuerDid}#my-new-auth`,
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    // Trust certification
    await addToChain(rootDid, issuer, resolver, credentialManager, loader);
    await printGas(
        "removeTrustCertification",
        resolver.removeTrustCertification(`${issuerDid}#auth-key-1`, issuerAddress)
    );
    // Revoke credentials
    await printGas(
        "revokeVerifiableCredential",
        resolver.revokeVerifiableCredential(
            {
                id: `${issuerDid}#revoc-1`,
                type: "RevocationList2023"
            },
            `${issuerDid}#auth-key-1`,
            issuerAddress
        )
    );
    // Deactivate
    await printGas("deactivate", resolver.deactivate(`${issuerDid}#auth-key-1`, issuerAddress));

    let minimum = 1000000000000;
    let minimumIndex = -1;
    let maximum = 0;
    let maximumIndex = -1;
    const serviceTest: CredentialRegistryService = {
        id: "",
        type: "CredentialRegistry",
        serviceEndpoint: "https://www.root-service.com"
    };

    for (let i = 0; i < 10000; i++) {
        if (i % 100 === 0) {
            console.log(`Service ${i}`);
        }
        try {
            serviceTest.id = `${rootDid.did}#root-service-${i}`;
            const result = await resolver.addService(
                serviceTest,
                serviceManager,
                `${rootDid.did}#auth-key-1`,
                rootAccount.address
            );
            if ((await result.gasUsed) < minimum) {
                minimum = result.gasUsed;
                minimumIndex = i;
            }
            if ((await result.gasUsed) > maximum) {
                maximum = result.gasUsed;
                maximumIndex = i;
            }
        } catch (e) {
            console.error("Error at index ", i);
            throw e;
        }
    }

    console.log("Minimum: ", minimum, " at index ", minimumIndex);
    console.log("Maximum: ", maximum, " at index ", maximumIndex);

    await resolver.clear(rootAccount.address);
}

doTest().then();
*/

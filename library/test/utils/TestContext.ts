import Web3 from "web3";
import {Account} from "web3-core";
import {IssuerDidValidityChecker} from "../../src/credential/IssuerDidValidityChecker";
import {IssuerValidityChecker} from "../../src/credential/IssuerValidityChecker";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1ProofManager,
    EcdsaSecp256k1VerificationOptions
} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023Manager} from "../../src/credential/status/RevocationList2023Manager";
import {VerifiableCredentialManager} from "../../src/credential/VerifiableCredentialManager";
import {VerifiablePresentationManager} from "../../src/credential/VerifiablePresentationManager";
import {CredentialRegistryServiceManager} from "../../src/resolver/CredentialRegistryService";
import {DidContainer, DidResolver} from "../../src/resolver/DidResolver";
import {JsonLdContextLoader} from "../../src/utils/JsonLdContextLoader";
import {FileContext, FileContextLoader} from "./FileContextLoader";
import {FileUtils} from "./FileUtils";

export class TestContext {
    private static readonly CONTRACT_ADDRESS = "0xBB9204d5eC3EEF1c28d2593C12C315Ac7575689F";
    private static readonly CONTRACT_ABI_PATH =
        "../contract/build/src/contracts/ChainOfTrustDidSsi.json";
    private static readonly GAS_LIMIT = 6721900;

    public readonly didResolver: DidResolver;
    public readonly chainId: number;
    public readonly proofManager: EcdsaSecp256k1ProofManager;
    public readonly verifiableCredentialManager: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >;
    public readonly verifiableCredentialManagerNoStatus: VerifiableCredentialManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions
    >;
    public readonly verifiablePresentationManager: VerifiablePresentationManager<
        EcdsaSecp256k1Proof,
        EcdsaSecp256k1CreationOptions,
        EcdsaSecp256k1VerificationOptions,
        EcdsaSecp256k1ProofManager
    >;
    public readonly serviceManager: CredentialRegistryServiceManager;
    public readonly jsonLdContextLoader: JsonLdContextLoader;
    public readonly userAccount1: Account;
    public readonly userAccount2: Account;
    public readonly userAccount3: Account;

    public readonly userDid: DidContainer;
    public readonly rootDid: DidContainer;
    public readonly issuerDid: DidContainer;
    public readonly issuer2Did: DidContainer;

    private constructor(
        didResolver: DidResolver,
        chainId: number,
        proofManager: EcdsaSecp256k1ProofManager,
        verifiableCredentialManager: VerifiableCredentialManager<
            EcdsaSecp256k1Proof,
            EcdsaSecp256k1CreationOptions,
            EcdsaSecp256k1VerificationOptions
        >,
        verifiableCredentialManagerNoStatus: VerifiableCredentialManager<
            EcdsaSecp256k1Proof,
            EcdsaSecp256k1CreationOptions,
            EcdsaSecp256k1VerificationOptions
        >,
        verifiablePresentationManager: VerifiablePresentationManager<
            EcdsaSecp256k1Proof,
            EcdsaSecp256k1CreationOptions,
            EcdsaSecp256k1VerificationOptions,
            EcdsaSecp256k1ProofManager
        >,
        serviceManager: CredentialRegistryServiceManager,
        jsonLdContextLoader: JsonLdContextLoader,
        userAccount1: Account,
        userAccount2: Account,
        userAccount3: Account,
        userDid: DidContainer,
        rootDid: DidContainer,
        issuerDid: DidContainer,
        issuer2Did: DidContainer
    ) {
        this.didResolver = didResolver;
        this.chainId = chainId;
        this.proofManager = proofManager;
        this.verifiableCredentialManager = verifiableCredentialManager;
        this.verifiableCredentialManagerNoStatus = verifiableCredentialManagerNoStatus;
        this.verifiablePresentationManager = verifiablePresentationManager;
        this.serviceManager = serviceManager;
        this.jsonLdContextLoader = jsonLdContextLoader;
        this.userAccount1 = userAccount1;
        this.userAccount2 = userAccount2;
        this.userAccount3 = userAccount3;
        this.userDid = userDid;
        this.rootDid = rootDid;
        this.issuerDid = issuerDid;
        this.issuer2Did = issuer2Did;
    }

    public static async initializeContext(): Promise<TestContext> {
        const web3 = new Web3("http://127.0.0.1:7545");
        web3.eth.handleRevert = true;

        const didResolver = new DidResolver(
            web3,
            JSON.parse(await FileUtils.readFileContent(TestContext.CONTRACT_ABI_PATH)).abi,
            TestContext.CONTRACT_ADDRESS,
            TestContext.GAS_LIMIT
        );

        const proofManager = new EcdsaSecp256k1ProofManager(web3, didResolver);
        const credentialStatusManager = new RevocationList2023Manager(didResolver);
        const issuerValidityChecker: IssuerValidityChecker = new IssuerDidValidityChecker(
            didResolver
        );
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
            fileLoader.createContextLoader(FileContext.REVOCATION_LIST_LOADER),
            fileLoader.createContextLoader([
                "https://www.test.com/presentation",
                "../test/presentation/test-presentation.jsonld"
            ])
        ]);

        return new TestContext(
            didResolver,
            await didResolver.getChainId(),
            proofManager,
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
        );
    }
}

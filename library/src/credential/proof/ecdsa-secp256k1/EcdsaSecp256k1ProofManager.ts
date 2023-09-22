import JsonLd, {JsonLdDocument} from "jsonld";
import {LanguageMap} from "jsonld/jsonld";
import Web3 from "web3";
import {
    AssertionMethodDereferenceResult,
    AuthenticationDereferenceResult
} from "../../../resolver/DidResolutionTypes";
import {DidResolver} from "../../../resolver/DidResolver";
import {VerificationMethod} from "../../../resolver/DidTypes";
import {DidUtils} from "../../../resolver/DidUtils";
import {DateUtils} from "../../../utils/DateUtils";
import {InvalidArgumentError} from "../../../utils/InvalidArgumentError";
import {JsonLdContextLoader} from "../../../utils/JsonLdContextLoader";
import {Credential} from "../../Credential";
import {InvalidVerifiableCredentialError} from "../../InvalidVerifiableCredentialError";
import {Presentation} from "../../Presentation";
import {ObjectUtils} from "../../utils/ObjectUtils";
import {
    ProofVerificationMethodUtils,
    ResolutionFunction
} from "../../utils/ProofVerificationMethodUtils";
import {VerifiableCredential} from "../../VerifiableCredential";
import {VerifiablePresentation} from "../../VerifiablePresentation";
import {CredentialProofManager} from "../CredentialProofManager";
import {ProofPurpose} from "../DataIntegrityProof";
import {InvalidProofError} from "../InvalidProofError";
import {PresentationProofManager} from "../PresentationProofManager";
import {EcdsaSecp256k1Proof} from "./EcdsaSecp256k1Proof";
import {JwsManager} from "./JwsManager";

interface EcdsaSecp256k1ProofObject {
    type: any;
    created: any;
    verificationMethod: any;
    proofPurpose: any;
    jws: any;
    domain?: any;
    challenge?: any;
}

export interface EcdsaSecp256k1CreationOptions {
    privateKey: Buffer;
    verificationMethod: string;
    proofPurpose: ProofPurpose;
    domain?: string | undefined;
    challenge?: string | undefined;
    documentLoader?: JsonLdContextLoader | undefined;
}

export interface EcdsaSecp256k1VerificationOptions {
    expectedProofPurpose: ProofPurpose;
    expectedDomain?: string | undefined;
    expectedChallenge?: string | undefined;
    documentLoader?: JsonLdContextLoader | undefined;
}

export class EcdsaSecp256k1ProofManager
    implements
        CredentialProofManager<
            EcdsaSecp256k1Proof,
            EcdsaSecp256k1CreationOptions,
            EcdsaSecp256k1VerificationOptions
        >,
        PresentationProofManager<
            EcdsaSecp256k1Proof,
            EcdsaSecp256k1CreationOptions,
            EcdsaSecp256k1VerificationOptions
        >
{
    private static readonly REQUIRED_PROPERTIES = new Set([
        "type",
        "created",
        "verificationMethod",
        "proofPurpose",
        "jws"
    ]);
    private readonly web3: Web3;
    private readonly jwsManager: JwsManager;
    private readonly didResolver: DidResolver;

    constructor(web3: Web3, didResolver: DidResolver) {
        this.web3 = web3;
        this.didResolver = didResolver;
        this.jwsManager = new JwsManager(web3);
    }

    public async createCredentialProof<T extends LanguageMap>(
        credentialData: Credential<T, any>,
        creationOptions: EcdsaSecp256k1CreationOptions
    ): Promise<EcdsaSecp256k1Proof> {
        return this.createProof(credentialData, creationOptions);
    }

    public async createPresentationProof<T extends LanguageMap>(
        presentationData: Presentation,
        creationOptions: EcdsaSecp256k1CreationOptions
    ): Promise<EcdsaSecp256k1Proof> {
        return this.createProof(presentationData, creationOptions);
    }

    private async createProof(
        jsonLdDocument: JsonLdDocument,
        creationOptions: EcdsaSecp256k1CreationOptions
    ): Promise<EcdsaSecp256k1Proof> {
        // Check the arguments
        const didUrl = DidUtils.parseDidUrl(creationOptions.verificationMethod);
        if (!DidUtils.isValidDidUrl(didUrl, await this.didResolver.getChainId())) {
            throw new InvalidArgumentError(
                `The DID URL '${creationOptions.verificationMethod}' is not valid`
            );
        }
        const verificationMethod = await this.getVerificationMethod(
            creationOptions.proofPurpose,
            creationOptions.verificationMethod,
            InvalidArgumentError
        );
        const verificationMethodAddress = await DidUtils.eip155ToAddress(
            verificationMethod.blockchainAccountId
        );
        const signerAddress = this.web3.eth.accounts.privateKeyToAccount(
            `0x${creationOptions.privateKey.toString("hex")}`
        ).address;
        if (verificationMethodAddress !== signerAddress) {
            throw new InvalidArgumentError(
                "The 'proof' verification method resolves to an address different from the signer's one"
            );
        }

        // Canonize the payload using the RDF Dataset Canonicalization Algorithm (URDNA2015)
        const canonizedPayload = await JsonLd.canonize(jsonLdDocument, {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: creationOptions.documentLoader?.getDocumentLoader()
        });

        // Create ths JWS
        const jws = await this.jwsManager.encode(canonizedPayload, creationOptions.privateKey);

        const proof: EcdsaSecp256k1Proof = {
            type: "EcdsaSecp256k1RecoverySignature2020",
            created: DateUtils.toIsoDate(new Date()),
            verificationMethod: creationOptions.verificationMethod,
            proofPurpose: creationOptions.proofPurpose,
            jws
        };
        if (creationOptions.domain !== undefined) {
            proof.domain = creationOptions.domain;
        }
        if (creationOptions.challenge !== undefined) {
            proof.challenge = creationOptions.challenge;
        }

        return proof;
    }

    public checkStructureValidity(proofObject: object): proofObject is EcdsaSecp256k1Proof {
        const missingKeys = ObjectUtils.checkObjectKeys(
            proofObject,
            EcdsaSecp256k1ProofManager.REQUIRED_PROPERTIES
        );
        if (missingKeys.size !== 0) {
            throw new InvalidVerifiableCredentialError(
                `The 'proof' property is missing the following properties required by the EcdsaSecp256k1RecoverySignature2020 standard: ${Array.from(
                    missingKeys
                ).join(", ")}`
            );
        }

        const proof = proofObject as EcdsaSecp256k1ProofObject;

        if (
            typeof proof.type !== "string" ||
            proof.type !== "EcdsaSecp256k1RecoverySignature2020"
        ) {
            throw new InvalidProofError(
                "A valid EcdsaSecp256k1RecoverySignature2020 proof must have the 'EcdsaSecp256k1RecoverySignature2020' type"
            );
        }
        EcdsaSecp256k1ProofManager.checkString(proof, "created", false);
        EcdsaSecp256k1ProofManager.checkString(proof, "verificationMethod", false);
        EcdsaSecp256k1ProofManager.checkString(proof, "proofPurpose", false);
        EcdsaSecp256k1ProofManager.checkString(proof, "jws", false);
        EcdsaSecp256k1ProofManager.checkString(proof, "domain", true);
        EcdsaSecp256k1ProofManager.checkString(proof, "challenge", true);

        return true;
    }

    public async verifyCredentialProof<T extends LanguageMap>(
        verifiableCredential: VerifiableCredential<T, EcdsaSecp256k1Proof, any>,
        verificationOptions: EcdsaSecp256k1VerificationOptions
    ): Promise<void> {
        return this.verifyProof(verifiableCredential, verificationOptions);
    }

    public async verifyPresentationProof<T extends LanguageMap>(
        verifiablePresentation: VerifiablePresentation<EcdsaSecp256k1Proof>,
        verificationOptions: EcdsaSecp256k1VerificationOptions
    ): Promise<void> {
        return this.verifyProof(verifiablePresentation, verificationOptions);
    }

    private async verifyProof(
        fullJsonLdDocument: JsonLdDocument & {proof: EcdsaSecp256k1Proof},
        verificationOptions: EcdsaSecp256k1VerificationOptions
    ): Promise<void> {
        // Extract the proof object
        const proof = fullJsonLdDocument.proof;

        // CHeck the proof validity
        if (proof.type !== "EcdsaSecp256k1RecoverySignature2020") {
            throw new InvalidProofError(
                `Unsupported proof type '${proof.type}'. Only 'EcdsaSecp256k1RecoverySignature2020' is supported`
            );
        }
        const proofCreationDate = Date.parse(proof.created);
        if (isNaN(proofCreationDate)) {
            throw new InvalidProofError("The proof creating date is not a valid proof");
        }
        if (proofCreationDate > Date.now()) {
            throw new InvalidProofError("The proof was created in the future");
        }
        if (proof.proofPurpose !== verificationOptions.expectedProofPurpose) {
            throw new InvalidProofError(
                `The proof has been created with the '${proof.proofPurpose}' purpose, but '${verificationOptions.expectedProofPurpose}' was expected`
            );
        }
        if (
            verificationOptions.expectedDomain !== undefined &&
            proof.domain !== verificationOptions.expectedDomain
        ) {
            throw new InvalidProofError(
                `The proof has been created for ${
                    proof.challenge === undefined ? "no domain" : `the '${proof.challenge}' domain`
                }, but the '${verificationOptions.expectedChallenge}' domain was expected`
            );
        }
        if (
            verificationOptions.expectedChallenge !== undefined &&
            proof.challenge !== verificationOptions.expectedChallenge
        ) {
            throw new InvalidProofError(
                `The proof has been created for ${
                    proof.challenge === undefined
                        ? "no challenge"
                        : `the challenge '${proof.challenge}'`
                }, but the challenge '${verificationOptions.expectedChallenge}' was expected`
            );
        }

        // Retrieve the verification method
        const verificationMethodUrl = DidUtils.parseDidUrl(proof.verificationMethod);
        if (!DidUtils.isValidDidUrl(verificationMethodUrl, await this.didResolver.getChainId())) {
            throw new InvalidVerifiableCredentialError(
                "The 'proof.verificationMethod' is not a valid DID URL"
            );
        }

        const verificationMethod = await this.getVerificationMethod(
            verificationOptions.expectedProofPurpose,
            proof.verificationMethod,
            InvalidProofError
        );

        // Copy the secured data document removing the proof
        const jsonldPayload: JsonLdDocument & {proof?: EcdsaSecp256k1Proof} = Object.assign(
            {},
            fullJsonLdDocument
        );
        delete jsonldPayload.proof;

        // Canonize the payload using the RDF Dataset Canonicalization Algorithm (URDNA2015)
        const canonizedPayload = await JsonLd.canonize(jsonldPayload, {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: verificationOptions.documentLoader?.getDocumentLoader()
        });

        // Verify the signature
        try {
            this.jwsManager.verify(
                fullJsonLdDocument.proof.jws,
                canonizedPayload,
                await DidUtils.eip155ToAddress(verificationMethod.blockchainAccountId)
            );
        } catch (error: unknown) {
            throw new InvalidProofError("The proof is invalid", error);
        }
    }

    private async getVerificationMethod<E extends Error>(
        expectedProofPurpose: string,
        verificationMethod: string,
        errorConstructor: {new (message: string): E}
    ): Promise<VerificationMethod> {
        let resolveFunction: ResolutionFunction<
            AuthenticationDereferenceResult | AssertionMethodDereferenceResult
        >;
        if (expectedProofPurpose === "authentication") {
            resolveFunction = (resolver, url, options) =>
                resolver.resolveAuthentication(url, options);
        } else {
            resolveFunction = (resolver, url, options) =>
                resolver.resolveAssertionMethod(url, options);
        }

        const dereferencingResult = await ProofVerificationMethodUtils.checkForDereferencingErrors(
            this.didResolver,
            verificationMethod,
            resolveFunction,
            "The verification method specified in the 'proof' property is not a valid DID URL",
            "The verification method specified in the 'proof' property cannot be found",
            errorConstructor
        );

        return dereferencingResult.contentStream as VerificationMethod;
    }

    private static checkString<T, K extends keyof T>(object: T, key: K, canBeUndefined: boolean) {
        const value = object[key];
        if (
            (value === undefined && !canBeUndefined) ||
            (value !== undefined && typeof value !== "string")
        ) {
            throw new InvalidProofError(
                `The '${String(
                    key
                )}' property must be a string in a valid EcdsaSecp256k1RecoverySignature2020 proof`
            );
        }
    }
}

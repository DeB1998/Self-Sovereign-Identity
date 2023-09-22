import {LanguageMap} from "jsonld/jsonld";
import {DidResolver} from "../resolver/DidResolver";
import {TrustCertification, TrustCertificationStatus} from "../resolver/DidTypes";
import {DidUtils} from "../resolver/DidUtils";
import {DateUtils} from "../utils/DateUtils";
import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {JsonLdContext} from "../utils/JsonLdContext";
import {Credential} from "./Credential";
import {CredentialCreationOptions} from "./CredentialCreationOptions";
import {CredentialVerificationOptions} from "./CredentialVerificationOptions";
import {InvalidVerifiableCredentialError} from "./InvalidVerifiableCredentialError";
import {IssuerValidityChecker} from "./IssuerValidityChecker";
import {CredentialProofManager} from "./proof/CredentialProofManager";
import {Proof} from "./proof/Proof";
import {CredentialStatus} from "./status/CredentialStatus";
import {CredentialStatusManager} from "./status/CredentialStatusManager";
import {RevocationList2023CredentialStatus} from "./status/RevocationList2023CredentialStatus";
import {ObjectUtils} from "./utils/ObjectUtils";
import {VerifiableCredential} from "./VerifiableCredential";

interface VerifiableCredentialObject {
    "@context": any;
    id?: any;
    type: any;
    credentialSubject: any;
    issuer: any;
    issuanceDate: any;
    expirationDate?: any;
    credentialStatus?: any;
    proof: any;
}

export class VerifiableCredentialManager<
    P extends Proof,
    C,
    V,
    CS extends CredentialStatus = RevocationList2023CredentialStatus
> {
    private static readonly VERIFIABLE_CREDENTIALS_CONTEXT =
        "https://www.w3.org/2018/credentials/v1";
    private static readonly VERIFIABLE_CREDENTIAL_REQUIRED_FIELDS = new Set([
        "@context",
        "type",
        "credentialSubject",
        "issuer",
        "issuanceDate",
        "proof"
    ]);
    private static readonly VERIFIABLE_CREDENTIAL_OPTIONAL_FIELDS = new Set([
        "id",
        "expirationDate",
        "credentialStatus"
    ]);

    private readonly didResolver: DidResolver;
    private readonly proofManager: CredentialProofManager<P, C, V>;
    private readonly credentialStatusManager: CredentialStatusManager<CS> | undefined;
    private readonly issuerValidityChecker: IssuerValidityChecker;

    constructor(
        didResolver: DidResolver,
        issuerValidityChecker: IssuerValidityChecker,
        proofManager: CredentialProofManager<P, C, V>,
        credentialStatusManager?: CredentialStatusManager<CS>
    ) {
        this.didResolver = didResolver;
        this.proofManager = proofManager;
        this.credentialStatusManager = credentialStatusManager;
        this.issuerValidityChecker = issuerValidityChecker;
    }

    public async createVerifiableCredential<T extends LanguageMap>(
        options: CredentialCreationOptions<T, CS>,
        proofCreationOptions: C
    ): Promise<VerifiableCredential<T, P, CS>> {
        await this.issuerValidityChecker.checkValidity(options.issuer);
        const credentialStatus = options.credentialStatus;
        if (credentialStatus !== undefined) {
            if (this.credentialStatusManager === undefined) {
                // noinspection LongLine
                throw new InvalidArgumentError(
                    "Cannot insert the specified credential status in the verifiable credential because no CredentialStatusManager has been specified in the VerifiableCredentialManager constructor"
                );
            }
            if (!this.credentialStatusManager.canHandleType(credentialStatus.type)) {
                throw new InvalidArgumentError(
                    `The CredentialStatusManager cannot handle credential statuses with type ${credentialStatus.type}`
                );
            }
        }
        // Set the contexts
        const contexts = new Set<JsonLdContext>([
            VerifiableCredentialManager.VERIFIABLE_CREDENTIALS_CONTEXT,
            ...options.additionalContexts
        ]);
        // Set the types
        const types = new Set<string>(["VerifiableCredential", ...options.additionalTypes]);
        // Create the credential
        const credential: Credential<T, CS> = {
            "@context": Array.from(contexts),
            type: Array.from(types),
            credentialSubject: options.credentialSubject,
            issuer: options.issuer,
            issuanceDate: DateUtils.toIsoDate(new Date())
        };
        // Add optional fields
        VerifiableCredentialManager.addOptionalField(credential, "id", options.id);
        if (options.expirationDate !== undefined) {
            credential.expirationDate = DateUtils.toIsoDate(options.expirationDate);
        }
        VerifiableCredentialManager.addOptionalField(
            credential,
            "credentialStatus",
            credentialStatus
        );

        // Generate the proof
        const proof = await this.proofManager.createCredentialProof(
            credential,
            proofCreationOptions
        );
        // Add the proof
        const credentialWithProof = credential as VerifiableCredential<T, P, CS>;
        credentialWithProof.proof = proof;

        return credentialWithProof;
    }

    public parseCredential<T extends LanguageMap>(
        value: any,
        credentialSubjectStructureValidator: (credentialSubject: object) => credentialSubject is T
    ): value is VerifiableCredential<T, P, CS> {
        let parsedValue;
        if (typeof value === "string") {
            try {
                parsedValue = JSON.parse(value);
            } catch (e: unknown) {
                let message: string;
                // Handle parse errors
                if (e instanceof SyntaxError) {
                    message = "The specified value is not a valid JSON";
                } else {
                    message = "Unable to decode the specified value as a JSON object";
                }
                throw new InvalidVerifiableCredentialError(message, e);
            }
        } else {
            parsedValue = value;
        }

        if (typeof parsedValue !== "object" || Array.isArray(parsedValue) || parsedValue === null) {
            throw new InvalidVerifiableCredentialError(
                "The specified value is neither a string, nor an object"
            );
        }
        const valueAsObject: object = parsedValue;

        const missingKeys = ObjectUtils.checkObjectKeys(
            valueAsObject,
            VerifiableCredentialManager.VERIFIABLE_CREDENTIAL_REQUIRED_FIELDS
        );
        if (missingKeys.size !== 0) {
            throw new InvalidVerifiableCredentialError(
                `The verifiable credentials is missing the following required properties: ${Array.from(
                    missingKeys
                ).join(", ")}`
            );
        }

        const credentialAsObject = valueAsObject as VerifiableCredentialObject;
        // Check the context
        if (
            !VerifiableCredentialManager.isArrayOf<JsonLdContext>(
                credentialAsObject["@context"],
                ["string", "object"]
            )
        ) {
            throw new InvalidVerifiableCredentialError(
                "The '@context' property must be an array of strings and/or JSON-LD context definitions"
            );
        }
        // Check the ID
        if (credentialAsObject.id !== undefined && typeof credentialAsObject.id !== "string") {
            throw new InvalidVerifiableCredentialError("The 'id' property must be a string");
        }
        // Check the types
        if (!VerifiableCredentialManager.isArrayOf<string>(credentialAsObject.type, ["string"])) {
            throw new InvalidVerifiableCredentialError(
                "The 'type' property must be an array of strings"
            );
        }
        // Check the issuer
        if (typeof credentialAsObject.issuer !== "string") {
            throw new InvalidVerifiableCredentialError("The 'issuer' property must be a string");
        }
        // Check the issuance date
        if (typeof credentialAsObject.issuanceDate !== "string") {
            throw new InvalidVerifiableCredentialError(
                "The 'issuanceDate' property must be a string"
            );
        }
        // Check the expiration date
        if (
            credentialAsObject.expirationDate !== undefined &&
            typeof credentialAsObject.expirationDate !== "string"
        ) {
            throw new InvalidVerifiableCredentialError(
                "The 'expirationDate' property must be a string"
            );
        }

        // Check the credential subject
        const credentialSubject = credentialAsObject.credentialSubject;
        if (typeof credentialSubject !== "object") {
            throw new InvalidVerifiableCredentialError(
                "The 'credentialSubject' property must be an object"
            );
        }
        VerifiableCredentialManager.checkValidity(
            () => credentialSubjectStructureValidator(credentialSubject),
            "The 'credentialSubject' property is not valid"
        );

        // Check the credential status
        const credentialStatus = credentialAsObject.credentialStatus;
        if (credentialStatus !== undefined) {
            if (this.credentialStatusManager === undefined) {
                throw new InvalidVerifiableCredentialError(
                    "The verifiable credential contains a 'credentialStatus' property, but no CredentialStatusManager has been specified in the VerifiableCredentialManager constructor."
                );
            }
            if (typeof credentialStatus !== "object") {
                throw new InvalidVerifiableCredentialError(
                    "The 'credentialSubject' property must be an object"
                );
            }

            VerifiableCredentialManager.checkValidity(
                () =>
                    this.credentialStatusManager !== undefined &&
                    this.credentialStatusManager.checkStructureValidity(credentialStatus),
                "The 'credentialStatus' property is not valid"
            );
        }
        // Check the proof
        const proof = credentialAsObject.proof;
        if (typeof proof !== "object") {
            throw new InvalidVerifiableCredentialError("The 'proof' property must be an object");
        }
        VerifiableCredentialManager.checkValidity(
            () => this.proofManager.checkStructureValidity(proof),
            "The 'proof' property does not contain a valid proof"
        );

        return true;
    }

    public async verifyCredential(
        verifiableCredential: VerifiableCredential<any, P, CS>,
        options: CredentialVerificationOptions,
        proofVerificationOptions: V
    ): Promise<void> {
        // Check the context
        if (
            verifiableCredential["@context"].length === 0 ||
            verifiableCredential["@context"][0] !==
                VerifiableCredentialManager.VERIFIABLE_CREDENTIALS_CONTEXT
        ) {
            throw new InvalidVerifiableCredentialError(
                `Any valid verifiable credential must specify '${VerifiableCredentialManager.VERIFIABLE_CREDENTIALS_CONTEXT}' as the first context`
            );
        }
        // Check the type
        if (!verifiableCredential.type.includes("VerifiableCredential")) {
            throw new InvalidVerifiableCredentialError(
                "Any valid verifiable credential must contain the type 'VerifiableCredential'"
            );
        }
        // Check the issuer
        await this.issuerValidityChecker.checkValidity(verifiableCredential.issuer);

        // Check the issuance date
        const issuanceDate = Date.parse(verifiableCredential.issuanceDate);
        if (isNaN(issuanceDate)) {
            throw new InvalidVerifiableCredentialError(
                "Invalid verifiable credential issuance date"
            );
        }
        if (issuanceDate > Date.now()) {
            throw new InvalidVerifiableCredentialError(
                "The verifiable credential was issued in the future"
            );
        }
        // Check the expiration date
        if (verifiableCredential.expirationDate !== undefined) {
            const expirationDate = Date.parse(verifiableCredential.expirationDate);
            if (isNaN(expirationDate)) {
                throw new InvalidVerifiableCredentialError(
                    "Invalid verifiable credential expiration date"
                );
            }
            if (expirationDate < Date.now()) {
                throw new InvalidVerifiableCredentialError("The verifiable credential is expired");
            }
        }
        // Check the credential status
        const credentialStatus = verifiableCredential.credentialStatus;
        if (credentialStatus !== undefined) {
            if (this.credentialStatusManager === undefined) {
                // noinspection LongLine
                throw new InvalidArgumentError(
                    "Cannot verify the status of the verifiable credential because no CredentialStatusManager has been specified in the VerifiableCredentialManager constructor."
                );
            }
            if (!this.credentialStatusManager.canHandleType(credentialStatus.type)) {
                throw new InvalidArgumentError(
                    `The CredentialStatusManager cannot handle credential statuses with type ${credentialStatus.type}`
                );
            }
            await this.credentialStatusManager.verifyStatus(credentialStatus);
        }

        // Extract the issuer
        const issuer = verifiableCredential.issuer;
        const blacklistedIssuers = options.trustedIssuers.blacklistedIssuers;

        if (blacklistedIssuers.has(issuer)) {
            throw new InvalidVerifiableCredentialError(
                "The issuer of the verifiable credential is blacklisted"
            );
        }

        let isIssuerTrusted = false;
        if (options.trustedIssuers.directIssuers.has(issuer)) {
            isIssuerTrusted = true;
        } else {
            const trustedChainIssuers = options.trustedIssuers.chainIssuers;
            let chainOfTrust: TrustCertification[];
            let currentEntity = issuer;

            // Check the chain until a trusted issuer is found
            do {
                // Retrieve the chain of the entity
                const entityChainResult = await this.didResolver.resolveChain(currentEntity);
                if (DidUtils.isChainResolutionErrored(entityChainResult)) {
                    let errorMessage = `Cannot retrieve the chain of trust of '${currentEntity}'`;
                    if (currentEntity !== issuer) {
                        errorMessage += `, which belongs to the chain of trust of '${issuer}',`;
                    }
                    throw new InvalidVerifiableCredentialError(
                        `${errorMessage}: ${entityChainResult.resolutionMetadata.errorMessage}`
                    );
                }
                chainOfTrust = entityChainResult.chainStream.trustChain;

                // Loop over the entities in the chain of trust
                for (const trustCertification of chainOfTrust) {
                    const certificationIssuer = trustCertification.issuer;
                    if (blacklistedIssuers.has(certificationIssuer)) {
                        throw new InvalidVerifiableCredentialError(
                            `The entity '${certificationIssuer}' in the chain of trust of '${issuer}' is blacklisted`
                        );
                    }
                    if (
                        trustCertification.certificationStatus === TrustCertificationStatus.REVOKED
                    ) {
                        const stopProcessing =
                            options.onRevokedCertification === undefined ||
                            !(await options.onRevokedCertification(
                                issuer,
                                currentEntity,
                                trustCertification,
                                chainOfTrust
                            ));
                        if (stopProcessing) {
                            throw new InvalidVerifiableCredentialError(
                                `The trust certification of the entity '${certificationIssuer}', which belongs to the chain of trust of '${issuer}', has been revoked`
                            );
                        }
                    }
                    if (trustedChainIssuers.has(certificationIssuer)) {
                        isIssuerTrusted = true;
                        break;
                    }
                    chainOfTrust.push(trustCertification);
                    currentEntity = certificationIssuer;
                }
            } while (
                !isIssuerTrusted &&
                chainOfTrust.length === DidResolver.CHAIN_OF_TRUST_MAX_LENGTH
            );
        }
        if (!isIssuerTrusted) {
            throw new InvalidVerifiableCredentialError(
                "The issuer of the verifiable credential is not trusted"
            );
        }

        // Verify the proof
        try {
            await this.proofManager.verifyCredentialProof(
                verifiableCredential,
                proofVerificationOptions
            );
        } catch (e: unknown) {
            throw new InvalidVerifiableCredentialError(
                "The integrity of the verifiable credential cannot be validated",
                e
            );
        }
    }

    private static addOptionalField<K extends keyof Credential<any, any>>(
        credential: Credential<any, any>,
        keyName: K,
        optionValue: Credential<any, any>[K] | undefined
    ): void {
        if (optionValue !== undefined) {
            credential[keyName] = optionValue;
        }
    }

    private static isArrayOf<T>(value: any, types: string[]): value is T[] {
        if (Array.isArray(value)) {
            for (const singleValue of value) {
                if (!types.includes(typeof singleValue)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    private static checkValidity(validityFunction: () => boolean, errorMessage: string): void {
        let valid: boolean;
        let cause: unknown | undefined = undefined;
        try {
            valid = validityFunction();
        } catch (e: unknown) {
            valid = false;
            cause = e;
        }
        if (!valid) {
            throw new InvalidVerifiableCredentialError(errorMessage, cause);
        }
    }
}

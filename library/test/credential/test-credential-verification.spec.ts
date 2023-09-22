import Chai from "chai";
import ChaiExclude from "chai-exclude";
import {Credential} from "../../src/credential/Credential";
import {CredentialVerificationOptions} from "../../src/credential/CredentialVerificationOptions";
import {InvalidVerifiableCredentialError} from "../../src/credential/InvalidVerifiableCredentialError";
import {CredentialProofManager} from "../../src/credential/proof/CredentialProofManager";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1VerificationOptions
} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {Proof} from "../../src/credential/proof/Proof";
import {RevocationList2023CredentialStatus} from "../../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {InvalidDidError} from "../../src/resolver/InvalidDidError";
import {DateUtils} from "../../src/utils/DateUtils";
import {InvalidArgumentError} from "../../src/utils/InvalidArgumentError";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {ProofRegenerator} from "../utils/ProofRegenerator";
import {TestContext} from "../utils/TestContext";
import {Tester} from "../utils/Tester";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

interface TestJwtHeader {
    alg?: string;
    crit?: string[];
    b64?: boolean;
    exp?: string;
}

function stringifyModifiedCopy<T extends object, K extends keyof T>(
    object: T,
    key: K,
    newValue: T[K]
) {
    const copy = ObjectUtils.copyObject(object);
    copy[key] = newValue;
    return JSON.stringify(copy);
}

function stringifyCopyWithout<T extends object, K extends keyof T>(object: T, key: K) {
    const copy = ObjectUtils.copyObject(object);
    delete copy[key];
    return JSON.stringify(copy);
}

describe("Verifiable credential verification", () => {
    let testContext: TestContext;
    let credentialVerificationOptions: CredentialVerificationOptions;
    let proofCreationOptions: EcdsaSecp256k1CreationOptions;
    let proofVerificationOptions: EcdsaSecp256k1VerificationOptions;
    let referenceCredential: VerifiableCredential<
        {
            id: string;
        },
        EcdsaSecp256k1Proof,
        RevocationList2023CredentialStatus
    >;
    let referenceCredentialNoStatus: VerifiableCredential<
        {
            id: string;
        },
        EcdsaSecp256k1Proof,
        RevocationList2023CredentialStatus
    >;
    // verifiableCredentialManager, referenceCredential
    const credentialTester = new Tester(
        (credential) =>
            testContext.verifiableCredentialManager.verifyCredential(
                credential,
                credentialVerificationOptions,
                proofVerificationOptions
            ),
        () => referenceCredential
    );
    // verifiableCredentialManager, referenceCredentialNoStatus
    const credentialTester2 = new Tester(
        (credential) =>
            testContext.verifiableCredentialManager.verifyCredential(
                credential,
                credentialVerificationOptions,
                proofVerificationOptions
            ),
        () => referenceCredentialNoStatus
    );
    // verifiableCredentialManagerNoStatus, referenceCredentialNoStatus
    const credentialNoStatusTester = new Tester(
        (credential) =>
            testContext.verifiableCredentialManagerNoStatus.verifyCredential(
                credential,
                credentialVerificationOptions,
                proofVerificationOptions
            ),
        () => referenceCredentialNoStatus
    );
    // verifiableCredentialManagerNoStatus, referenceCredential
    const credentialNoStatusTester2 = new Tester(
        (credential) =>
            testContext.verifiableCredentialManagerNoStatus.verifyCredential(
                credential,
                credentialVerificationOptions,
                proofVerificationOptions
            ),
        () => referenceCredential
    );

    before(async () => {
        testContext = await TestContext.initializeContext();
    });

    beforeEach(async () => {
        credentialVerificationOptions = {
            trustedIssuers: {
                chainIssuers: new Set([testContext.issuerDid.did, testContext.issuer2Did.did]),
                directIssuers: new Set([testContext.issuerDid.did, testContext.issuer2Did.did]),
                blacklistedIssuers: new Set()
            },
            onRevokedCertification: () => {
                throw new Error("Revoked certification");
            }
        };
        proofCreationOptions = {
            verificationMethod: `${testContext.issuerDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: testContext.issuerDid.privateKey,
            documentLoader: testContext.jsonLdContextLoader
        };
        proofVerificationOptions = {
            expectedProofPurpose: "assertionMethod",
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
            issuanceDate: DateUtils.toIsoDate(new Date()),
            expirationDate: DateUtils.toIsoDate(DateCreator.generate(1, TimeUnit.DAY)),
            credentialStatus: {
                id: "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#revoc-1",
                type: "RevocationList2023"
            },
            proof: {
                created: DateUtils.toIsoDate(new Date()),
                jws: "",
                proofPurpose: "assertionMethod",
                type: "EcdsaSecp256k1RecoverySignature2020",
                verificationMethod:
                    "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#assert-key-1"
            }
        };
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        referenceCredentialNoStatus = ObjectUtils.copyObject(referenceCredential);
        delete referenceCredentialNoStatus.credentialStatus;
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredentialNoStatus,
            proofCreationOptions,
            testContext.proofManager
        );
    });

    it("Credential verification", () => credentialTester.toBeFulfilled());
    it("Credential without status verification", () => credentialNoStatusTester.toBeFulfilled());
    it("Credential without contexts", () => {
        referenceCredential["@context"] = [];
        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });

    it("Credential without first context", () => {
        referenceCredential["@context"].shift();
        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential with first context in wrong position", async () => {
        const element = referenceCredential["@context"].shift();
        referenceCredential["@context"].push(element || "");
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential without types", () => {
        referenceCredential.type = [];
        credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential with wrong types", () => {
        const index = referenceCredential.type.indexOf("VerifiableCredential");
        referenceCredential.type = referenceCredential.type.splice(index, 1);

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential with wrong issuer", async () => {
        referenceCredential.issuer = "https://www.issuers.com/123";
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidDidError);
    });
    it("Credential with wrong issuance date", async () => {
        referenceCredential.issuanceDate = "abc";
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential issued in the future", async () => {
        referenceCredential.issuanceDate = DateUtils.toIsoDate(
            DateCreator.generate(10, TimeUnit.DAY)
        );
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Credential issued in the future, but within 15 seconds", async () => {
        referenceCredential.issuanceDate = DateUtils.toIsoDate(
            DateCreator.generate(8, TimeUnit.SECOND)
        );
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeFulfilled();
    });
    it("Credential without expiration date", async () => {
        delete referenceCredential.expirationDate;
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeFulfilled();
    });
    it("Credential with wrong expiration date", async () => {
        referenceCredential.expirationDate = "efg";
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Expired credential", async () => {
        referenceCredential.expirationDate = DateUtils.toIsoDate(
            DateCreator.generate(-1, TimeUnit.DAY)
        );
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Expired credential, but within 15 seconds", async () => {
        referenceCredential.expirationDate = DateUtils.toIsoDate(
            DateCreator.generate(-8, TimeUnit.SECOND)
        );
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeFulfilled();
    });
    it("No status manager", () => credentialNoStatusTester2.toBeRejectedWith(InvalidArgumentError));
    it("No status", async () => {
        delete referenceCredential.credentialStatus;
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return Promise.all([
            credentialTester.toBeFulfilled(),
            credentialNoStatusTester2.toBeFulfilled()
        ]);
    });
    it("No status manager but status specified", () =>
        credentialNoStatusTester2.toBeRejectedWith(InvalidArgumentError));
    it("Status manager supporting a different type", async () => {
        (referenceCredential.credentialStatus!.type as string) = "NewType";

        return credentialTester.toBeRejectedWith(InvalidArgumentError);
    });
    it("Revoked credential", async () => {
        referenceCredential.credentialStatus!.id += "0";
        await testContext.didResolver.revokeVerifiableCredential(
            referenceCredential.credentialStatus!,
            `${testContext.issuerDid.did}#auth-key-1`,
            testContext.issuerDid.address
        );
        await ProofRegenerator.regenerateCredentialProof(
            referenceCredential,
            proofCreationOptions,
            testContext.proofManager
        );

        return credentialTester.toBeRejectedWith(InvalidVerifiableCredentialError);
    });
});

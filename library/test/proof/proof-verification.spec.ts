import Chai from "chai";
import ChaiExclude from "chai-exclude";
import {CredentialVerificationOptions} from "../../src/credential/CredentialVerificationOptions";
import {InvalidVerifiableCredentialError} from "../../src/credential/InvalidVerifiableCredentialError";
import {InvalidVerifiablePresentationError} from "../../src/credential/InvalidVerifiablePresentationError";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1VerificationOptions
} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023CredentialStatus} from "../../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {VerifiablePresentation} from "../../src/credential/VerifiablePresentation";
import {DateUtils} from "../../src/utils/DateUtils";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {ProofRegenerator} from "../utils/ProofRegenerator";
import {RandomValues} from "../utils/RandomValues";
import {TestContext} from "../utils/TestContext";
import {Tester} from "../utils/Tester";
import {ObjectWithProof} from "./ObjectWithProof";

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

function registerTests<T extends ObjectWithProof>(
    tester: () => Tester<T>,
    referenceObject: () => T,
    proofVerificationOptions: () => EcdsaSecp256k1VerificationOptions,
    errorConstructor: Function
) {
    it("Wrong proof type", () => {
        (referenceObject().proof.type as string) = "NewProofType";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with wrong creation date", () => {
        referenceObject().proof.created = "abc";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with creation date in the future", () => {
        referenceObject().proof.created = DateUtils.toIsoDate(
            DateCreator.generate(1, TimeUnit.DAY)
        );

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with creation date in the future, but within 15 seconds", () => {
        referenceObject().proof.created = DateUtils.toIsoDate(
            DateCreator.generate(8, TimeUnit.SECOND)
        );

        return tester().toBeFulfilled();
    });
    it("Proof with different purpose", () => {
        referenceObject().proof.proofPurpose = "authentication";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with domain", () => {
        referenceObject().proof.domain = "https://www.domain.com/my-domain";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/my-domain";

        return tester().toBeFulfilled();
    });
    it("Proof with challenge", async () => {
        referenceObject().proof.challenge = "https://www.domain.com/challenge-9";
        proofVerificationOptions().expectedChallenge = "https://www.domain.com/challenge-9";

        return tester().toBeFulfilled();
    });
    it("Credential proof with domain and challenge", async () => {
        referenceObject().proof.domain = "https://www.domain.com/my-new-domain";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/my-new-domain";
        referenceObject().proof.challenge = "https://www.domain.com/challenge-90";
        proofVerificationOptions().expectedChallenge = "https://www.domain.com/challenge-90";

        return tester().toBeFulfilled();
    });
    it("Proof with wrong domain", () => {
        referenceObject().proof.domain = "https://www.domain.com/my-domain";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/my-new-domain";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with wrong challenge", async () => {
        referenceObject().proof.challenge = "https://www.domain.com/challenge-9";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/challenge-90";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with both wrong domain and wrong challenge", async () => {
        referenceObject().proof.domain = "https://www.domain.com/my-new-domain2";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/my-new-domain";
        referenceObject().proof.challenge = "https://www.domain.com/challenge-902";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/challenge-90";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Proof with both wrong domain and wrong challenge", async () => {
        referenceObject().proof.domain = "https://www.domain.com/my-new-domain2";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/my-new-domain";
        referenceObject().proof.challenge = "https://www.domain.com/challenge-902";
        proofVerificationOptions().expectedDomain = "https://www.domain.com/challenge-90";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid DID as verification method", () => {
        referenceObject().proof.verificationMethod = "did:example:123#abc";
        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid verification method DID URL", () => {
        referenceObject().proof.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#abc";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid assertion method", () => {
        referenceObject().proof.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#auth-key-1";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Assertion method with different key", () => {
        referenceObject().proof.verificationMethod =
            "did:ssi-cot-eth:1337:06d7de5a05b432646fdd7b3f41135403795d1189#assert-key-1";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid JWT components", () => {
        referenceObject().proof.jws += ".";

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid JWT header", () => {
        referenceObject().proof.jws = `${referenceObject().proof.jws.substring(
            0,
            8
        )}Qm${referenceObject().proof.jws.substring(10)}`;

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("Invalid JWT header as array", () => {
        const remainingJwt = referenceObject().proof.jws.split(".");
        remainingJwt.shift();
        referenceObject().proof.jws = `WzNd.${remainingJwt.join(".")}`;

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("JWT header with more keys", () => {
        const remainingJwt = referenceObject().proof.jws.split(".");
        remainingJwt.shift();
        const newHeader = JSON.stringify({
            alg: "ES256K-R",
            crit: ["b64"],
            b64: false,
            exp: Date.now()
        });
        referenceObject().proof.jws = `${newHeader}.${remainingJwt.join(".")}`;

        return tester().toBeRejectedWith(errorConstructor);
    });
    it("JWT header with duplicated keys", () => {
        const remainingJwt = referenceObject().proof.jws.split(".");
        remainingJwt.shift();
        const newHeader = `${JSON.stringify({
            alg: "ES256K-R",
            crit: ["b64"],
            b64: false,
            exp: Date.now()
        }).substring(0, -1)},crit: ["b64"]}`;
        referenceObject().proof.jws = `${Buffer.from(newHeader).toString(
            "base64url"
        )}.${remainingJwt.join(".")}`;
    });
    it("JWT header with missing or invalid keys", () => {
        const remainingJws = referenceObject().proof.jws.split(".");
        remainingJws.shift();
        const header: TestJwtHeader = {
            alg: "ES256K-R",
            crit: ["b64"],
            b64: false
        };
        const headers: string[] = [];

        headers.push(stringifyModifiedCopy(header, "alg", "INVALID-ALG"));
        headers.push(stringifyModifiedCopy(header, "crit", ["abc"]));
        headers.push(stringifyModifiedCopy(header, "crit", ["b64", "abc"]));
        headers.push(stringifyModifiedCopy(header, "b64", true));

        const invalidHeader: {[key: string]: any} = header;
        for (const headerName in ["alg", "crit", "b64"]) {
            for (const value in Array.from<any>(RandomValues.VOID_VALUES).concat(
                RandomValues.NUMBER_VALUES,
                RandomValues.OBJECT_VALUES,
                RandomValues.ARRAY_VALUES,
                RandomValues.STRING_VALUES
            )) {
                headers.push(stringifyModifiedCopy(invalidHeader, headerName, value));
            }
            if (headerName !== "b64") {
                for (const value in RandomValues.BOOLEAN_VALUES) {
                    headers.push(stringifyModifiedCopy(invalidHeader, headerName, value));
                }
            }
        }

        header.exp = new Date().toISOString();
        headers.push(stringifyCopyWithout(header, "alg"));
        headers.push(stringifyCopyWithout(header, "crit"));
        headers.push(stringifyCopyWithout(header, "b64"));

        const remainingJoinedJws = remainingJws.join(".");
        const input: T[] = [];
        for (const newHeader of headers) {
            const credential = ObjectUtils.copyObject(referenceObject());
            referenceObject().proof.jws = `${Buffer.from(newHeader).toString(
                "base64url"
            )}.${remainingJoinedJws}`;
            input.push(credential);
        }

        return tester().setInput(input).toBeRejectedWith(errorConstructor);
    });

    it("Invalid JWT signature", () => {
        const remainingJws = referenceObject().proof.jws.split(".");
        const signature = remainingJws.pop() || "";
        const signatures: string[] = [];

        signatures.push(`${signature}abc`);
        signatures.push(`abc${signature}`);
        signatures.push(`def${signature}ef`);
        signatures.push(`def${signature.substring(0, -1)}yf`);
        signatures.push(`${signature.substring(0, -3)}yfht`);
        signatures.push(`${signature.substring(0, -3)}`);
        signatures.push(`${signature.substring(0, -10)}egy`);
        signatures.push(`af${signature.substring(0, -10)}egy`);
        signatures.push(`af${signature.substring(0, -14)}`);
        signatures.push(`af${signature.substring(0, -2)}`);
        signatures.push(`af${signature.substring(0, -4)}eg`);
        signatures.push(`iigf${signature.substring(0, -6)}eg`);
        signatures.push(`ii${signature.substring(2, 40)}eg${signature.substring(42, -2)}`);

        const remainingJoinedJws = remainingJws.join(".");
        const input: T[] = [];
        for (const newSignature of signatures) {
            const credential = ObjectUtils.copyObject(referenceObject());
            referenceObject().proof.jws = `${remainingJoinedJws}.${newSignature}`;

            input.push(credential);
        }
        return tester().setInput(input).toBeRejectedWith(errorConstructor);
    });
}

describe("Credential proof verification", () => {
    let testContext: TestContext;
    let credentialVerificationOptions: CredentialVerificationOptions;
    let proofVerificationOptions: EcdsaSecp256k1VerificationOptions;
    let referenceCredential: VerifiableCredential<
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
        let proofCreationOptions: EcdsaSecp256k1CreationOptions = {
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
    });

    registerTests(
        () => credentialTester,
        () => referenceCredential,
        () => proofVerificationOptions,
        InvalidVerifiableCredentialError
    );
});

describe("Presentation proof verification", () => {
    let testContext: TestContext;
    let proofVerificationOptions: EcdsaSecp256k1VerificationOptions;
    let referencePresentation: VerifiablePresentation<EcdsaSecp256k1Proof>;
    const presentationTester = new Tester(
        (presentation) =>
            testContext.verifiablePresentationManager.verifyPresentation(
                presentation,
                proofVerificationOptions
            ),
        () => referencePresentation
    );

    before(async () => {
        testContext = await TestContext.initializeContext();
    });

    beforeEach(async () => {
        const firstReferenceCredential = {
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
                created: "",
                jws: "",
                proofPurpose: "assertionMethod",
                type: "EcdsaSecp256k1RecoverySignature2020",
                verificationMethod:
                    "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#assert-key-1"
            }
        };
        const secondReferenceCredential = ObjectUtils.copyObject(firstReferenceCredential);
        secondReferenceCredential.credentialStatus.id =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#revoc-2";
        secondReferenceCredential.expirationDate = DateUtils.toIsoDate(
            DateCreator.generate(2, TimeUnit.DAY)
        );

        const proofCreationOptions: EcdsaSecp256k1CreationOptions = {
            verificationMethod: `${testContext.issuerDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: testContext.issuerDid.privateKey,
            documentLoader: testContext.jsonLdContextLoader
        };
        proofVerificationOptions = {
            expectedProofPurpose: "assertionMethod",
            documentLoader: testContext.jsonLdContextLoader
        };
        referencePresentation = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.test.com/presentation"
            ],
            type: ["VerifiablePresentation", "TestPresentation"],
            verifiableCredential: [firstReferenceCredential, secondReferenceCredential],
            proof: {
                created: "",
                jws: "",
                proofPurpose: "assertionMethod",
                type: "EcdsaSecp256k1RecoverySignature2020",
                verificationMethod:
                    "did:ssi-cot-eth:1337:06d7de5a05b432646fdd7b3f41135403795d1189#assert-key-1"
            }
        };
        await ProofRegenerator.regeneratePresentationProof(
            referencePresentation,
            proofCreationOptions,
            testContext.proofManager
        );
    });

    registerTests(
        () => presentationTester,
        () => referencePresentation,
        () => proofVerificationOptions,
        InvalidVerifiablePresentationError
    );
});

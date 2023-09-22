import Chai from "chai";
import ChaiExclude from "chai-exclude";
import {InvalidVerifiablePresentationError} from "../../src/credential/InvalidVerifiablePresentationError";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {
    EcdsaSecp256k1CreationOptions,
    EcdsaSecp256k1VerificationOptions
} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023CredentialStatus} from "../../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiablePresentation} from "../../src/credential/VerifiablePresentation";
import {DateUtils} from "../../src/utils/DateUtils";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {ProofRegenerator} from "../utils/ProofRegenerator";
import {TestContext} from "../utils/TestContext";
import {Tester} from "../utils/Tester";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

describe("Verifiable presentation verification", () => {
    let testContext: TestContext;
    let proofCreationOptions: EcdsaSecp256k1CreationOptions;
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

    it("Presentation verification", () => presentationTester.toBeFulfilled());
    it("Presentation without contexts", () => {
        referencePresentation["@context"] = [];
        return presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });

    it("Presentation without first context", () => {
        referencePresentation["@context"].shift();
        return presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });
    it("Presentation with first context in wrong position", async () => {
        const element = referencePresentation["@context"].shift();
        referencePresentation["@context"].push(element || "");
        await ProofRegenerator.regeneratePresentationProof(
            referencePresentation,
            proofCreationOptions,
            testContext.proofManager
        );

        return presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });
    it("Missing contexts", () => {
        referencePresentation["@context"].pop();
        return presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });
    it("Presentation without types", () => {
        referencePresentation.type = [];
        presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });
    it("Presentation with wrong types", () => {
        const index = referencePresentation.type.indexOf("VerifiablePresentation");
        referencePresentation.type = referencePresentation.type.splice(index, 1);

        return presentationTester.toBeRejectedWith(InvalidVerifiablePresentationError);
    });
});

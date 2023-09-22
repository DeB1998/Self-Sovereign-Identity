import Chai, {expect} from "chai";
import ChaiExclude from "chai-exclude";
import {CredentialCreationOptions} from "../../src/credential/CredentialCreationOptions";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {EcdsaSecp256k1CreationOptions} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023CredentialStatus} from "../../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {InvalidDidError} from "../../src/resolver/InvalidDidError";
import {DateUtils} from "../../src/utils/DateUtils";
import {InvalidArgumentError} from "../../src/utils/InvalidArgumentError";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {TestContext} from "../utils/TestContext";
import {Tester} from "../utils/Tester";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

describe("Verifiable credential creation", () => {
    let testContext: TestContext;
    let credentialCreationOptions: CredentialCreationOptions<
        {
            id: string;
        },
        RevocationList2023CredentialStatus
    >;
    let proofCreationOptions: EcdsaSecp256k1CreationOptions;
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
    const credentialTester = new Tester(
        (_) =>
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            ),
        () => true
    );
    const credentialTesterNoStatus = new Tester(
        (_) =>
            testContext.verifiableCredentialManagerNoStatus.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            ),
        () => true
    );

    before(async () => {
        testContext = await TestContext.initializeContext();
    });

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
            expirationDate: DateCreator.generate(1, TimeUnit.DAY),
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
        referenceCredentialNoStatus = ObjectUtils.copyObject(referenceCredential);
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
    it("Invalid issuer", () => {
        credentialCreationOptions.issuer = "https//www.issuers.com/123";

        return credentialTester.toBeRejectedWith(InvalidDidError);
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

        const credential2 =
            await testContext.verifiableCredentialManagerNoStatus.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            );
        expect(credential2)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceCredentialNoStatus);
    });
    it("No status manager but status specified", () =>
        credentialTesterNoStatus.toBeRejectedWith(InvalidArgumentError));
    it("Status manager supporting a different type", () => {
        (credentialCreationOptions.credentialStatus!.type as string) = "NewType";

        return credentialTester.toBeRejectedWith(InvalidArgumentError);
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
            RevocationList2023CredentialStatus
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
    it("Invalid DID as verification method", () => {
        proofCreationOptions.verificationMethod = "did:example:123#abc";
        return credentialTester.toBeRejectedWith(InvalidArgumentError);
    });
    it("Invalid verification method DID URL", () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#abc";
        return credentialTester.toBeRejectedWith(InvalidArgumentError);
    });
    it("Invalid assertion method", () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#auth-key-1";
        return credentialTester.toBeRejectedWith(InvalidArgumentError);
    });
    it("Assertion method with different key", () => {
        proofCreationOptions.verificationMethod =
            "did:ssi-cot-eth:1337:06d7de5a05b432646fdd7b3f41135403795d1189#assert-key-1";

        return credentialTester.toBeRejectedWith(InvalidArgumentError);
    });
    it("Missing contexts", () => {
        credentialCreationOptions.additionalContexts.pop();
        return credentialTester.toBeRejectedWith("jsonld.ValidationError");
    });
});

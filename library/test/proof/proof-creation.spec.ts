import Chai, {expect} from "chai";
import ChaiExclude from "chai-exclude";
import {CredentialCreationOptions} from "../../src/credential/CredentialCreationOptions";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {EcdsaSecp256k1CreationOptions} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1ProofManager";
import {RevocationList2023CredentialStatus} from "../../src/credential/status/RevocationList2023CredentialStatus";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {VerifiablePresentation} from "../../src/credential/VerifiablePresentation";
import {VerifiablePresentationOptions} from "../../src/credential/VerifiablePresentationOptions";
import {DateUtils} from "../../src/utils/DateUtils";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {TestContext} from "../utils/TestContext";
import {ObjectWithProof} from "./ObjectWithProof";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

function registerTests<T extends ObjectWithProof>(
    proofCreationOptions: () => EcdsaSecp256k1CreationOptions,
    referenceValue: () => T,
    generator: () => Promise<T>
) {
    it("Proof with domain", async () => {
        proofCreationOptions().domain = "https://www.domain.com/my-domain";

        const credential = await generator();
        referenceValue().proof.domain = "https://www.domain.com/my-domain";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceValue());
    });
    it("Proof with challenge", async () => {
        proofCreationOptions().challenge = "https://www.domain.com/challenge-8";

        const credential = await generator();
        referenceValue().proof.challenge = "https://www.domain.com/challenge-8";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceValue());
    });
    it("Proof with domain and challenge", async () => {
        proofCreationOptions().domain = "https://www.domain.com/my-new-domain";
        proofCreationOptions().challenge = "https://www.domain.com/challenge-90";

        const credential = await generator();
        referenceValue().proof.domain = "https://www.domain.com/my-new-domain";
        referenceValue().proof.challenge = "https://www.domain.com/challenge-90";
        expect(credential)
            .excludingEvery(["created", "issuanceDate", "jws"])
            .to.deep.equal(referenceValue());
    });
}

describe("Credential proof creation", () => {
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
    });

    registerTests(
        () => proofCreationOptions,
        () => referenceCredential,
        () =>
            testContext.verifiableCredentialManager.createVerifiableCredential(
                credentialCreationOptions,
                proofCreationOptions
            )
    );
});

describe("Presentation proof creation", () => {
    let testContext: TestContext;
    let presentationCreationOptions: VerifiablePresentationOptions;
    let proofCreationOptions: EcdsaSecp256k1CreationOptions;
    let referencePresentation: VerifiablePresentation<EcdsaSecp256k1Proof>;

    before(async () => {
        testContext = await TestContext.initializeContext();
    });

    beforeEach(async () => {
        const credentialProofCreationOptions = {
            verificationMethod: `${testContext.issuerDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: testContext.issuerDid.privateKey,
            documentLoader: testContext.jsonLdContextLoader
        };
        const firstCredentialCreationOptions: CredentialCreationOptions<
            {
                id: string;
            },
            RevocationList2023CredentialStatus
        > = {
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
        const secondCredentialCreationOptions = ObjectUtils.copyObject(
            firstCredentialCreationOptions
        );
        secondCredentialCreationOptions.credentialStatus!.id =
            "did:ssi-cot-eth:1337:d14dac2057bd0bebf442fa3c5be5b2b69bbcbe35#revoc-2";
        secondCredentialCreationOptions.expirationDate = DateCreator.generate(2, TimeUnit.DAY);

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

        presentationCreationOptions = {
            additionalContexts: [
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.test.com/presentation"
            ],
            additionalTypes: ["TestPresentation"],
            verifiableCredentials: [
                await testContext.verifiableCredentialManager.createVerifiableCredential(
                    firstCredentialCreationOptions,
                    credentialProofCreationOptions
                ),
                await testContext.verifiableCredentialManager.createVerifiableCredential(
                    secondCredentialCreationOptions,
                    credentialProofCreationOptions
                )
            ]
        };
        proofCreationOptions = {
            verificationMethod: `${testContext.userDid.did}#assert-key-1`,
            proofPurpose: "assertionMethod",
            privateKey: testContext.userDid.privateKey,
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
    });

    registerTests(
        () => proofCreationOptions,
        () => referencePresentation,
        () =>
            testContext.verifiablePresentationManager.createVerifiablePresentation(
                presentationCreationOptions,
                proofCreationOptions
            )
    );
});

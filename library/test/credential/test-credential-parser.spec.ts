import * as Chai from "chai";
import ChaiExclude from "chai-exclude";
import {InvalidVerifiableCredentialError} from "../../src/credential/InvalidVerifiableCredentialError";
import {EcdsaSecp256k1Proof} from "../../src/credential/proof/ecdsa-secp256k1/EcdsaSecp256k1Proof";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {DateUtils} from "../../src/utils/DateUtils";
import {DateCreator, TimeUnit} from "../utils/DateCreator";
import {ObjectUtils} from "../utils/ObjectUtils";
import {RandomValues} from "../utils/RandomValues";
import {TestContext} from "../utils/TestContext";
import {Tester} from "../utils/Tester";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

interface TestCredentialObject {
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

describe("Credential parser", () => {
    let testContext: TestContext;
    let credential: TestCredentialObject;
    const credentialSubjectStructureValidator = (subject: object): subject is {id: string} => true;

    // verifiableCredentialManager, referenceCredential
    const parserTester = new Tester(
        async (valueToTest: any) =>
            testContext.verifiableCredentialManager.parseCredential(
                valueToTest,
                credentialSubjectStructureValidator
            ),
        () => credential as any
    );

    before(async () => {
        testContext = await TestContext.initializeContext();
    });

    beforeEach(async () => {
        credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld",
                "https://www.ssicot.com/certification-credential",
                "https://www.ssicot.com/RevocationList2023"
            ],
            id: "https://www.ids.com/id/123",
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

    it("Wrong types", () => {
        const values = Array.from<any>(RandomValues.VOID_VALUES).concat(
            RandomValues.NUMBER_VALUES,
            RandomValues.BOOLEAN_VALUES,
            RandomValues.ARRAY_VALUES
        );

        return parserTester.setInput(values).toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Wrong strings", () => {
        const values = Array.from<any>(RandomValues.VOID_VALUES).concat(
            RandomValues.NUMBER_VALUES,
            RandomValues.BOOLEAN_VALUES,
            RandomValues.ARRAY_VALUES
        );

        const stringifiedValues = values.map((value) => JSON.stringify(value));
        stringifiedValues.push(
            "sddssddsds",
            "eeeee",
            "{dddd: b",
            '"123;.',
            "[65",
            "{abc: 123, abc: 123}",
            '{"abc: 1"23, abc: 123}',
            "ef: 12",
            "{[87;}"
        );
        return parserTester
            .setInput(stringifiedValues)
            .toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Missing keys", () => {
        const keys = new Set<keyof VerifiableCredential<any, any, any>>([
            "@context",
            "type",
            "credentialSubject",
            "issuer",
            "issuanceDate",
            "proof"
        ]);

        const values: Partial<VerifiableCredential<any, any, any>>[] = [];
        for (const key of keys) {
            const newCredential = ObjectUtils.copyObject(credential) as Partial<
                VerifiableCredential<any, any, any>
            >;
            delete newCredential[key];
            values.push(newCredential);
            for (const key of keys) {
                const newCredential2 = ObjectUtils.copyObject(newCredential) as Partial<
                    VerifiableCredential<any, any, any>
                >;
                delete newCredential2[key];
                values.push(newCredential2);
            }
        }

        const stringifiedValues = values.map((value) => JSON.stringify(value));

        return parserTester
            .setInput(stringifiedValues)
            .toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Additional fields", () => {
        const additionalFields: [string, any][] = [
            ["newField", 3],
            ["anotherField", {abc: "sss", bcd: 3}],
            ["field", ["abc", "bcd", "ef"]],
            ["flag", true]
        ];

        const inputs: VerifiableCredential<any, any, any>[] = [];
        for (const [fieldName, fieldValue] of additionalFields) {
            const newCredential = ObjectUtils.copyObject(credential) as {[key: string]: any};
            newCredential[fieldName] = fieldValue;
            inputs.push(newCredential as any);
        }

        const stringifiedValues = inputs.map((value) => JSON.stringify(value));

        return parserTester.setInput(stringifiedValues).toBeFulfilled();
    });
    it("Random values to fields", () => {
        const keys: (keyof VerifiableCredential<any, any, any>)[] = [
            "@context",
            "id",
            "type",
            "credentialSubject",
            "issuer",
            "issuanceDate",
            "expirationDate",
            "credentialStatus",
            "proof"
        ];

        let credentials: VerifiableCredential<any, any, any>[] = [];
        const referenceRandomValues = Array.from<any>([null]).concat(
            RandomValues.NUMBER_VALUES,
            RandomValues.BOOLEAN_VALUES,
            RandomValues.ARRAY_VALUES
        );
        for (const key of keys) {
            let randomValues = referenceRandomValues;
            if (key !== "@context") {
                randomValues = randomValues.concat(RandomValues.OBJECT_VALUES);
            }
            if (
                key !== "issuer" &&
                key !== "expirationDate" &&
                key !== "issuanceDate" &&
                key !== "id"
            ) {
                randomValues = randomValues.concat(RandomValues.STRING_VALUES);
            }
            if (key !== "id" && key !== "credentialStatus" && key !== "expirationDate") {
                randomValues = randomValues.concat(undefined);
            }

            credentials = credentials.concat(
                ObjectUtils.assignRandomValues(credential, key, randomValues)
            );
        }

        const stringifiedValues = credentials.map((value) => JSON.stringify(value));

        return parserTester
            .setInput(stringifiedValues)
            .toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Wrong credential status", () => {
        let credentialStatuses = ObjectUtils.deleteAddProperties(credential.credentialStatus, [
            "aaaa",
            "bbbbb",
            "eeeee",
            "newField"
        ]);

        const referenceRandomValues = Array.from<any>(RandomValues.VOID_VALUES).concat(
            RandomValues.NUMBER_VALUES,
            RandomValues.BOOLEAN_VALUES,
            RandomValues.ARRAY_VALUES,
            RandomValues.OBJECT_VALUES
        );

        for (const key of ["id", "type"]) {
            let randomValues = referenceRandomValues;
            if (key === "type") {
                randomValues = randomValues.concat(RandomValues.STRING_VALUES);
            }
            credentialStatuses = credentialStatuses.concat(
                ObjectUtils.assignRandomValues(credential.credentialStatus, key, randomValues)
            );
        }

        const stringifiedValues = credentialStatuses.map((value) => {
            const newCredential = ObjectUtils.copyObject(credential);
            newCredential.credentialStatus = value;
            JSON.stringify(newCredential);
        });

        return parserTester
            .setInput(stringifiedValues)
            .toBeRejectedWith(InvalidVerifiableCredentialError);
    });
    it("Wrong proof", () => {
        const keys: (keyof EcdsaSecp256k1Proof)[] = [
            "type",
            "created",
            "verificationMethod",
            "proofPurpose",
            "jws",
            "domain",
            "challenge"
        ];

        let proofs = ObjectUtils.deleteAddProperties(credential.proof, [
            "aaaa",
            "bbbbb",
            "eeeee",
            "newField"
        ]);

        const referenceRandomValues = Array.from<any>([null]).concat(
            RandomValues.NUMBER_VALUES,
            RandomValues.BOOLEAN_VALUES,
            RandomValues.ARRAY_VALUES
        );

        for (const key of keys) {
            let randomValues = Array.from(referenceRandomValues);
            if (key === "type") {
                randomValues = randomValues.concat(RandomValues.STRING_VALUES);
            }
            if (key !== "domain" && key !== "challenge") {
                randomValues = randomValues.concat([undefined]);
            }

            proofs = proofs.concat(
                ObjectUtils.assignRandomValues(credential.proof, key, randomValues)
            );
        }

        const stringifiedValues = proofs.map((value) => {
            const newCredential = ObjectUtils.copyObject(credential);
            newCredential.proof = value;
            JSON.stringify(newCredential);
        });

        return parserTester
            .setInput(stringifiedValues)
            .toBeRejectedWith(InvalidVerifiableCredentialError);
    });
});

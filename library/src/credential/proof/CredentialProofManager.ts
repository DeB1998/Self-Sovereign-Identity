import {LanguageMap} from "jsonld/jsonld";
import {Credential} from "../Credential";
import {VerifiableCredential} from "../VerifiableCredential";
import {Proof} from "./Proof";

export interface CredentialProofManager<P extends Proof, C, V> {
    createCredentialProof<T extends LanguageMap>(
        credentialData: Credential<T, any>,
        creationOptions: C
    ): Promise<P>;

    checkStructureValidity(proofObject: object): proofObject is P;

    verifyCredentialProof<T extends LanguageMap>(
        verifiableCredential: VerifiableCredential<T, P, any>,
        verificationOptions: V
    ): Promise<void>;
}

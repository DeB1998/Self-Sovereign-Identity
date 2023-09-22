import {LanguageMap} from "jsonld/jsonld";
import {JsonLdContext} from "../utils/JsonLdContext";
import {Proof} from "./proof/Proof";
import {CredentialStatus} from "./status/CredentialStatus";

export interface VerifiableCredential<
    T extends LanguageMap,
    P extends Proof,
    CS extends CredentialStatus
> {
    "@context": JsonLdContext[];
    id?: string;
    type: string[];
    credentialSubject: T;
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialStatus?: CS;
    proof: P;
}

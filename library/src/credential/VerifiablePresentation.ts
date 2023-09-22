import {JsonLdContext} from "../utils/JsonLdContext";
import {Proof} from "./proof/Proof";
import {VerifiableCredential} from "./VerifiableCredential";

export interface VerifiablePresentation<P extends Proof> {
    "@context": JsonLdContext[];
    id?: string;
    type: string[];
    verifiableCredential?:
        | VerifiableCredential<any, any, any>
        | VerifiableCredential<any, any, any>[];
    holder?: string;
    proof: P;
}

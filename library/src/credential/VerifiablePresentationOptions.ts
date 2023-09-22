import {JsonLdContext} from "../utils/JsonLdContext";
import {VerifiableCredential} from "./VerifiableCredential";

export interface VerifiablePresentationOptions {
    additionalContexts: JsonLdContext[];
    id?: string;
    additionalTypes: string[];
    holder?: string;
    verifiableCredentials?:
        | VerifiableCredential<any, any, any>
        | VerifiableCredential<any, any, any>[];
}

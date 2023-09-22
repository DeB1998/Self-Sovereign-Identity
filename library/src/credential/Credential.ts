import {LanguageMap} from "jsonld/jsonld";
import {CredentialStatus} from "./status/CredentialStatus";
import {VerifiableCredential} from "./VerifiableCredential";

/**
 * Basic type of all the credentials.
 * Note that a credential is just a verifiable credential without the <code>proof</code> property.
 */
export type Credential<T extends LanguageMap, CS extends CredentialStatus> = Omit<
    VerifiableCredential<T, any, CS>,
    "proof"
>;

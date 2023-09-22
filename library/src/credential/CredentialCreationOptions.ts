import {LanguageMap} from "jsonld/jsonld";
import {JsonLdContext} from "../utils/JsonLdContext";
import {CredentialStatus} from "./status/CredentialStatus";

/**
 * Interface describing the options that can be specified to customize the properties of a
 * verifiable credential when it is created.
 */
export interface CredentialCreationOptions<
    T extends LanguageMap,
    CS extends CredentialStatus | undefined = undefined
> {
    /**
     * Additional JSON-LD contexts that will be added to the <code>@context</code> property of the
     * verifiable credential after the <code>https://www.w3.org/2018/credentials/v1</code> JSON-LD
     * context URL.
     *
     * Note that all the values specified in this property are directly appended at the end of the
     * <code>@context</code> property, hence no check is performed to detect and
     * possibly remove duplicated context URLs or definitions.
     *
     * This property is not optional because it is supposed that additional JSON-LD contexts are
     * required to correctly process the information stored in the <code>credentialSubject</code>
     * property of the credential.
     */
    additionalContexts: JsonLdContext[];

    /**
     * Identifier that uniquely identifies the verifiable credential.
     *
     * If this property is omitted or set to <code>undefined</code>, then the verifiable credential
     * will have no identifier.
     */
    id?: string;

    /**
     * Types of the verifiable credential, without <code>VerifiableCredential</code>.
     *
     * This property is not optional because it is supposed that additional types are
     * required to correctly process the information stored in the <code>credentialSubject</code>
     * property of the credential.
     */
    additionalTypes: string | string[];

    /**
     * Subject of the verifiable credential.
     */
    credentialSubject: T;

    /**
     * DID of the issuer of the verifiable credential.
     */
    issuer: string;

    /**
     * Date and time after which the verifiable credential is not considered valid anymore.
     *
     * If this property is omitted or set to <code>undefined</code>, then the verifiable credential
     * will never expire, i.e., it will be always valid.
     */
    expirationDate?: Date;

    /**
     * Information that anyone receiving the credential can use to check its status (e.g., if it
     * has been revoked).
     *
     * If this property is omitted or set to <code>undefined</code>, then the verifiable credential
     * will never expire, i.e., it will be always valid.
     */
    credentialStatus?: CS | undefined;
}

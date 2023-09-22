import {TrustCertification} from "../resolver/DidTypes";
import {TrustedIssuers} from "./TrustedIssuers";

/**
 * Interface describing the options that are used when
 */
export interface CredentialVerificationOptions {
    trustedIssuers: TrustedIssuers;
    // true -> continue
    // false -> stop
    onRevokedCertification?: (
        issuer: string,
        entity: string,
        trustCertification: TrustCertification,
        chainOfTrust: TrustCertification[]
    ) => Promise<boolean>;
}

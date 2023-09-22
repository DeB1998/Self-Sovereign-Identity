import Chai from "chai";
import ChaiExclude from "chai-exclude";

Chai.use(ChaiExclude);
Chai.config.truncateThreshold = 0;

describe("Credential issuers", () => {
    /* TODO:
    A -> B -> C
    D -> E

    direct A
    direct E
    chain B
    chain D
    blacklist E
    blacklist B
    blacklist chain B
    blacklist chain E

    // Extract the issuer
        const issuer = verifiableCredential.issuer;

        if (options.trustedIssuers.blacklistedIssuers.has(issuer)) {
            throw new InvalidVerifiableCredentialError(
                "The issuer of the verifiable credential is blacklisted"
            );
        }

        let isIssuerTrusted = options.trustedIssuers.directIssuers.has(issuer);
        if (!isIssuerTrusted) {
            const trustedChainIssuers = options.trustedIssuers.chainIssuers;

            // Retrieve the issuer chain
            const issuerChainResult = await this.didResolver.resolveChain(issuer);
            if (DidUtils.isChainResolutionErrored(issuerChainResult)) {
                throw new InvalidVerifiableCredentialError(
                    `Cannot retrieve the chain of trust of the DID '${issuer}: ${issuerChainResult.resolutionMetadata.errorMessage}`
                );
            }

            // Check the chain
            isIssuerTrusted = trustedChainIssuers.has(issuer);
            if (!isIssuerTrusted) {
                for (const issuerTrustCertification of issuerChainResult.chainStream.trustChain) {
                    isIssuerTrusted = trustedChainIssuers.has(issuerTrustCertification.issuer);

                    if (
                        issuerTrustCertification.certificationStatus ===
                        TrustCertificationStatus.REVOKED
                    ) {
                        if (options.onRevokedCertification !== undefined) {
                            isIssuerTrusted = options.onRevokedCertification(
                                issuerTrustCertification,
                                isIssuerTrusted
                            );
                        } else {
                            throw new InvalidVerifiableCredentialError(
                                "The issuer may be trusted, but at least one certification hin its trust chain been revoked"
                            );
                        }
                    } else if (trustedChainIssuers.has(issuerTrustCertification.issuer)) {
                        isIssuerTrusted = true;
                        break;
                    }
                }
            }
        }
        if (!isIssuerTrusted) {
            throw new InvalidVerifiableCredentialError(
                "The issuer of the verifiable credential is not trusted"
            );
        }
     */
});

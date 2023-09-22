export interface TrustedIssuers {
    directIssuers: Set<string>;
    chainIssuers: Set<string>;
    blacklistedIssuers: Set<string>;
}

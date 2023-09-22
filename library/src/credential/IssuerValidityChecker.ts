export interface IssuerValidityChecker {
    checkValidity(issuer: string): Promise<void>;
}

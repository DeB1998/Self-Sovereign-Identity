import {CredentialStatus} from "./CredentialStatus";

export interface CredentialStatusManager<CS extends CredentialStatus> {
    canHandleType(credentialStatusType: string): boolean;

    checkStructureValidity(credentialStatus: object): credentialStatus is CS;

    checkCredentialStatusValidity(credentialStatus: CS): Promise<void>;

    verifyStatus(credentialStatus: CS): Promise<void>;
}

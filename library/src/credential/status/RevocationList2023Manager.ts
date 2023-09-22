import {DidResolver} from "../../resolver/DidResolver";
import {RevocationStatus} from "../../resolver/DidTypes";
import {DidUtils} from "../../resolver/DidUtils";
import {InvalidArgumentError} from "../../utils/InvalidArgumentError";
import {InvalidCredentialStatusError} from "../InvalidCredentialStatusError";
import {InvalidVerifiableCredentialError} from "../InvalidVerifiableCredentialError";
import {ProofVerificationMethodUtils} from "../utils/ProofVerificationMethodUtils";
import {CredentialStatusManager} from "./CredentialStatusManager";
import {RevocationList2023CredentialStatus} from "./RevocationList2023CredentialStatus";

export class RevocationList2023Manager
    implements CredentialStatusManager<RevocationList2023CredentialStatus>
{
    private readonly didResolver: DidResolver;

    constructor(resolver: DidResolver) {
        this.didResolver = resolver;
    }

    public canHandleType(
        credentialStatusType: string
    ): credentialStatusType is "RevocationList2023" {
        return credentialStatusType === "RevocationList2023";
    }

    public checkStructureValidity(
        credentialStatus: object
    ): credentialStatus is RevocationList2023CredentialStatus {
        const keys = Object.keys(credentialStatus);

        if (keys.length !== 2) {
            throw new InvalidCredentialStatusError(
                "A valid RevocationList2023 credential status must contain exactly 2 properties"
            );
        }
        let id: string;
        let type: string;
        if (keys[0] === "id" && keys[1] === "type") {
            id = keys[0];
            type = keys[1];
        } else if (keys[0] === "type" && keys[1] === "id") {
            id = keys[1];
            type = keys[0];
        } else {
            throw new InvalidCredentialStatusError(
                "A valid RevocationList2023 credential status must contain only the 2 properties 'id' and 'type'"
            );
        }
        const credentialStatusObject = credentialStatus as {id: any; type: any};
        if (typeof credentialStatusObject.id !== "string") {
            throw new InvalidCredentialStatusError(
                "The 'id' property of a credential status must be a string"
            );
        }

        if (
            typeof credentialStatusObject.type !== "string" ||
            credentialStatusObject.type !== "RevocationList2023"
        ) {
            throw new InvalidCredentialStatusError(
                "The 'type' property of a valid RevocationList2023 credential status must be the string 'RevocationList2023'"
            );
        }
        return true;
    }

    public async checkCredentialStatusValidity(
        credentialStatus: RevocationList2023CredentialStatus
    ) {
        const credentialStatusDidUrl = DidUtils.parseDidUrl(credentialStatus.id);
        if (!DidUtils.isValidDidUrl(credentialStatusDidUrl, await this.didResolver.getChainId())) {
            throw new InvalidArgumentError(
                "The 'credentialStatus.id' property is not a valid DID URL"
            );
        }
    }

    public async verifyStatus(credentialStatus: RevocationList2023CredentialStatus) {
        await this.checkCredentialStatusValidity(credentialStatus);

        const dereferencingResult = await ProofVerificationMethodUtils.checkForDereferencingErrors(
            this.didResolver,
            credentialStatus.id,
            (resolver, url, options) => resolver.resolveCredentialStatus(url, options),
            "The 'credentialStatus.id' is not a valid DID URL",
            "The credential status cannot be found",
            InvalidVerifiableCredentialError
        );
        if (!DidUtils.isRevocationList2023Status(dereferencingResult)) {
            throw new InvalidVerifiableCredentialError(
                "The 'credentialStatus.id' DID URL does not resolve to a valid resource"
            );
        }
        const revocationStatus = dereferencingResult.contentStream as RevocationStatus;
        if (revocationStatus.revoked) {
            throw new InvalidVerifiableCredentialError(
                "The verifiable credential has been revoked"
            );
        }
    }
}

import {DidResolver} from "../resolver/DidResolver";
import {DidUtils} from "../resolver/DidUtils";
import {InvalidDidError} from "../resolver/InvalidDidError";
import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {IssuerValidityChecker} from "./IssuerValidityChecker";

export class IssuerDidValidityChecker implements IssuerValidityChecker {
    private readonly didResolver: DidResolver;

    constructor(didResolver: DidResolver) {
        this.didResolver = didResolver;
    }

    public async checkValidity(issuer: string) {
        // Check the parameters
        const chainId = await this.didResolver.getChainId();
        if (!DidUtils.isValidDid(issuer, chainId)) {
            throw new InvalidDidError("The issuer DID is not a valid DID");
        }
    }
}

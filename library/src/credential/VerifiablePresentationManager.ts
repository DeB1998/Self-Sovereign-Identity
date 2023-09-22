import Web3 from "web3";
import {DidResolver} from "../resolver/DidResolver";
import {DidUtils} from "../resolver/DidUtils";
import {InvalidDidError} from "../resolver/InvalidDidError";
import {InvalidArgumentError} from "../utils/InvalidArgumentError";
import {JsonLdContext} from "../utils/JsonLdContext";
import {InvalidVerifiablePresentationError} from "./InvalidVerifiablePresentationError";
import {Presentation} from "./Presentation";
import {PresentationProofManager} from "./proof/PresentationProofManager";
import {Proof} from "./proof/Proof";
import {VerifiablePresentation} from "./VerifiablePresentation";
import {VerifiablePresentationOptions} from "./VerifiablePresentationOptions";

export class VerifiablePresentationManager<
    P extends Proof,
    C,
    V,
    M extends PresentationProofManager<P, C, V>
> {
    private static readonly VERIFIABLE_PRESENTATIONS_CONTEXT =
        "https://www.w3.org/2018/credentials/v1";
    private didResolver: DidResolver;
    private proofManager: M;

    constructor(web3: Web3, didResolver: DidResolver, proofManager: M) {
        this.didResolver = didResolver;
        this.proofManager = proofManager;
    }

    public async createVerifiablePresentation(
        options: VerifiablePresentationOptions,
        proofCreationOptions: C
    ) {
        // Set the contexts
        const contexts = new Set<JsonLdContext>([
            VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT,
            ...options.additionalContexts
        ]);
        // Set the types
        const types = new Set<string>(["VerifiablePresentation", ...options.additionalTypes]);
        // Create the presentation
        const presentation: Presentation = {
            "@context": Array.from(contexts),
            type: Array.from(types)
        };
        // Add optional fields
        if (options.id !== undefined) {
            presentation.id = options.id;
        }
        const credentials = options.verifiableCredentials;
        if (
            credentials !== undefined &&
            ((Array.isArray(credentials) && credentials.length !== 0) ||
                !Array.isArray(credentials))
        ) {
            presentation.verifiableCredential = credentials;
        }
        if (options.holder !== undefined) {
            const chainId = await this.didResolver.getChainId();
            if (!DidUtils.isValidDid(options.holder, chainId)) {
                throw new InvalidDidError("The holder is not a valid DID");
            }
            presentation.holder = options.holder;
        }

        // Generate the proof
        const proof = await this.proofManager.createPresentationProof(
            presentation,
            proofCreationOptions
        );

        const credentialWithProof = presentation as VerifiablePresentation<P>;
        credentialWithProof.proof = proof;

        return credentialWithProof;
    }

    public async verifyPresentation(
        verifiablePresentation: VerifiablePresentation<P>,
        proofVerificationOptions: V
    ) {
        // Check the context
        if (
            verifiablePresentation["@context"].length === 0 ||
            verifiablePresentation["@context"][0] !==
                VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT
        ) {
            throw new InvalidVerifiablePresentationError(
                `Any valid verifiable presentation must specify '${VerifiablePresentationManager.VERIFIABLE_PRESENTATIONS_CONTEXT}' as the first context`
            );
        }
        // Check the type
        if (!verifiablePresentation.type.includes("VerifiablePresentation")) {
            throw new InvalidVerifiablePresentationError(
                "Any valid verifiable presentation must contain the type 'VerifiablePresentation'"
            );
        }
        // Check the holder
        if (verifiablePresentation.holder !== undefined) {
            const chainId = await this.didResolver.getChainId();
            if (!DidUtils.isValidDid(verifiablePresentation.holder, chainId)) {
                throw new InvalidArgumentError("The holder is not a valid DID");
            }
        }
        // Verify the proof
        try {
            await this.proofManager.verifyPresentationProof(
                verifiablePresentation,
                proofVerificationOptions
            );
        } catch (e: unknown) {
            throw new InvalidVerifiablePresentationError(
                "The integrity of the verifiable presentation cannot be validated",
                e
            );
        }
    }
}

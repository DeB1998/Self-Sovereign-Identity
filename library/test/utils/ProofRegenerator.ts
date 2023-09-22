import {Credential} from "../../src/credential/Credential";
import {Presentation} from "../../src/credential/Presentation";
import {CredentialProofManager} from "../../src/credential/proof/CredentialProofManager";
import {PresentationProofManager} from "../../src/credential/proof/PresentationProofManager";
import {Proof} from "../../src/credential/proof/Proof";
import {VerifiableCredential} from "../../src/credential/VerifiableCredential";
import {VerifiablePresentation} from "../../src/credential/VerifiablePresentation";

export class ProofRegenerator {
    public static async regenerateCredentialProof<P extends Proof, C>(
        verifiableCredential: VerifiableCredential<any, P, any>,
        proofCreationOptions: C,
        proofManager: CredentialProofManager<P, C, any>
    ) {
        delete (verifiableCredential as {proof?: any}).proof;
        const credential = verifiableCredential as Credential<P, any>;

        // Generate the proof
        // Add the proof
        verifiableCredential.proof = await proofManager.createCredentialProof(
            credential,
            proofCreationOptions
        );
    }

    public static async regeneratePresentationProof<P extends Proof, C>(
        verifiablePresentation: VerifiablePresentation<P>,
        proofCreationOptions: C,
        proofManager: PresentationProofManager<P, C, any>
    ) {
        delete (verifiablePresentation as {proof?: any}).proof;
        const presentation = verifiablePresentation as Presentation;

        // Generate the proof
        // Add the proof
        verifiablePresentation.proof = await proofManager.createPresentationProof(
            presentation,
            proofCreationOptions
        );
    }
}

import {LanguageMap} from "jsonld/jsonld";
import {Presentation} from "../Presentation";
import {VerifiablePresentation} from "../VerifiablePresentation";
import {Proof} from "./Proof";

export interface PresentationProofManager<P extends Proof, C, V> {
    createPresentationProof<T extends LanguageMap>(
        presentationData: Presentation,
        creationOptions: C
    ): Promise<P>;

    checkStructureValidity(proofObject: object): proofObject is P;

    verifyPresentationProof<T extends LanguageMap>(
        verifiablePresentation: VerifiablePresentation<P>,
        verificationOptions: V
    ): Promise<void>;
}

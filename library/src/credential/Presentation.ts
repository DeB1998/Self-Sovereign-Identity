import {VerifiablePresentation} from "./VerifiablePresentation";

export type Presentation = Omit<VerifiablePresentation<any>, "proof">;

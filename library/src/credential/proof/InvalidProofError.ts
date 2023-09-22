export class InvalidProofError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, {cause});
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidProofError.prototype);
    }
}

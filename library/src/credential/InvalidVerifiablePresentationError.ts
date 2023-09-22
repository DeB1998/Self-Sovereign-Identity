/**
 * Error thrown when a verifiable presentation contains invalid information (e.g., the signature
 * is not valid)
 */
export class InvalidVerifiablePresentationError extends Error {

    /**
     * Creates a new error thrown when a verifiable credential contains invalid information.
     *
     * @param message Message describing why this error has been generated.
     */
    constructor(message: string, cause?: unknown) {
        super(message, {cause});
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidVerifiablePresentationError.prototype);
        this.name = "InvalidVerifiablePresentationError"
    }
}

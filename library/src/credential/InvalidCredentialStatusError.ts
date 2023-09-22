/**
 * Error thrown when a verifiable credential contains invalid information, like when it is expired,
 * of if the signature is not valid.
 */
export class InvalidCredentialStatusError extends Error {
    /**
     * Creates a new error thrown when a verifiable credential contains invalid information.
     *
     * @param message Message describing why this error has been generated.
     */
    constructor(message: string, cause?: unknown) {
        super(message, {cause});
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidCredentialStatusError.prototype);
        this.name = "InvalidCredentialStatusError"
    }
}

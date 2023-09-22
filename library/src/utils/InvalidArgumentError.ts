/**
 * Error thrown when one or more of the arguments supplied to function are not correct.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */
export class InvalidArgumentError extends Error {
    /**
     * Creates a new error thrown when one or more of the arguments supplied to a function are not
     * correct.
     *
     * @param message Message describing why this error has been generated.
     */
    constructor(message: string, cause?: unknown) {
        super(message, {cause});
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidArgumentError.prototype);
        this.name = "InvalidArgumentError";
    }
}

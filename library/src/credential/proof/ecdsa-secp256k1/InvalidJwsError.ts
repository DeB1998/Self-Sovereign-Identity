export class InvalidJwsError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, {
            cause
        });
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidJwsError.prototype);
        this.name = "InvalidJwsError";
    }
}

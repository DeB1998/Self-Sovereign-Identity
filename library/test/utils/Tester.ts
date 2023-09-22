import {assert} from "chai";

export class Tester<T> {
    private functionToTest: (input: T) => Promise<any>;
    private defaultInput: () => T;
    private input: T[] | undefined;

    constructor(functionToTest: (input: T) => Promise<any>, defaultInput: () => T) {
        this.functionToTest = functionToTest;
        this.defaultInput = defaultInput;
        this.input = undefined;
    }

    private setInternalInput(input: T[]) {
        this.input = input;
    }

    public setInput(input: T | T[]): Tester<T> {
        const newInput = Array.isArray(input) ? input : [input];

        const newTester = new Tester<T>(this.functionToTest, this.defaultInput);
        newTester.setInternalInput(newInput);

        return newTester;
    }

    public async toBeFulfilled(): Promise<void> {
        try {
            const functionInputs = this.input === undefined ? [this.defaultInput()] : this.input;
            for (const functionInput of functionInputs) {
                await this.functionToTest(functionInput);
            }
            assert(true);
        } catch (e: unknown) {
            let message = "The promise should be fulfilled, but it was rejected with error:\n";
            if (e instanceof Error) {
                message += `${Tester.getPrintableError(e)}\n\n`;
            } else {
                message = Tester.getPrintableUnknown(e);
            }
            assert(false, message);
        }
    }

    public async toBeRejectedWith(constructor: Function | string): Promise<void> {
        const message = `The promise should be rejected with error ${
            typeof constructor === "string" ? constructor : constructor.name
        }`;
        try {
            const functionInputs = this.input === undefined ? [this.defaultInput()] : this.input;
            for (const functionInput of functionInputs) {
                await this.functionToTest(functionInput);
            }
            assert(false, `${message}, but it was fulfilled`);
        } catch (e) {
            if (
                (typeof e === "object" &&
                    e !== null &&
                    typeof constructor === "string" &&
                    "name" in e &&
                    e.name === constructor) ||
                (typeof constructor !== "string" && e instanceof constructor)
            ) {
                assert(true);
            } else if (e instanceof Error) {
                assert(
                    false,
                    `${message}, but it was rejected with error:\n${Tester.getPrintableError(
                        e
                    )}\n\n`
                );
            } else {
                assert(
                    false,
                    `${message}, but it was rejected with ${Tester.getPrintableUnknown(e)}`
                );
            }
        }
    }

    private static getPrintableError(error: Error) {
        let message = `${error.stack}\n`;
        const cause = error.cause;
        if (cause instanceof Error) {
            message += `Caused by:\n${Tester.getPrintableError(cause)}`;
        }
        return message;
    }

    private static getPrintableUnknown(unknown: unknown) {
        if (typeof unknown === "object") {
            return unknown === null ? "null" : unknown.toString();
        } else if (typeof unknown === "undefined") {
            return "undefined";
        } else {
            return unknown.toString();
        }
    }
}

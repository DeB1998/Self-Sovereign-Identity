import * as ChildProcess from "child_process";
import "colors";
import {PathLike} from "fs";
import * as os from "os";
import {Logger} from "./Logger";

class LinePrinter {
    private lastLine: string;

    constructor() {
        this.lastLine = "";
    }

    public logLines(data: Buffer): void {
        // Convert the buffer to a string
        const stringBuffer = data.toString();
        // Concatenate the last line with the buffer
        const fullStringBuffer = this.lastLine + stringBuffer;

        // Divide the string into lines
        const lines = fullStringBuffer.split(/\r?\n/);
        // Extract the last line
        const newLastLine = lines.pop();
        if (newLastLine === undefined) {
            this.lastLine = "";
        } else {
            this.lastLine = newLastLine;
        }
        // Print the other lines
        for (const line of lines) {
            Logger.log(line);
        }
    }

    public close(): void {
        if (this.lastLine !== "") {
            Logger.log(this.lastLine);
        }
    }
}

export class ProcessUtils {
    // Get the command based on the patform
    private static NPX_COMMAND = os.platform() === "win32" ? "npx.cmd" : "npx";
    private static NPM_COMMAND = os.platform() === "win32" ? "npm.cmd" : "npm";

    public static async executeOrExitNpx(
        command: string,
        args: string[],
        errorMessage: string,
        cwd = process.cwd()
    ): Promise<void> {
        return ProcessUtils.executeOrExit(
            ProcessUtils.NPX_COMMAND,
            [command, ...args],
            errorMessage,
            cwd
        );
    }

    public static async executeOrExitNpm(
        command: string,
        args: string[],
        errorMessage: string,
        packageJsonLocation?: PathLike,
        cwd = process.cwd()
    ): Promise<void> {
        const additionParameters =
            packageJsonLocation === undefined ? [] : ["--prefix", packageJsonLocation.toString()];

        return ProcessUtils.executeOrExit(
            ProcessUtils.NPM_COMMAND,
            [...additionParameters, command, ...args],
            errorMessage,
            cwd
        );
    }

    public static async executeOrExit(
        command: string,
        args: string[],
        errorMessage: string,
        cwd = process.cwd()
    ): Promise<void> {
        try {
            const exitCode = await ProcessUtils.startProcess(command, args, cwd);
            if (exitCode !== 0) {
                console.error(`Command exited with code ${exitCode}`.red);
                console.error(errorMessage.red);
                process.exit(1);
            }
        } catch (exception: unknown) {
            console.error(errorMessage.red);
            console.error(exception);
            process.exit(2);
        }
    }

    public static async startProcess(
        command: string,
        args: string[],
        cwd = process.cwd()
    ): Promise<number> {
        const childProcess = ChildProcess.spawn(command, args, {cwd});

        return ProcessUtils.waitForProcessTermination(childProcess);
    }

    public static async executeNodeProcessOrExit(
        fileToRun: string,
        args: string[],
        cwd = process.cwd()
    ): Promise<void> {
        try {
            const childProcess = ChildProcess.fork(fileToRun, args, {cwd});
            const exitCode = await ProcessUtils.waitForProcessTermination(childProcess);
            if (exitCode !== 0) {
                console.error(`Command exited with code ${exitCode}`.red);
                process.exit(1);
            }
        } catch (exception: unknown) {
            console.error((exception as Error).message.red);
            process.exit(2);
        }
    }

    private static async waitForProcessTermination(
        childProcess: ChildProcess.ChildProcess
    ): Promise<number> {
        const stdOutLinePrinter = new LinePrinter();
        childProcess.stdout?.on("data", (chunk) => stdOutLinePrinter.logLines(chunk));
        const stdErrLinePrinter = new LinePrinter();
        childProcess.stderr?.on("data", (chunk) => stdErrLinePrinter.logLines(chunk));

        return new Promise<number>((resolve, reject) => {
            childProcess.on("exit", (code: number | null) => {
                stdOutLinePrinter.close();
                stdErrLinePrinter.close();
                resolve(code === null ? -1 : code);
            });
            childProcess.on("error", (error) => reject(error));
        });
    }
}

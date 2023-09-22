import {FileUtils} from "./utils/FileUtils";
import {Logger} from "./utils/Logger";
import {ProcessUtils} from "./utils/ProcessUtils";

async function main(): Promise<void> {
    // Check the arguments
    if (process.argv.length !== 3) {
        Logger.error(`The program expects 1 argument, but ${process.argv.length - 2} were given.`);
        process.exit(1);
    }
    // Compile Typescript
    const fileUtils = new FileUtils("./build/test-info", "./src/test");
    if (await fileUtils.hasChanged()) {
        Logger.info("Compiling the tests");
        await ProcessUtils.executeOrExitNpx(
            "tsc",
            ["-p", "./tsconfig.json"],
            "Unable to compile the test code"
        );
        await fileUtils.updateBuildInfo();
    } else {
        Logger.info("All tests are up-to-date");
    }
    // Execute the test
    Logger.info("Testing the contract");
    await ProcessUtils.executeOrExitNpx(
        "truffle",
        ["exec", `./build/src/test/${process.argv[2]}`, "--network", "development"],
        "Unable to run the test"
    );
    Logger.info("Done");
}

main().then();

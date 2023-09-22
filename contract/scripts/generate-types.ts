import {Logger} from "./utils/Logger";
import {ProcessUtils} from "./utils/ProcessUtils";
import {FileUtils} from "./utils/FileUtils";
import * as colors from "colors";

colors.enable();

async function main(): Promise<void> {
    // Check if the files has been changed
    const fileUtils = new FileUtils(
        "./build/contracts-types-info",
        "./src/contracts",
        "./build/src/contracts",
        "./types/truffle-contracts",
        "../library/types"
    );
    if (await fileUtils.hasChanged()) {
        // Generate the types
        Logger.info("Generating Truffle types");
        await ProcessUtils.executeOrExitNpx(
            "typechain",
            ["--target=truffle-v5", "build/src/contracts/*.json"],
            "Unable to generate the types"
        );
        Logger.info("Generating web3.js types");
        await ProcessUtils.executeOrExitNpm(
            "run",
            ["build-types"],
            "Unable to generate the types",
            "../library"
        );
        await fileUtils.updateBuildInfo();
        Logger.info("Done");
    } else {
        Logger.info("All types are up-to-date");
    }
}

main().then();

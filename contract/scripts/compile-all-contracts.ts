import {Logger} from "./utils/Logger";
import {ProcessUtils} from "./utils/ProcessUtils";
import {FileUtils} from "./utils/FileUtils";
import * as colors from "colors";

colors.enable();

async function main(): Promise<void> {
    // Check if the files has been changed
    const fileUtils = new FileUtils(
        "./build/contracts-build-info",
        "./src/contracts",
        "./build/src/contracts"
    );
    if (await fileUtils.hasChanged()) {
        // Compile the contracts
        Logger.info(`Compiling all contracts`);
        await ProcessUtils.executeOrExitNpx(
            "truffle",
            ["compile", "--network", "development"],
            "Unable to compile the contract"
        );
        await fileUtils.updateBuildInfo();
        Logger.info("Done");
    } else {
        Logger.info("All contracts are up-to-date");
    }
}

main().then();

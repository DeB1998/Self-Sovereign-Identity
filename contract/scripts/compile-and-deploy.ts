import {FileUtils} from "./utils/FileUtils";
import {Logger} from "./utils/Logger";
import {ProcessUtils} from "./utils/ProcessUtils";

async function main(): Promise<void> {
    // Compile all contracts
    await ProcessUtils.executeNodeProcessOrExit("./build/scripts/compile-all-contracts.js", []);
    // Generate the types
    await ProcessUtils.executeNodeProcessOrExit("./build/scripts/generate-types.js", []);

    // Build the migrations scripts
    const fileUtils = new FileUtils(
        "./build/migrations-build-info",
        "./src/migrations",
        "./build/src/migrations"
    );
    if (await fileUtils.hasChanged()) {
        Logger.info("Compiling the migration scripts");
        await ProcessUtils.executeOrExitNpx(
            "tsc",
            ["-p", "./tsconfig.json"],
            "Unable to compile the migration scripts"
        );
        await fileUtils.updateBuildInfo();
        Logger.info("Done");
    } else {
        Logger.info("All migration scripts are up-to-date");
    }

    // Deploy the contracts
    await ProcessUtils.executeNodeProcessOrExit(
        "./build/scripts/deploy-compiled-contract.js",
        process.argv.slice(2)
    );
}

main().then();

// npm run deploy-only

import {FileUtils} from "./utils/FileUtils";
import {Logger} from "./utils/Logger";
import {ProcessUtils} from "./utils/ProcessUtils";

async function main(): Promise<void> {
    // Check the arguments
    if (process.argv.length < 2 && process.argv.length > 4) {
        Logger.error(
            `The program expects 1 to 3 arguments, but ${process.argv.length - 2} were given.`
        );
        process.exit(1);
    }
    // Compute the arguments
    const processArguments = ["migrate", "--network", "development", "--compile-none"];
    let contractsCount = 0;
    if (process.argv.length > 2) {
        const from = parseInt(process.argv[2] || "0");
        const to = process.argv.length === 3 ? from : parseInt(process.argv[3] || "0");
        processArguments.push("--f", String(from), "--to", String(to));
        contractsCount = to - from + 1;
    }

    // Migrate the contracts
    Logger.info(
        `Migrating ${contractsCount === 0 ? "all the" : contractsCount} contract${
            contractsCount === 1 ? "" : "s"
        }`
    );
    await ProcessUtils.executeOrExitNpx(
        "truffle",
        processArguments,
        `Unable to migrate the contract${contractsCount === 1 ? "" : "s"}`,
        "./src"
    );
    // Update the build information
    const fileUtilsContracts = new FileUtils(
        "./build/contracts-build-info",
        "./src/contracts",
        "./build/src/contracts"
    );
    await fileUtilsContracts.updateBuildInfo();
    const fileUtilsTypes = new FileUtils(
        "./build/contracts-types-info",
        "./src/contracts",
        "./build/src/contracts",
        "./types/truffle-contracts",
        "../library/build/types"
    );
    await fileUtilsTypes.updateBuildInfo();
    Logger.info("Done");
}

main().then();

import {PathLike, promises as FileSystemPromises} from "fs";
import {Logger} from "./Logger";
import path = require("node:path");

export class FileUtils {
    private readonly newBuildInfo: Map<string, bigint>;
    private readonly buildInfoPath: PathLike;
    private readonly directoryPaths: PathLike[];

    constructor(buildInfoPath: PathLike, ...directoryPaths: PathLike[]) {
        this.buildInfoPath = buildInfoPath;
        this.directoryPaths = directoryPaths;
        this.newBuildInfo = new Map<string, bigint>();
    }

    public async hasChanged(): Promise<boolean> {
        // Get the build information
        this.newBuildInfo.clear();
        let buildInfo: Map<string, bigint>;
        try {
            buildInfo = await FileUtils.getBuildInfo(this.buildInfoPath);
        } catch (exception: unknown) {
            Logger.warn(
                `Unable to open the file ${this.buildInfoPath}. Assuming changes have been made`
            );
            buildInfo = new Map<string, bigint>();
        }
        const changed = await this.computeNewBuildInfo(buildInfo);

        return changed || buildInfo.size !== this.newBuildInfo.size;
        //return true;
    }

    public async updateBuildInfo(): Promise<void> {
        // Recompute the build information
        await this.computeNewBuildInfo(this.newBuildInfo);
        // Save the build info
        const newBuildInfoString = FileUtils.toString(this.newBuildInfo);
        await FileSystemPromises.writeFile(this.buildInfoPath, newBuildInfoString);
    }

    private async computeNewBuildInfo(buildInfo: Map<string, bigint>): Promise<boolean> {
        // Check the directories
        let changed = false;
        for (const directoryPath of this.directoryPaths) {
            // Open the directory
            try {
                const directory = await FileSystemPromises.opendir(directoryPath);
                // Loop over the files
                for await (const directoryEntry of directory) {
                    if (directoryEntry.isFile()) {
                        // Compose the file path
                        const filePath = path.join(directory.path, directoryEntry.name);
                        // Check the modification time
                        const fileStats = await FileSystemPromises.stat(filePath, {bigint: true});
                        const modificationTime = fileStats.mtimeNs;
                        if (buildInfo.has(filePath)) {
                            const oldModificationTime = buildInfo.get(filePath);
                            if (oldModificationTime !== modificationTime) {
                                changed = true;
                            }
                        } else {
                            changed = true;
                        }
                        // Add the entry to the build info
                        this.newBuildInfo.set(filePath, modificationTime);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        return changed;
    }

    private static async getBuildInfo(buildInfoPath: PathLike): Promise<Map<string, bigint>> {
        const result = new Map<string, bigint>();

        // Open the file
        const file = await FileSystemPromises.open(buildInfoPath, "r");
        // Read and parse the file
        for await (const line of file.readLines()) {
            const splitLine = line.split(" ");
            if (splitLine.length !== 2) {
                console.error("The build info file", buildInfoPath, "is malformed.");
                throw Error("");
            } else {
                result.set(splitLine[0] as string, BigInt(splitLine[1] as string));
            }
        }

        return result;
    }

    private static toString(buildInfo: Map<string, bigint>): string {
        const result: string[] = [];
        // @ts-ignore
        for (const [path, time] of buildInfo) {
            result.push(`${path} ${time}`);
        }
        return result.join("\n");
    }
}

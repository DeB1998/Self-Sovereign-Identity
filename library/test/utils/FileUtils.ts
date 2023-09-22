import * as fsPromises from "node:fs/promises";
import {PathLike} from "fs";

/**
 * Utility class providing static methods that allow to read the content of a file into memory.
 *
 * <b>This class cannot be used in environments (like Angular) that do not allow to read files from
 * the file system.</b>
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-25
 * @since 1.0
 */
export class FileUtils {
    /**
     * The constructor is private so to avoid creating objects of this class, which offers only
     * static methods.
     */
    private constructor() {}

    /**
     * Asynchronously reads the content of the file at the specified path.
     *
     * @param path Path of the file to read.
     */
    public static async readFileContent(path: PathLike): Promise<string> {
        // Read the file content asynchronously
        return await fsPromises.readFile(path, {encoding: "utf-8"});
    }
}

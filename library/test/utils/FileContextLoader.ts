import {PathLike} from "fs";
import {Url} from "jsonld/jsonld-spec";
import fsPromises from "node:fs/promises";
import * as Path from "node:path";
import {URL} from "node:url";
import {ChainableDocumentLoader} from "../../src/utils/JsonLdContextLoader";

export class FileContext {
    public static readonly DID_DOCUMENT_LOADER: [string, string] = [
        "https://www.ssicot.com/did-document",
        "did-document.jsonld"
    ];
    public static readonly CHAIN_RESOLUTION_LOADER: [string, string] = [
        "https://www.ssicot.com/chain-resolution",
        "chain-resolution.jsonld"
    ];
    public static readonly CERTIFICATION_CREDENTIAL_LOADER: [string, string] = [
        "https://www.ssicot.com/certification-credential",
        "certification-credential.jsonld"
    ];
    public static readonly DID_RESOLUTION_LOADER: [string, string] = [
        "https://www.ssicot.com/resolution-error",
        "resolution-error.jsonld"
    ];
    public static readonly REVOCATION_LIST_LOADER: [string, string] = [
        "https://www.ssicot.com/RevocationList2023",
        "revocation-list-2023.jsonld"
    ];
}

/**
 * Utility class providing methods to create <code>ChainableContextLoader</code>s resolving JSON-LD
 * context URLs into the corresponding JSON-LD context definition files, located in the local file
 * system.
 *
 * <b>This class cannot be used in environments (like Angular) that do not allow to read files from
 * the file system.</b>
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */
export class FileContextLoader {
    /**
     * Path of the directory on the file system containing all the JSON-LD context definition files.
     */
    private readonly contextsPath: string;

    /**
     * Creates a new object that can resolve JSON-LD context URLs into one of the JSON-LD context
     * definition files contained in the specified directory.
     *
     * @param contextsPath Path of the directory containing the JSON-LD context definition files.
     * @param encoding Encoding of the JSON-LD context definition file. If not specified, it
     *     defaults to UTF-8.
     * @param additionalContextFiles List of tuples containing the JSON-LD context URL and the name
     *     of the file containing the JSON-LD context definition.
     */
    constructor(contextsPath: string) {
        this.contextsPath = Path.resolve(contextsPath);
    }

    /**
     * Creates a <code>ChainableContextLoader</code> that resolves a JSON-LD context URL into a
     * JSON-LD context definition by reading the context of a file located in the local file
     * system.
     *
     * In particular, this method accepts a tuple with 2 strings where:
     * <ol>
     *     <li>The first string is the JSON-LD context URL;</li>
     *     <li>The second string is the name of the file, inside the <code>contextsPath</code>
     * directory specified in the constructor, that contains the JSON-LD context definition.</li>
     * </ol>
     * For instance, the tuple <code>["https://abc123/def", "def.jsonld"]</code> indicates that the
     * <i>jsonld.js</i> library will resolve the URL <code>https://abc123/def</code> into the
     * JSON-LD context definition contained in the file located at
     * <code>CONTEXT_PATH/def.jsonld</code>, where <code>CONTEXT_PATH</code> is the path specified
     * in the constructor.
     *
     * The <code>FileContext</code> class contains several constants that can be used to resolve
     * the JSON-LD contexts this library uses.
     *
     * Note that the JSON-LD context definition file is read from the local file system
     * asynchronously.
     *
     * @return A <code>ChainableContextLoader</code> that, when invoked, will return a
     *     <code>DocumentLoader</code> that resolves the JSON-LD context URL specified as the first
     *     element of the <code>fileContext</code> tuple into a JSON-LD context definition file,
     *     located in the local file system.
     */
    public createContextLoader(
        context: [string, string],
        encoding: BufferEncoding = "utf-8"
    ): ChainableDocumentLoader {
        // Create the loader. This is done by a separate function so to avoid catching
        // <code>this</code> in the closure
        return FileContextLoader.createLoader(
            context[0],
            this.contextsPath,
            context[1],
            encoding
        );
    }

    /**
     * Creates a new chainable document loader that resolved JSON-LD context URLs into JSON-LD
     * contex definitions contained in files located in the local file system.
     *
     * @param contextUrl JSON-LD context URL.
     * @param contextsPath Path of the directory containing the JSON-LD context definition files.
     * @param fileName Name of the file, located in the <code>contextsPath</code> directory,
     *     containing the JSON-LD context definition.
     * @param encoding Encoding of the JSON-LD context definition file.
     * @return A <code>ChainableContextLoader</code> that resolves the specified
     *     <code>contextUrl</code> into the JSON-LD context definition file, named
     *     <code>fileName</code> and located in the local file system in the directory
     *     <codecontextsPath></code>.
     */
    private static createLoader(
        contextUrl: string,
        contextsPath: string,
        fileName: string,
        encoding: BufferEncoding
    ): ChainableDocumentLoader {
        // Parse the URL
        const parsedUrl = new URL(contextUrl);

        // Create the document loader
        return async (url: Url) => {
            // This document loader resolves only a specific URL
            if (this.areUrlEqual(new URL(url), parsedUrl)) {
                return {
                    // This is for a context via a link header
                    contextUrl: undefined,
                    // This is the actual document that was loaded
                    document: JSON.parse(
                        await FileContextLoader.readFileContent(
                            Path.resolve(contextsPath, fileName),
                            encoding
                        )
                    ),
                    // This is the actual context URL after redirects
                    documentUrl: url
                };
            }
            // If this document loader does not resolve the specified URL, then call the next
            // loader in the chain
            return null;
        };
    }

    /**
     * Utility method that checks if two URLs are equal.
     *
     * @param firstUrl First URL to check.
     * @param secondUrl Second URL to check.
     * @return <code>true</code> if the two specified URLs are equal, <code>false</code> otherwise.
     */
    private static areUrlEqual(firstUrl: URL, secondUrl: URL): boolean {
        return firstUrl.href === secondUrl.href;
    }

    /**
     * Asynchronously reads the content of a file.
     *
     * @param path Path of the file to read.
     * @param encoding Encoding of the file.
     * @return The content of the file.
     */
    private static async readFileContent(
        path: PathLike,
        encoding: BufferEncoding
    ): Promise<string> {
        // Read the file content asynchronously
        return await fsPromises.readFile(path, {encoding});
    }
}

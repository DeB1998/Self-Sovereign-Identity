import JsonLd from "jsonld";
import {RemoteDocument, Url} from "jsonld/jsonld-spec";
import {DocumentLoader} from "./DocumentLoader";
import "../../types/jsonld";

/**
 * Type of any function that, given a JSON-LD context URL, returns a <code>RemoteDocument</code>
 * containing the JSON-LD context definition associated with the specified URL.
 * If the function cannot resolve the JSON-LD context URL, then <code>null</code> is returned.
 *
 * This type is often used to resolve custom JSON-LD contexts into the corresponding JSON-LD
 * context definitions. In all the other cases, the default <code>DocumentLoader</code> provided by
 * the <i>jsonld.js</i> library will be sufficient.
 *
 * Note that a valid <code>DocumentLoader</code> is also a valid
 * <code>ChainableDocumentLoader</code>, but not vice versa, since a
 * <code>ChainableDocumentLoader</code> may return <code>null</code>, and this is not allowed for
 * <code>DocumentLoader</code>s.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */
export type ChainableDocumentLoader = (url: Url) => Promise<RemoteDocument | null>;

/**
 * This class allows combining several <code>ChainableDocumentLoader</code>s into one
 * <code>DocumentLoader</code> so to be used where the <i>jsonld.js</i> library requires a single
 * <code>DocumentLoader</code>.
 *
 * In particular, the <code>DocumentLoader</code> created by this class will invoke the
 * <code>ChainableDocumentLoader</code>s supplied to the constructor, in the order they are
 * specified, until one of them returns a non-null object. If all return <code>null</code>, then
 * the default <code>DocumentLoader</code> will be invoked.
 *
 * The following is an example that creates a new <code>DocumentLoader</code> by combining 2
 * <code>ChainableDocumentLoader</code>s:
 *
 * <pre>
 * // This loader resolves the URL "https://abc123.com/def" into the corresponding JSON-LD context
 * // definition
 * const firstLoader: ChainableContextLoader = async (url: Url) => {
 *     if (url == "https://abc123.com/def") {
 *         // Resolve somehow the URL (e.g., reading the content of a file) and return the JSON-LD
 *         // context definition
 *     }
 *     // This loader cannot resolve any other URL
 *     return null;
 * };
 * // This loader resolves the URL "https://xyz456.com/stu" into the corresponding JSON-LD context
 * // definition
 * const secondLoader: ChainableContextLoader = async (url: Url) => {
 *     if (url == "https://xyz456.com/stu") {
 *         // Resolve somehow the URL (e.g., reading the content of a file) and return the JSON-LD
 *         // context definition
 *     }
 *     // This loader cannot resolve any other URL
 *     return null;
 * };
 *
 * const contextLoader: JsonLdContextLoader = new JsonLdContextLoader([firstLoader, secondLoader])
 * const documentLoader: DocumentLoader = contextLoader.getDocumentLoader();
 *
 * // Now documentLoader can be supplied to any function requiring a DocumentLoader.
 * </pre>
 *
 * In this case, when the <i>jsonld.js</i> library needs to resolve a JSON-LD context URL into the
 * corresponding JSON-LD context definition, then the <code>firstLoader</code> is first invoked.
 *
 * If the URL to resolve is <code>https://abc123.com/def</code>, then the loader returns the
 * JSON-LD context definition, in the format required by the <i>jsonld.js</i> library.
 *
 * Otherwise, the <code>firstLoader</code> returns <code>null</code>, and the
 * <code>secondLoader</code> is invoked. In this case, if the URL to resolve is
 * <code>https://xyz456.com/stu</code>, then the loader returns the
 * JSON-LD context definition, in the format required by the <i>jsonld.js</i> library.
 *
 * Otherwise, the default document loader will be invoked to resolve the URL. In this case, since
 * no default document loader is specified in the <code>JsonLdContextLoader</code> constructor,
 * then the default document loader provided by the <i>jsonld.js</i> library will be invoked.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */
export class JsonLdContextLoader {
    /**
     * Default document loader provided by the <i>jsonld.js</i> library in a Node.js environment.
     * This loader should be used as the default document loader, so to properly resolve non-custom
     * URLs into the correct JSON-LD context definitions when using this library in a Node.js
     * environment.
     */
    public static readonly DEFAULT_NODE_JS_DOCUMENT_LOADER = (url: Url) =>
        JsonLd.documentLoaders.node()(url);

    /**
     * Default document loader provided by the <i>jsonld.js</i> library in a non-Node.js
     * environment (like the browser). This loader should be used as the default document loader,
     * so to properly resolve non-custom URLs into the correct JSON-LD context definitions when
     * using this library in a non-Node.js environment.
     */
    public static readonly DEFAULT_XHR_DOCUMENT_LOADER = (url: Url) =>
        JsonLd.documentLoaders.xhr()(url);

    /**
     * Document loader that resolves a JSON-LD context URL into the corresponding JSON-LD context
     * definition by invoking several ChainableDocumentLoaders until one of them correctly resolves
     * the URL.
     */
    private readonly documentLoader: DocumentLoader;

    /**
     * Creates a new JSON-LD context loader that resolves a JSON-LD context URL into the
     * corresponding JSON-LD context definition by invoking the specified
     * <code>ChainableDocumentLoader</code>s until one of them correctly resolves the URL.
     *
     * In particular, when the <i>jsonld.js</i> library needs to resolve a URL contained in the
     * <code>@context</code> property of a JSON-LD object, the first
     * <code>ChainableDocumentLoader</code> specified in the <code>loaders</code> array is invoked.
     * If this loader can resolve the URL, then the <i>jsonld.js</i> library will use the returned
     * definition. Otherwise, the <code>ChainableDocumentLoader</code> returns <code>null</code>,
     * and the next <code>ChainableDocumentLoader</code> in the <code>loaders</code> array is
     * invoked.
     *
     * If none of the supplied <code>ChainableDocumentLoader</code>s can resolve a JSON-LD context
     * URL, then the <code>defaultDocumentLoader</code> is invoked.
     *
     * Note that if a document loader resolves the URL, then the following ones in the
     * <code>loaders</code> array will not be invoked.
     * Moreover, if a <code>DocumentLoader</code> (and not a <code>ChainableDocumentLoader</code>)
     * is present in the <code>loaders</code> array, then the following document loaders are never
     * invoked because the <code>DocumentLoader</code> will always resolve a JSON-LD context URL
     * into the corresponding JSON-LD context definition.
     *
     * @param loaders List of <code>ChainableDocumentLoader</code>s that will be invoked in the
     *     order they are specified until one of them resolves a specific JSON-LD context URL into
     *     the corresponding JSON-LD context definition. If none of them can resolve the URL, then
     *     the <code>defaultDocumentLoader</code> is invoked.
     * @param defaultDocumentLoader <i>jsonld.js</i> <code>DocumentLoader</code> that is invoked to
     *     resolve a JSON-LD context URL if none of the <code>ChainableDocumentLoader</code>s
     *     specified in the <code>loaders</code> array can resolve the URL.
     */
    public constructor(
        loaders: ChainableDocumentLoader[],
        defaultDocumentLoader = JsonLdContextLoader.DEFAULT_NODE_JS_DOCUMENT_LOADER
    ) {
        // Create the loader that iteratively invokes the supplied loaders until one of them
        // resolves the JSON-LD context URL
        this.documentLoader = async (url: Url): Promise<RemoteDocument> => {
            let result: RemoteDocument | null = null;
            // Try resolving the URL with the supplied document loaders, in the order they are
            // supplied
            for (const loader of loaders) {
                const loaderResult = await loader(url);
                // The loader returns null if it could not resolve the URL
                if (loaderResult !== null) {
                    result = loaderResult;
                    break;
                }
            }
            // Use the default document loader if none of the supplied loaders have resolved the
            // URL
            if (result === null) {
                result = await defaultDocumentLoader(url);
            }
            return result;
        };
    }

    /**
     * Returns the <code>DocumentLoader</code> that invokes, in the order they have been specified,
     * the <code>ChainableDocumentLoader</code>s supplied to the constructor until one of them
     * correctly resolves a JSON-LD context URL into the corresponding JSON-LD context definition.
     *
     * @returns The <code>DocumentLoader</code> that invokes
     *     the<code>ChainableDocumentLoader</code>s supplied to the constructor.
     */
    public getDocumentLoader(): DocumentLoader {
        return this.documentLoader;
    }
}

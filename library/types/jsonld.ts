/*
 * Utility file containing some type definitions that are not present in the TypeScript
 * definition of the <i>jsonld.js</i> library, which is provided in the <i>@types/jsonld</i> NPM
 * package.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-25
 * @since 1.0
 */
import {RemoteDocument, Url} from "jsonld/jsonld-spec";

declare module "jsonld" {
    export interface DefaultDocumentLoaderOptions {
        secure?: boolean;
        strictSSL?: boolean;
        maxRedirects?: number;
        headers?: object;
        httpAgent?: string;
        httpsAgent?: string;
    }

    /**
     * Type of the default <code>DocumentLoader</code> provided by the <i>jsonld.js</i> library.
     * They accept some options so to be customized.
     */
    export type DefaultDocumentLoader = (
        options?: DefaultDocumentLoaderOptions
    ) => (url: Url) => Promise<RemoteDocument>;

    /**
     * Default <code>DocumentLoader</code> provided by the <i>jsonld.js</i> library.
     */
    export namespace documentLoaders {
        /**
         * <code>DocumentLoader</code> using the Node.js APIs to resolve JSON-LD context URLs into
         * the corresponding JSON-LD context definitions.
         */
        let node: DefaultDocumentLoader;

        /**
         * <code>DocumentLoader</code> using XHR to resolve JSON-LD context URLs into the
         * corresponding JSON-LD context definitions.
         */
        let xhr: DefaultDocumentLoader;
    }
}

import {RemoteDocument, Url} from "jsonld/jsonld-spec";

/**
 * Type describing a context loader, which is a function that can be used by the <i>jsonld</i>
 * library to load a JSON-LD context definition, for instance, from a local file or a remote
 * server. In particular, this function receives the URL of the JSON-LD context to resolve, and
 * returns a promise that must be fulfilled with an object containing 3 properties:
 * <ol>
 *     <li><code>contextUrl</code>, which should be <code>null</code>;</li>
 *     <li><code>document</code>, which must be the JavaScript object describing the JSON-LD
 * context definition;</li>
 *     <li><code>documentUrl</code>, which should be the URL the function receives as the first
 * argument.</li>
 * </ol>
 * Therefore, a valid document loader must be a function compatible with the following signature:
 * <pre>
 * (url: Url) => Promise<RemoteDocument>
 * </pre>
 * Refer to the official documentation of the <i>jsonld.js</i> library for additional details and
 * examples on how to write a custom <code>DocumentLoader</code>.
 *
 * To combine multiple context loaders into one, we suggest the use of the
 * <code>JsonLdContextLoader</code> class, which this library provides.
 *
 * @see JsonLdContextLoader
 */
export type DocumentLoader = (url: Url) => Promise<RemoteDocument>;

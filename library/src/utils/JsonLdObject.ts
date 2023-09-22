import {JsonLdContext} from "./JsonLdContext";


/**
 * Type describing an JSON-LD object, containing the <code>@context</code> property together with
 * all the properties defined by the type <code>T</code>.
 *
 * @param T Type describing the properties that the JSON-LD object contains in addition to the
 *     <code>@context</code> one.
 */
export type JsonLdObject<T> = T & {"@context": JsonLdContext[]};

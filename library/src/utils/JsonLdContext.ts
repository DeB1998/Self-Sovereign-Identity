/*
 * Utility file containing additional types built on top of the ones offered by the <i>jsonld.js</i>
 * library.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */

import {ContextDefinition} from "jsonld/jsonld";

/**
 * Type describing a JSON-LD object <code>@context</code> property. This field may contain one or
 * both:
 * <ul>
 *     <li>URLs pointing to the JSON-LD context definitions;</li>
 *     <li>A JSON-LD context definition, in the form of a JavaScript object.</li>
 * </ul>
 * According to this type, the following are three examples of JSON-LD objects containing valid
 * <code>@context</code> properties:
 * <ul>
 *      <li><b>Only URLs, each specified as a string</b>
 * <pre>
 * {
 *      "@context": [
 *          "https://www.ssicot.com/chain-resolution",
 *          "https://www.ssicot.com/resolution-error"
 *      ],
 *      // ...
 * }
 * </pre>
 *      </li>
 * <li><b>Only context definitions, each specified as a JSON object</b>
 * <pre>
 * {
 *      "@context": [
 *          {
 *              "@context": {
 *                  "@version": 1.1,
 *                  "@protected": true,
 *                  "CertificationCredential": {
 *                      "@id":
 * "https://www.ssicot.com/certification-credential/#CertificationCredential"
 *                  }
 *              }
 *          },
 *          {
 *              "@context": {
 *                  "@version": 1.1,
 *                  "@protected": true,
 *                  "xsd": "http://www.w3.org/2001/XMLSchema#",
 *                  "errorDescription": {
 *                      "@id": "https://www.ssicot.com/resolution-error#errorDescription",
 *                      "@type": "xsd:string"
 *                  }
 *              }
 *          }
 *      ],
 *      // ...
 * }
 * </pre>
 *      </li>
 *      <li><b>URLs and context definitions</b>
 * <pre>
 * "@context": [
 *      "https://www.ssicot.com/chain-resolution",
 *      {
 *          "@context": {
 *              "@version": 1.1,
 *              "@protected": true,
 *              "xsd": "http://www.w3.org/2001/XMLSchema#",
 *              "errorDescription": {
 *                  "@id": "https://www.ssicot.com/resolution-error#errorDescription",
 *                  "@type": "xsd:string"
 *              }
 *          }
 *      }
 * ]
 * </pre>
 *      </li>
 * </ul>
 */
export type JsonLdContext = string | ContextDefinition;

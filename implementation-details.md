# Specification

This document contains several notes about Decentralized Identity, Verifiable Credentials and
related topics. These notes help understanding the design choices of the implemented DID method.

The notes have been extracted from the following pages:

-   [JSON-LD 1.1](https://www.w3.org/TR/2020/REC-json-ld11-20200716/)
-   [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/2022/REC-did-core-20220719/)
-   [Decentralized Identifier Resolution (DID Resolution) v0.3](https://w3c-ccg.github.io/did-resolution/)
-   [DID Specification Registries](https://www.w3.org/TR/2023/NOTE-did-spec-registries-20230427/)
-   [Use Cases and Requirements for Decentralized Identifiers](https://www.w3.org/TR/2021/NOTE-did-use-cases-20210317/)
-   [Verifiable Credentials Data Model v1.1](https://www.w3.org/TR/2022/REC-vc-data-model-20220303/)
-   [Verifiable Credentials Use Cases](https://www.w3.org/TR/2019/NOTE-vc-use-cases-20190924/)
-   [Verifiable Credential Data Integrity 1.0](https://www.w3.org/TR/2023/WD-vc-data-integrity-20230428)
-   [Verifiable Credentials Implementation Guidelines 1.0](https://www.w3.org/TR/2019/NOTE-vc-imp-guide-20190924/)
-   [Verifiable Credentials Extension Registry](https://w3c-ccg.github.io/vc-extension-registry/)
-   [Linked Data Cryptographic Suite Registry](https://w3c-ccg.github.io/ld-cryptosuite-registry/)
-   [RDF 1.1 Concepts and Abstract Syntax](https://www.w3.org/TR/rdf11-concepts/)
-   [RDF Dataset Canonicalization](https://www.w3.org/community/reports/credentials/CG-FINAL-rdf-dataset-canonicalization-20221009/)
-   [RDF Dataset Canonicalization](https://www.w3.org/TR/2023/WD-rdf-canon-20230524/)
-   [JSON Web Signature (JWS)](https://www.rfc-editor.org/rfc/rfc7515)
-   [JSON Web Signature (JWS) Unencoded Payload Option](https://www.rfc-editor.org/rfc/rfc7797)
-   [JSON Web Signatures for Data Integrity Proofs](https://www.w3.org/TR/2023/WD-vc-jws-2020-20230127/)
-   [Ecdsa Secp256k1 Recovery Signature 2020](https://github.com/decentralized-identity/EcdsaSecp256k1RecoverySignature2020)
-   [ECDSA Signature with secp256k1 Curve](https://datatracker.ietf.org/doc/html/draft-ietf-cose-webauthn-algorithms-04#section-3.2)
-   [The Security Vocabulary](https://w3c-ccg.github.io/security-vocab/)
-   [CAIP-2: Blockchain ID Specification](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md)
-   [CAIP-10: Account ID Specification](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md)
-   [ERC-55: Mixed-case checksum address encoding](https://eips.ethereum.org/EIPS/eip-55)
-   [EIP-155: Simple replay attack protection](https://eips.ethereum.org/EIPS/eip-155)
-   [ERC-1191: Add chain id to mixed-case checksum address encoding](https://eips.ethereum.org/EIPS/eip-1191)

### Additional material

-   [DID Core Specification Test Suite and Implementation Report](https://w3c.github.io/did-test-suite/)
-   [Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
-   [Verifiable Credentials Vocabulary v2.0](https://www.w3.org/2018/credentials/)
-   [W3C Verifiable Credentials Working Group Test Suite](https://github.com/w3c/vc-test-suite/)
-   [Verifiable Credentials Data Model Implementation Report 1.0](https://w3c.github.io/vc-test-suite/implementations/)
-   [RDF 1.1 Test Cases](https://www.w3.org/TR/rdf11-testcases/)
-   [JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785)
-   [RDF Dataset Canonicalization and Hash Working Group Charter — Explainer and Use Cases](https://w3c.github.io/rch-wg-charter/explainer.html)
-   [Ecdsa Secp256k1 Signature 2019](https://w3c-ccg.github.io/lds-ecdsa-secp256k1-2019/)
-   [Ethereum EIP712 Signature 2021](https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/)
-   [Revocation List 2020](https://w3c-ccg.github.io/vc-status-rl-2020/)
-   [Verifiable Credentials Status List v2021](https://www.w3.org/TR/vc-status-list/)

### Useful resources

-   [JSON-LD Playground](https://json-ld.org/playground/)
-   [RDF Distiller](http://rdf.greggkellogg.net/distiller?command=serialize)
-   [CHAPI Playground](https://playground.chapi.io/)
-   [jsonld.js](https://github.com/digitalbazaar/jsonld.js)
-   [JSON-LD Signatures _(jsonld-signatures)_](https://github.com/digitalbazaar/jsonld-signatures)

## Terminology

The following is the list of definitions terms that are used in this document:

-   A **DID URL** is an extension of a DID, incorporating the standard URI components like query,
    path and fragment.
-   A **DID subject** is the entity identified by a DID.
-   A **DID controller** is the entity that can make changes to the DID document, as defined in the
    DID document itself.

    A DID document can be controlled by multiple DID controllers, and the DID controller may also be
    the DID subject.

-   A **DID resolver** is a system that takes in input a DID and returns in output the corresponding
    DID document.

    This process is called **DID resolution**. To perform the resolution, additional resolution
    metadata may be needed.

-   A **DID method** expresses how a DID and the associated DID document can be created, resolved,
    updated and deactivated.
-   A **DID scheme** expresses the formal syntax of a DID. All the DIDs defined by any DID scheme
    must begin with the string `did:`.
-   A **service** is a mean allowing to communicate or interact with a DID subject via one or more
    service endpoints.
-   A **service endpoint** is a network address (e.g., an HTTP URL), at which a service operate
    under the control of a DID subject.
-   A **verifiable data registry** is a system that facilitates the creation, verification, update
    and deactivation of a DID or a DID document.
-   A **claim** is a statement about a subject.
-   A **credential** is a set of one or more claims made by the same entity.
-   A **verifiable credential** is a tamper-evident credential having authorship and that can be
    cryptographically verified. Typically, a verifiable credential contains also metadata describing
    the properties of the credential, like the issuer or the expiry date and time.
-   A **verifiable presentation** is a tamper-evident set of data that is derived from one or more
    verifiable credentials. A verifiable presentation is encoded in such a way that authorship of
    the data can be trusted after a process of cryptographic verification.

    If verifiable credentials are presented directly, then they become verifiable presentations.

    Even if there is no limit on the number of subjects or issuers of the credentials contained in
    the same verifiable presentation, the credentials in a presentation are often about the same
    subject.

-   An **IRI** (Internationalized Resource Identifier) is a generalization of a URI that permits a
    wider range of Unicode characters.

## JSON-LD

**Linked Data** is a way to create a network of standards-based machine-interpretable data across
different documents and websites. Starting from one piece of Linked Data, and application can follow
embedded links to other pieces of Linked Data that are hosted on different sites across the Web.

**JSON-LD** (JSON for Linked Data) is a lightweight syntax that allows to serialize Linked Data in
JSON format. Therefore, a JSON-LD document is always a valid JSON document.

Generally speaking, a JSON-LD document describes a labelled and directed graph, i.e., a graph where
each node is associated with a label that uniquely identifies it.

While JSON is a lightweight and language-independent data interchange format, it has no notion of
hyperlinks, which are the basis of Linked Data. Moreover, it is difficult to integrate JSON
documents coming from different sources, as the documents may contain keys that conflict one with
the others.

Take the following two JSON documents:

```json
{
    "name": "Jane Doe",
    "homepage": "https://www.janedoe.com"
}
```

and

```json
{
    "name": "Jane",
    "surname": "Doe",
    "homepage": "https://www.janedoe.com"
}
```

As you can see, the two `name` fields refer to different concepts. Indeed, the `name` field of the
first object refers to the full name of a person, while the `name` field of the second object refers
only to the first name of a person.

To solve the problem, JSON-LD gives unambiguous identifiers to denote different concepts, instead of
using tokens like `name`. In particular, JSON-LD uses IRIs for unambiguous identification.

These IRIs can be then use by developers and machines to get a definition of what the value
associated to the IRI means. A vocabulary is a repository containing a set of IRIs and the
associated definitions.

The two JSON documents will become the following JSON-LD documents (using the popular _schema.org_
vocabulary):

```json
{
    "https://schema.org/name": "Jane Doe",
    "https://schema.org/url": {
        "@id": "https://www.janedoe.com"
    }
}
```

and

```json
{
    "https://schema.org/givenName": "Jane",
    "https://schema.org/familyName": "Doe",
    "https://schema.org/url": {
        "@id": "https://www.janedoe.com"
    }
}
```

In the previous documents, not only all the properties are associated unambiguous IRIs, but each of
these IRIs, if dereferenced, result in a resource describing the meaning of the property. Moreover,
all the values representing IRIs are explicitly marked with the `@id` keyword, marking that they
should be interpreted as IRIs rather that just strings.

Note that the two documents describe a person. Therefore, we can make it explicit by using the
`@type` keyword:

```json
{
    "@type": "https://schema.org/Person",
    "https://schema.org/givenName": "Jane",
    "https://schema.org/familyName": "Doe",
    "https://schema.org/url": {
        "@id": "https://www.janedoe.com"
    }
}
```

### Contexts

Specifying the full IRI of each field (e.g., `https://schema.org/givenName` or
`https://schema.org/url`) makes the JSON-LD document verbose. To address this issue, JSON-LD
introduces the notion of **context**.

Contexts allow for shortening the names of the fields. In particular, instead of specifying the full
IRI, we can specify just a term, that it then resolved to the full IRI.

For instance, take the following example:

```json
{
    "@context": "https://schema.org",
    "@type": "Person",
    "givenName": "Jane",
    "familyName": "Doe",
    "url": {
        "@id": "https://www.janedoe.com"
    }
}
```

Now, the term `givenName` is not a valid IRI. However, since we have specified the context
`https://schema.org`, then the term `givenName` will be expanded to `https://schema.org/givenName`
thanks to the specified context.

Contexts may be referenced using a URL, like in the previous example, or can be directly embedded as
values of the `@context` field.

#### Custom context

We can shorten even further the JSON-LD document by creating a custom context. In particular, with
the following context (assumed to be published at `www.example.com`):

```json
{
    "@context": {
        "givenName": "https://schema.org/givenName",
        "familyName": "https://schema.org/familyName",
        "url": {
            "@id": "https://schema.org/url",
            "@type": "@id"
        }
    }
}
```

the JSON-LD document becomes:

```json
{
    "@context": "https://www.example.com",
    "givenName": "Jane",
    "familyName": "Doe",
    "url": "https://www.janedoe.com"
}
```

The context states that:

1. `givenName` is a shorthand for `https://schema.org/givenName`;
2. `familyName` is a shorthand for `https://schema.org/familyName`;
3. `url` is a shorthand for `https://schema.org/url` and, since its type is `@id`, then the value
   associated to the `url` field should be interpreted as an identifier (that is an IRI).

#### Compact IRIs

A compact IRI is a way of expressing an IRIs using a prefix and a suffix separated by a colon `:`.
The prefix is defined in the `@context` field, and it is associated to a IRI that resolves to a
JSON-LD context. The suffix, instead, is any sequence of characters.

Typically, compact IRIs are used to shorten context IRIs.

The following context is an example of the usage of compact IRIs:

```json
{
    "@context": {
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "person-age": {
            "@id": "foaf:age",
            "@type": "xsd:integer"
        }
    }
}
```

In particular, we have specified the prefixes `xsd` and `foaf` associated to the
`https://www.w3.org/2001/XMLSchema#` and `https://xmlns.com/foaf/0.1/` contexts respectively.

Then, we used that prefixes to shorten IRIs. In particular, we have written:

-   `foaf:age` in place of `https://xmlns.com/foaf/0.1/age`
-   `xsd:integer` in place of `https://www.w3.org/2001/XMLSchema#integer`

#### Multiple contexts

The JSON-LD standard allows for the use of multiple contexts. In this case, the contexts are
specified as an array of strings or objects in the `@context` field:

```json
{
    "@context": [
        "https://schema.org",
        "https://geojson.org/geojson-ld/geojson-context.jsonld",
        {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "person-age": {
                "@id": "foaf:age",
                "@type": "xsd:integer"
            }
        }
    ],
    "place": {
        "@type": "Place",
        "address": "1600 Amphitheatre Pkwy, Houston, TX",
        "geometry": {
            "coordinates": [107.04, 115.5]
        }
    },
    "owner": {
        "@type": "Person",
        "name": "Jane Doe",
        "person-age": "40",
        "telephone": "555-123456"
    }
}
```

In this case:

-   The `address`, `name` and `telephone` terms are resolved against the _schema.org_ vocabulary;
-   The `geometry` and `coordinates` terms are resolved against the _GeoJSON_ vocabulary;
-   The `person-age` term is resolved against the _FOAF_ context as stated in the inline-defined
    context.

#### Protected terms

When using multiple contexts, each context might have a different definitions of the same term. In
these cases, a multiply-defined term is resolved against the last context that defines it, according
to the order of the contexts specified in the `@context` field.

For instance, assume that the context `https://www.example.com` defines the term `address`. Then, in
the following example, the term `address` is resolved against the `https://schema.org` context
because it is the last context defining that term:

```json
{
    "@context": ["https://www.example.com", "https://schema.org"],
    "@type": "Person",
    "name": "Jane Doe",
    "address": "1600 Amphitheatre Pkwy, Houston, TX"
}
```

To prevent a term redefinition, the JSON-LD standard provides the `@protected` keyword to use in the
context definition. The JSON-LD parser will raise an error if one context defies the term with
`@protected` set to `true` and another context placed after in the `@context` field defines the same
term.

Therefore, when using the following context (assumed to be published at `www.example.com`):

```json
{
    "@context": {
        "name": "https://schema.org/name",
        "address": {
            "@id": "https://www.example.com/address",
            "@protected": true
        }
    }
}
```

the JSON-LD parser will raise an error when parsing the following JSON-LD document because the
context at `https://www.example.com` defines the term `address` with `@protected` set to `true`, and
the context `https://schema.org` defines another term named `address`:

```json
{
    "@context": ["https://www.example.com", "https://schema.org"],
    "@type": "Person",
    "name": "Jane Doe",
    "address": "1600 Amphitheatre Pkwy, Houston, TX"
}
```

### Keywords aliasing

Each of the JSON-LD keywords, except for `@context` may be aliased to application-specific keywords.

For example:

```json
{
    "@context": {
        "givenName": "https://schema.org/givenName",
        "familyName": "https://schema.org/familyName",
        "object-type": "@type"
    },
    "object-type": "Person",
    "givenName": "Jane",
    "familyName": "Doe"
}
```

creates an alias allowing the use of `object-type` in place of the keyword `@type`.

## RDF

The **Resource Description Framework** is a framework for representing information in the Web.

The core structure of the RDF data model is triple in the form:

```
(subject, predicate, object)
```

where:

-   The subject is an IRI or a blank node;
-   The predicate is an IRI
-   The object in an IRI, a literal or a blank node.

In particular:

-   An **IRI** is encoded as a Unicode string.

    In the RDF abstract syntax, an IRI must be absolute and may contain a fragment identifier. Some
    concrete syntaxes (like JSON-LD) allow for relative IRIs as a convenient shorthand. In these
    cases, relative IRIs must be resolved against a base IRI to make them absolute.

    Note that, in the RDF abstract syntax, while every absolute URI (and, hence, URL) is a valid
    IRI, not every IRI is a valid URI;

-   A **literal** is used for values such as strings, numbers and dates, and it consists of two or
    three elements:

    1. A **lexical form**, which is a Unicode string, encoding the value of the literal in Normal
       Form C;
    2. A **datatype IRI**, which is an IRI identifying the datatype of the literal, and determines
       how the lexical form maps to a literal value.

        For instance, the datatype `http://www.w3.org/2001/XMLSchema#boolean` determines that the
        literal `true` maps to the _true_ boolean value.

        The datatypes commonly used in RDF are compatible with XML Schema, and are described
        [here🔗](https://www.w3.org/TR/rdf11-concepts/#xsd-datatypes);

    3. If an only if the datatype IRI is `http://www.w3.org/1999/02/22-rdf-syntax-ns#langString`, a
       **non-empty language tag**;

-   A **blank node** is neither an IRI nor a literal. Each blank node has no identifier, hence
    cannot be distinguished from the others.

    To make blank nodes distinguishable, concrete RDF syntaxes (like JSON-LD) may assign to each
    blank node a so-called **blank node identifier**. Note that blank node identifiers entirely
    depend on the concrete syntax or implementation, i.e., different syntaxes or implementations may
    use different identifiers for the same blank node.

IRI, literals and blank nodes are distinct and distinguishable. For example, the string literal
`http://example.org` is neither equal to the IRI `http://example.org` nor to the blank node with
`http://example.org` as blank node identifier.

You can imagine the triple `(subject, predicate, object)` as a graph where `subject` and `object`
are two nodes, while `predicate` is a directed edge linking the `subject` and the `object`.

An **RDF graph** is a set of triples. In the same RDF graph, a predicate IRI can also occur as a
subject IRI or object IRI.

An **RDF dataset** is a collection of RDF graphs, and comprises:

-   Exactly one RDF graph, called **default graph**, which is not associated to an IRI nor a blank
    node. Note that is may be empty;
-   Zero or more RDF graphs, called **named graphs**, each of which is associated to a graph name
    that is an IRI or a blank node.

Therefore, all but one of the RDF graphs in an RDF dataset have an associated IRI or blank node,
while the remaining graph does not have an associated IRI nor a blank node.

### RDF Canonicalization

**Canonicalization** is the process of taking information that might be expressed in a variety of
semantically equivalent ways as input, and expressing all output in a single and standard format,
called a _canonical form_.

**RDF dataset canonicalization** allows to express an RDF dataset into a standard format, so that it
can be digitally-signed for later verification.

Indeed, since a directed graph can express the same information in more than one way, to produce a
digital signature from a graph, a canonicalization process is required.

The algorithm that computes the canonical form of an RDF dataset is called **Universal RDF Dataset
Canonicalization Algorithm 2015** or **URDNA2015**.

The canonicalization algorithm takes in input an RDF dataset, and returns a normalized RDF dataset.
That is, any two input datasets containing the same information (regardless fo their arrangement)
will be transformed into identical normalized dataset.

The problem requires directed graphs to be deterministically ordered into sets of nodes and edges.
This is easy to do when all the nodes have globally-unique identifiers, but it can be difficult to
do when some nodes do not.

Since RDF graphs may contain blank nodes, and since blank nodes by definition have no identifier,
the canonicalization algorithm will deterministically assign to each of them a blank node
identifier.

## JSON Web Signature

**JSON Web Signature** (JWS) is a way to represent content secured with digital signatures or
Message Authentication Codes (MACs) using JSON-based data structures. Therefore, a JWS is a data
structure representing a digitally signed or MACed message.

The JWS cryptographic mechanisms provide integrity protection for an arbitrary sequence of octets.

A JSON Web Signature defines the following parts:

-   **JOSE Header** (JSON Object Signing and Encryption Header) contains the parameters describing
    the cryptographic operations and parameters employed.

    The JOSE Header comprises a set of **Header Parameters**, i.e., a set of key/value pairs.

    The JOSE header can be dividied in two parts, the JWS Protected Header and the JWS Unprotected
    Header.

-   **JWS Protected Header** is a JSON object that contains the Header Parameters that are integrity
    protected by the JWS Signature digital signature of MAC operation.
-   **JWS Unprotected Header** is a JSON object that contains the Header Parameters that are not
    integrity protected;
-   **JWS Payload** is the sequence of octets to be secured;
-   **JWS Signature** is a digital signature or MAC computed over the JWS Protected Header and the
    JWS Payload.

Examples of JWSs can be found [here🔗](https://www.rfc-editor.org/rfc/rfc7515#appendix-A).

### JOSE Header

The following sections describe some Header Parameters that can be found in the JOSE Header.

#### `alg`

This Header Parameter identifies the cryptographic algorithm used to secure the JWS. It must be
present and must be understood and processed by implementations

The JWS Signature value cannot be considered valid if the `alg` value does not represent a supported
algorithm.

The value of this Header Parameter is a case-sensitive ASCII string containing a string or a URI.

#### `crit`

The `crit` Header Parameter is optional and indicates the critical extensions to the JWS
specification that must be understood and processed in order to consume the JWS. In particular, this
field contains a non-empty array of Header Parameter names that can be found in the JOSE Header and
that are part of one or more JWS specification extensions.

If any of the extension Header Parameters listed in the `crit` field are not understood and
supported by the recipient, then the JWS is invalid. Moreover, the JWS is considered invalid also if
the `crit` Header Parameter contains an empty array.

When used, the `crit` Header Parameter must be integrity protected.

The following is an example of a JOSE Header containing an extension Header Parameter named `exp`:

```json
{
    "alg": "ES256",
    "crit": ["exp"],
    "exp": 1234567890
}
```

### Serializations

JWSs use one of the following two serializations:

1. **JWS Compact Serialization**, which represents digitally signed or MACed content as a compact
   and URL-safe string.

    This serialization does not allow the representation of the JWS Unprotected Header that will,
    therefore, be absent. This implies that the JOSE Header comprises only the JWS Protected Header;

2. **JWS JSON Serialization**, which represents digitally signed or MACed content as a JSON object.
   This representation is neither optimized for compactness, nor it is URL-safe.

In our implementation, the JWS Compact Serialization is used.

### Message signature or MAC computation

To create a JWS, the following steps are performed:

1. Create the content to be used as the JWS Payload;
2. Compute the encoded payload value as:
    ```
    base64url(JWS Payload)
    ```
3. Create the JSON object containing the desired set of Header Parameters, which together comprise
   the JOSE Header;
4. Compute the encoded header value as:
    ```
    base64url(utf8(JWS Protected Header))
    ```
5. Compute the JWS Signature by applying the algorithm specified in the `alg` Header Parameter of
   the JOSE Header to the following JWS Signing Input:
    ```
    ascii(
        base64url(utf8(JWS Protected Header)) ||
        '.' ||
        base64url(JWS Payload)
    )
    ```
6. Compute the encoded signature value as:
    ```
    base64url(JWS Signature)
    ```
7. Create the desired serialized output. Using the JWS Compact Serialization, the resulting JWS will
   be:
    ```
    base64url(utf8(JWS Protected Header)) ||
    '.' ||
    base64url(JWS Payload) ||
    '.' ||
    base64url(JWS Signature)
    ```

### Message signature or MAC validation

When validating a JWS, the following steps are performed:

1. Parse the JWS representation to extract the serialized values for the components of the JWS, i.e:
    - `base64url(utf8(JWS Protected Header))`
    - `base64url(JWS Payload)`
    - `base64url(JWS Signature)`
2. Base64url-decode the encoded representation `base64url(utf8(JWS Protected Header))` of the JWS
   Protected header;
3. Verify that the octet sequence resulting from the step 2 is a UTF-8-encoded representation of a
   completely valid JSON object;
4. Verify that the JOSE Header does not contain duplicated Header Parameters;
5. Verify that the implementation understands and can process all the fields that it is required to
   supports, whether required by the JWS specification, by the algorithm being used, or by the
   `crit` Header Parameter value, and that the values of those parameters are also understood and
   supported;
6. Base64url-decode the encoded representation `base64url(JWS Payload)` of the JWS payload;
7. Base64url-decode the encoded representation `base64url(JWS Signature)` of the JWS Signature;
8. Validate the JWS Signature against the following JWS Signing Input
    ```
    ascii(
        base64url(utf8(JWS Protected Header)) ||
        '.' ||
        base64url(JWS Payload)
    )
    ```
    by using the algorithm specified in the `alg` Header Parameter of the JOSE Header.

If any of the previously listed steps fails, then the signature or MAC cannot be validated.

### String comparison

Any comparison between two strings is case-sensitive. Therefore, the Unicode characters of the
strings are transformed into Unicode code units, and then the comparison is performed numerically,
code unit by code unit.

### Base64url encoding

The base64url encoding is similar to the standard base64 encoding, except that no trailing `=`
character is added, and no line breaks, whitespace or other additional characters are allowed.

Moreover, the 62<sup>nd</sup> and 63<sup>rd</sup> character of the base64url encoding will be `-`
and `_` instead of `+` and `/`.

The following is the pseudocode to base64url-encode a string:

```javascript
function base64urlEncode(string) {
    // Regularly encode the string in base64
    let base64Encoded = encodeBase64(string);
    // Remove any traling =
    base64Encoded = base64Encoded.split("=")[0];
    // Replace the 62nd and 63rd characters of the base64 encoding
    base64Encoded = base64Encoded.replace("+", "-");
    base64Encoded = base64Encoded.replace("/", "_");

    return base64Encoded;
}
```

where `encodeBase64(string)` computes the base64 encoding of the specified string.

The following, instead, is the pseudocode to base64url-decode a string:

```javascript
function base64urlDecode(string) {
    // Replace the 62nd and 63rd characters of the base64url encoding
    let base64String = string.replace("-", "+");
    base64String = string.replace("_", "/");

    // Pad with trailing =
    switch (base64String.length % 4) {
        case 0:
            // No padding is needed
            break;
        case 2:
            // Add two padding =
            base64String = base64String + "==";
            break;
        case 3:
            // Add one padding =
            base64String = base64String + "=";
            break;
        default:
            // The input is malformed
            throw MalformedInputError();
    }

    // Decode the base64-encoded string
    return decodeBase64(base64String);
}
```

where `decodeBase64(base64String)` computes the string that, once base64-encoded, results in the
specified `base64String`.

### Detached content

In some contexts, it is useful to integrity-protect content that is not itself contained in a JWS.

One way to do this is to create a JWS in the normal fashion (using a representation of the content
as the JWS payload), but then delete the payload representation from the JWS. This codified object
is then sent to the recipient in place of the original JWS containing the payload.

When using the JWS Compact Serialization, the deletion of the payload is accomplished by replacing
the second field of the JWS (which contains `base64url(JWS Payload)`) with the empty string.

This method assumes that the recipient can reconstruct the exact payload used in the computation of
the JWS. Indeed, to use the modified JWS (the JWS without the payload) the recipient must
reconstruct the original JWS before validating it. To do so, the recipient must reconstruct the
payload so to then insert it into the modified JWS to obtain the original JWS.

Note that this method needs no support from JWS libraries, as applications can use this method by
modifying the inputs and the outputs of standard JWS libraries.

### JSON Web Signature (JWS) Unencoded Payload Option

JSON Web Signatures represent the payload of a JWS as a base64url-encoded value and uses this value
in the JWS Signature computation.

While this enables arbitrary payloads to be integrity protected, in some cases the base64url
encoding of the payload is unnecessary, or it can be unfeasible.

To make the base64url-encoding of the payload selectable and optional, the `b64` Header Parameter
can be specified in the JOSE Header. Since the `b64` Header Parameter is an extension of the JWS
specification, the value `b64` must be included in the `crit` Header Parameter so that
implementations not implementing the Unencoded Payload Option can reject the JWS instead of
misinterpreting it.

In particular, the `b64` Header Parameter is a JSON boolean value and:

-   If it is `true`, then the JWS Payload is encoded as `ascii(base64url(JWS Payload))` and the JWS
    Signing Input will be the usual one:
    ```
    ascii(
        base64url(utf8(JWS Protected Header)) ||
        '.' ||
        base64url(JWS Payload)
    )
    ```
-   If it is `false`, then the JWS Payload is not encoded, and the JWS Signing Input will be:
    ```
    ascii(
        base64url(utf8(JWS Protected Header))) ||
        '.'
    ) ||
    JWS Payload
    ```

The `b64` Header Parameter is optional and defaults to `true`. Moreover, if present, it must occur
within the JWS Protected Header.

Therefore, during the JWS computation, the payload is directly copied in the final JWS without
encoding it, while during the JWS verification, the payload does not have to be base64url-decoded.

Note that if `b64` is `false` and the JWS Compact Serialization is used to serialize a JWS,
different restrictions on the payload contents apply, mainly, it cannot contain a period `.`
character.

Moreover, if the JWS is used in context where URL-safeness is required, then the JWS payload must
contain only URL-safe characters, i.e., `'a'-'z'`, `'A'-'Z'`, `'0'-'9'`, dash `'-'`, underscore
`'_'` and tilde `'~'`.

If, instead, the URL-safeness is not required, then any ASCII-printable character other than the
period `.` can be used in the JWS payload.

### ES256K algorithm identifier

This algorithm identifier specifies the use of ECDSA (Elliptic Curve Digital Signature Algorithm)
with the secp256k1 curve and the SHA-256 cryptographic hash function to compute the JWS Signature.

The JOSE `alg` Header Parameter value for this algorithm is `ES256K`.

The following are the steps to generate a ECDSA secp256k1 SHA-256 digital signature:

1. Generate a digital signature of the JWS Signing Input using ECDSA secp256k1 SHA-256 with the
   desired private key.

    The output will be the pair `(R, S)` where `R` and `S` are 256-bit unsigned integers;

2. Turn `R` and `S` into two octet sequences in big-endian order, where each sequence is 32 octets
   long. The octet sequence representations must not be shortened to omit any leading zero octets
   contained in the values;
3. Concatenate the two octet sequences in the order `R` and then `S`;
4. The resulting sequence will contain 64 octets and will be the JWS Signature.

#### ES256K-R algorithm identifier

This algorithm identifier is an extension of the ES256K one. In particular, it adds the recovery bit
at the end of the signature, making the signature 65 octets long instead of 64.

## Blockchain address

The following sections detail how a blockchain address (like an Ethereum account address) can be
represented as a string.

### EIP-155

This Ethereum Improvement Proposal defines the chain IDs of well-known chains.

For instance, the Ethereum mainnet has chain ID `1`, while the geth private chains have chain ID
`1337`.

The chain IDs defined by the EIP-155 can be found
[here🔗](https://eips.ethereum.org/EIPS/eip-155#list-of-chain-ids).

### EIP-55

Ethereum addresses are composed of 40 characters plus 2 characters for the prepended `0x`. Since
these 40 characters are hexadecimal digits, it is easy for people to misspell it, making them
sending funds to invalid or unintended addresses.

For example, the following two addresses look similar:

```
0x27b1fdb04752bbc536007a920d24acb045561c26
```

```
0x27b1fdb04752bbc536007a920d24acb055561c26
```

but they differ in the 33<sup>rd</sup> character (35<sup>th</sup> character if you count also `0x`).

**EIP-55** proposes a way to encode an Ethereum address in a way that a misspelled address is
unlikely to be accepted. In this way, the users will not send their funds to an invalid address
because the transaction will be aborted.

The following is the pseudocode of the function that converts an Ethereum address to an
EIP-55-formatted string:

```javascript
function toEip55(address) {
    // Convert the address from an array of bytes to an hexadecimal string.
    // All the letters are in lowercase.
    // Note that the result of bytesToHex(address) is not prepended with "0x".
    // Implementations that convert an address to a string prepending "0x" should then remove it
    // before computing hexAddressHash.
    let hexAddress = bytesToHex(address).toLowerCase();
    // Compute the kekkak256 hash of the hexadecimal address string.
    // The hash is then converted to an array of bits, so that we can access a specific bit of the
    // hash.
    let hexAddressHash = keccak256Hash(hexAddress).toBitArray();

    // Compute the final address
    for (i = 0; i < 40; i++) {
        if (hexAddress[i] < "a") {
            // Numbers from 0 to 9 are left as they are
        } else {
            // Letters from "a" to "f" are:
            //    - Converted to uppercase if the bit in position 4*i of hexAddressHash is 1;
            //    - Left as they are if the bit in position 4*i of hexAddressHash is 0.
            if (hexAddressHash[4 * i] == 1) {
                hexAddress[i] = hexAddress[i].toUpperCase();
            } else {
                // The letter is left as it is
            }
        }
    }

    // Prepend the "0x" to the converted address
    return "0x" + hexAddress;
}
```

A JavaScript implementation of this pseudocode can be found
[here🔗](https://eips.ethereum.org/EIPS/eip-55#implementation).

As you can notice, the EIP-55 performs a deterministic capitalization of the `a` to `f` characters
of an Ethereum address represented as an hexadecimal string.

### CAIP-2

The **CAIP-2** specification defines a way to identify a blockchain in a human-readable,
developer-friendly and transaction-friendly way.

This specification is blockchain-agnostic, i.e., it can identify any blockchain.

### CAIP-10

**CAIP-10** is an extension of the CAIP-2 specification allowing to uniquely identify accounts for
any blockchain.

Like for the CAIP-2, this specification is blockchain-agnostic, i.e., it allows to identify an
account for any blockchain.

The format of a CAIP-10-formatted address is the following:

```
<caip_10_account_id>    := <namespace> ":" <chain_id> ":" <account_address>
<namespace>             := [a-z0-9\-]{3,8}
<chain_id>              := [a-zA-Z0-9\-_]{1,32}
<account_address>       := [a-zA-Z0-9\-\.%]{1,128}
```

where:

-   `<namespace>` usually describes an ecosystem of standards, like `bip122` for the Bitcoin
    blockchain, or `eip155` for the Ethereum blockchain;
-   `<chain_id>` is a way to identify a blockchain within a given namespace. For instance, if the
    `namespace` is `eip155`, then the value `1` identifies the mainnet (the chain with ID `1`) of
    the Ethereum blockchain (which has `eip155` as `namespace`);
-   `<account_address>` is a case-sensitive string whose format is specific to the blockchain
    identified by `<namespace>` and `<chain_id>`.

    Note that any non-alphanumeric character different from `-`, `_` and `%` should be URL-encoded
    to be placed here.

Some namespaces offer canonicalization schemes to be applied to the account address before placing
it in the `<account_address>` field. For example, Ethereum offers the EIP-55 canonicalization
scheme.

## DID

A **DID** (Decentralized Identifier) is a new type of identifier that enables verifiable and
decentralized digital identity.

Valid DIDs must follow the following scheme:

```
did:<did-method>:<did-identifier>
```

Any DID resolves to a **DID document**, which contains information associated with the DID.

### DID URL

A **DID URL** is an identifier that identifies a specific resource. In particular, it can be used to
retrieve representations of DID subjects, verification methods, services, specific parts of a DID
document, or other resources.

A DID URL must follow the following scheme:

```
did[/path][?query][#fragment]
```

For example, the DID URL `did:example:1234567890abcdef?service=my-service` can be used to retrieve,
from the DID document associated to the DID `1234567890abcdef`, the service endpoint of the service
identified with the name `my-service`.

The DID URL `query` part may contain the following parameters:

-   `service`, which identifies a service from the DID document by service ID.

    If this query parameter is present, its associated value must be an ASCII string;

-   `relativeRef`, which is a relative URI that identifies a resource at a service endpoint that is
    selected from a DID document by using the service parameter.

    If this query parameter is present, its associated value must be an ASCII string and must use
    percent-encoding to properly encode non-allowed characters;

-   `versionId`, which identifies a specific version of a DID document to be resolved. The version
    ID value is dictated by the DID method, and can be a sequential number, a UUID, or any other
    uniquely-identifying string.

    If this query parameter is present, its associated value must be an ASCII string;

-   `versionTime`, which identifies a certain version timestamp of a DID document to be resolved,
    that is the DID document that was associated to a DID at a certain time.

    If this query parameter is present, its associated value must be a valid XML datetime value
    encoded in an ASCII string. This datetime value must be normalized to UTC 00:00:00 and without
    sub-second decimal precision.

Note that `versionId` and `versionTime` are mutually exclusive.

Additional parameters can be used by the implementers. However, additional parameters should be
defined only if they are needed to resolve the DID document in a more precise way than the DID
alone. They should not be used if the same functionalities can be expressed by passing input
metadata to the DID resolver.

Therefore:

-   A DID URL specifies what resource is being identified;
-   The input metadata control how the resource is resolved.

#### Relative DID URL

A DID URL may be relative. In this case, the DID URL does not begin with a DID. This type of URLs is
expected to reference a resource in the same DID document.

To resolve a relative DID URL, the DID is concatenated to the relative DID URL, normalizing the
`path` component of the DID URL (i.e., resolving `.` and `..`) if necessary.

For example, the DID URL `#key` inside the DID document associated with the DID
`did:example:123456789abcdefghi` will be resolved as `did:example:123456789abcdefghi#key-1`.

Relative DID URLs are useful in situations where it is mandatory to reduce the size of the DID
documents.

### Requirements

The following is the list of requirements that DIDs must fulfill:

1. **Authentication/Proof of control**: It is possible to prove that the entity claiming control
   over the identifier is indeed its controller;
2. **Decentralized/self-issued**: The identifiers are managed and controlled by the DID controller
   (which may be the DID subject). No other party needs to manage the creation, update and recovery
   of a DID;
3. **Uniqueness**: The DIDs are guaranteed to be globally unique;
4. **No call home**: The verification and authentication when using DIDs do not require a _verifier_
   to contact the _issuer_ of that DID;
5. **Associated cryptographic material**: Each DID is tightly coupled with cryptographic material
   that can be used to prove control over that DID;
6. **Streamlined key rotation**: The update of the authentication materials requires minimal
   individual interaction and does not require for direct intervention of the requesting parties;
7. **Service endpoint discovery**: DIDs allow requesting parties to look up available service
   endpoints to interact with the DID subject;
8. **Privacy preserving**: The use of a DID does not, of itself, reveal any information about the
   DID subject;
9. **Delegation of control**: DID subject is able to delegate the control of the DID to a third
   party;
10. **Inter-jurisdictional**: DIDs are valid for uses anywhere, and no jurisdiction can prevent
    their use;
11. **Can't be administratively denied**: DIDs can't be denied or taken away by administrative
    functions;
12. **Minimized rents**: The DIDs don't occur in ongoing expenses if unused;
13. **No vendor lock in**: The DIDs are not dependent on any given vendor;
14. **Preempt/limit trackable data trails**: DIDs prevents unwanted or collusive tracking;
15. **Cryptographic future-proof**: DIDs are capable to be updated as technology evolves, so to use
    the same DID with updated and advanced authentication and authorization technologies;
16. **Survives issuing organization mortality**: DIDs survive the demise of the organization that
    has issued them;
17. **Survives deployment end-of-life**: DIDs are usable even after the systems deployed by the
    requesting parties reach their end-of-life;
18. **Survives relationship with service provider**: DIDs are not dependent on the relationship
    between the DID subject and a specific service provider.

    For instance, email addresses are not like so, because, if used as identifiers, they may cause
    problems if the user does not use anymore the service provider that has issued that email
    address;

19. **Cryptographic authentication and communication**: DIDs enable cryptographic techniques to
    authenticate individuals and to secure communications with the DID subject;
20. **Registry agnostic**: DIDs are free to reside on any registry implementing a compatible
    interface;
21. **Legally-enabled identity**: DIDs can be used as a basis for credentials and transactions that
    can be recognized as legally valid ander any jurisdiction;
22. **Human-centered interoperability**: DIDs need to be easy to use by people with no technical
    expertise or specialist knowledge.

### Actions

The following is the list of actions that DIDs must support. The specific implementation is demanded
to the DID methods.

#### Create

Controllers create DIDs uniquely binding cryptographic proofs with the DID. This binding is then
recorded inside a DID document. It should be possible to create the DID without interaction with any
particular authority.

#### Use

DIDs can be used by simply transmitting or presenting them. There is no requirement for them to be
human-readable.

Using cryptographic material stored in the DID document, requesting parties may test if the
individual presenting a DID is in fact its controller.

Moreover, using cryptographic material found in the DID document, DID controllers may sign digital
assets. This signature can be then used to demonstrate the authenticity of the asset. Indeed, given
a digital asset signed by a DID, using the cryptographic material stored in the DID document, a
requesting party can verify the signature.

#### Read

After a user presents a DID, the _verifier_ needs to resolve the DID into the DID document
associated to it.

Then, after having obtained the DID document, the _verifier_ can discover all the service endpoints
listed in the DID document, so to then interact with the user.

#### Update

An update operation includes:

1. **Rotation of the cryptographic material for a DID**: This is done by updating the associated DID
   document, and it has the effect of changing the cryptographic proof required to prove the control
   of the DID;
2. **Modification of the service endpoints**: DID controllers should be able to change the service
   endpoints associated to a DID;
3. **Forwarding/Migration**: Some DID methods may provide a way for the DID controllers to record
   that a DID is redirected to another DID, which has now the full authority to represent the
   original DID. This allows, for instance, to migrate a DID from a verifiable data registry to
   another;
4. **Recovery**: Some DID methods may provide means for recovering control of a DID if its existing
   private cryptographic material is lost.

#### Delete (or Deactivate)

Instead of deleting a DID, the DID controllers should be able to deactivate it. This is because most
decentralized systems does not support the deletion of a record.

## DID document

A DID document is a collection of key/value pairs. It contains:

-   [Properties](#did-document-properties);
-   [Representation-specific entries](#did-document-representation).

Both can be extended with new entries. While the first one requires the use of DID specification
Registries, the second does not.

All the keys must be strings. All the values, instead, can be one of the following types:

-   `integer`, expressing a real number without a fractional component;
-   `double`, expressing a real number with a fractional component;
-   `boolean`, expressing a boolean value (either `true` or `false`);
-   `string`, expressing a sequence of UTF-16 characters;
-   `null`, expressing the lack of any value;
-   `datetime`, expressing a date and time;
-   `list`, expressing a finite ordered sequence of values;
-   `set`, expressing a finite sequence of values where the same value twice does not appear twice
    in the sequence. The order of the values in the set is not important;
-   `map`, expressing a finite sequence of key/value pairs where the same key does not appear twice
    in the sequence. The order of the keys in the map is not important.

### DID document properties

The following is the list of properties that will be used in the implementation of the DID
documents:

| Name                                        | Required | Type                      |
| ------------------------------------------- | :------: | :------------------------ |
| [`id`](#id)                                 |    ✅    | `string`                  |
| [`controller`](#controller)                 |    ❌    | `string \| set<string>`   |
| [`verificationMethod`](#verificationmethod) |    ❌    | `set<VerificationMethod>` |
| [`authentication`](#authentication)         |    ❌    | `set<VerificationMethod>` |
| [`assertionMethod`](#assertionmethod)       |    ❌    | `set<VerificationMethod>` |
| [`keyAgreement`](#keyagreement)             |    ❌    | `set<VerificationMethod>` |
| [`service`](#service)                       |    ❌    | `set<Service>`            |

Practical examples of the usage of these fields can be found
[here](https://www.w3.org/TR/2023/NOTE-did-spec-registries-20230411/#did-document-properties).

#### `id`

A string specifying the DID subject. It must be a valid DID.

Moreover, the value of this property is immutable, i.e., it cannot be changed over time.

#### `controller`

A string or list of strings describing the DID controllers (i.e., the entities that can make changes
to the DID documents).

Any verification method specified in the DID document applies to both the DID subject and DID
controllers, i.e., the DID subject and DID controllers can use any of the verification methods
listed in the DID document to authenticate.

This field can be used, for instance, when the DID subject loses their private key. The controllers
will act as trusted third parties that can update the DID document so to remove the compromised key
and add the new one.

#### `verificationMethod`

A set of verification methods. Each verification method is a map containing all the following
fields:

-   `id: string`: a DID URL that uniquely identifies the verification method;
-   `type: string`: a string expressing the type of verification method. The type of verification
    method should be registered into the DID Specification Registries.
-   `controller: string`: the DID of the controller of the verification method. For instance, if the
    verification method is a public key, then this field contains the DID of the subject controlling
    that key.

    Note that the controller of the verification method is not necessarily one of the DID
    controller, but can be any DID subject.

Other fields may be added, according to the needs of the type of verification method. For instance,
the verification method type `Ed25519VerificationKey2020` requires the field `publicKeyMultibase` to
contain the public key associated to the private key used to authenticate the DID subject or DID
controllers.

The verification methods type `EcdsaSecp256k1RecoverySignature2020`, instead, may make use of the
`blockchainAccountId` field, which allows to store the identifier of a blockchain account encoded
according the CAIP-10 Account ID specification.

#### `authentication`

A set of verification methods that can be used to authenticate the DID subject (i.e., the entity
identifier by the DID described in the DID document).

This field contains one or more verification relationships, i.e., a relationship between the DID
subject and one of the verification methods. It is responsibility of the verifier to authenticate
the user against one of the verification methods described in this field.

Each verification method contained in this field can be:

-   Embedded, in which the verification method is not described in the `verificationMethod` field,
    but it is directly included as an element of the set associated to this field.
-   Referenced, in which the verification method is described in the `verificationMethod`, and the
    DID URL referencing it is placed in this field.

Example from
[here](https://www.w3.org/TR/2022/REC-did-core-20220719/#example-embedding-and-referencing-verification-methods):

```json5
{
    authentication: [
        // Verification method referenced wih a DID URL
        "did:example:123456789abcdefghi#keys-1",
        // Verification method
        {
            id: "did:example:123456789abcdefghi#keys-2",
            type: "Ed25519VerificationKey2020",
            controller: "did:example:123456789abcdefghi",
            publicKeyMultibase: "zH3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
        }
    ]
}
```

What the user can do after authentication (e.g., update or delete the DID document) is up to the DID
method, and it is not described in the DID document.

Note that the verification methods described in this field allow to authenticate only the DID
subject described in the DID document, hence the authentication methods cannot be used to
authenticate any of the DID controllers. To authenticate a DID controller, the verifier must use one
of the verification methods described in the `authentication` field of the DID document associated
to the DID controller.

A concept example of the usage of this property can be found
[here](https://www.w3.org/TR/2021/NOTE-did-use-cases-20210317/#eduDescription).

#### `assertionMethod`

A set of verification methods that specifies how the DID subject is expected to express claims, such
as Verifiable Credentials.

Like for the [`authentication`](#authentication) field, the verification methods described in this
field can be either embedded ore referenced.

This field is useful, for instance, when a verifier needs to check the validity of a Verifiable
Credential issued by the DID subject described in the DID document. In particular, the verifier uses
one of the verification methods described in this field to check the proof (e.g., the digital
signature created by the issuer) contained in the Verifiable Credential.

#### `keyAgreement`

A set of verification methods that specifies how an entity can generate the encryption material so
to transmit confidential information intended for the DID subject described in the DID document.

For instance, this field can list a set of public keys that can be used to encrypt a message that
only the DID subject described in the DID document can decrypt.

Like for the [`authentication`](#authentication) field, the verification methods described in this
field can be either embedded ore referenced.

#### `service`

A set of services, each of which specifying a way of communicating with the DID subject or
associated entities.

Each service is a map containing all the following fields:

-   `id: string`: a DID URL that uniquely identifies the service;
-   `type: string | set<string>`: A string or a set of strings expressing the type of service. Any
    type together with its associated properties should be registered into the DID Specification
    Registries;
-   `serviceEndpoint: string | map | set<string> | set<map>`: A string, or a set or a map composed
    of one or more strings or maps. All strings must be valid URIs, each of which expresses an
    endpoint that allows to contact the DID subject.

Each service may include additional properties.

##### Credential registry

A service endpoint with type `CredentialRegistry` allows the publication of a service endpoint
through which verifiable credentials can be queried.

Each credential registry endpoint is a REST endpoint. When a `GET` request is sent to the URI formed
by appending the ID of the credential subject as a URL-encoded string to the endpoint URI, an array
of verifiable credentials associated to the subject is returned.

This field may contain:

-   One URI as a `string` (example from
    [here](https://www.w3.org/TR/2023/NOTE-did-spec-registries-20230411/#example-example-of-service-and-serviceendpoint-properties-3)):

    ```json5
    {
        // ...
        service: [
            {
                id: "did:example:123#vcregistry-2",
                type: "CredentialRegistry",
                serviceEndpoint: "https://ssi.eecc.de/api/registry/vcs/{credentialSubject.id}"
            }
        ]
    }
    ```

-   A list of URIs encapsulated in a map with the only field `registries` (example from
    [here](https://www.w3.org/TR/2023/NOTE-did-spec-registries-20230411/#example-example-of-service-and-serviceendpoint-properties-3)):
    ```json5
    {
        // ...
        service: [
            {
                id: "did:example:123#vcregistry-1",
                type: "CredentialRegistry",
                serviceEndpoint: {
                    registries: [
                        "https://registry.example.com/{credentialSubject.id}",
                        "https://identity.foundation/vcs/{credentialSubject.id}"
                    ]
                }
            }
        ]
    }
    ```

If this service type is used, and the DID document is represented using JSON-LD, then the
`https://ssi.eecc.de/api/registry/context/credentialregistry` context must be added to the
`@context` field.

### DID document representation

The representation used when exchanging DID documents is JSON-LD, with media type string
`application/did+ld+json`.

The types of the values in the DID document are converted to JSON-LD and vice versa according to the
following table:

| Data type  | JSON-LD type                                          |
| ---------- | ----------------------------------------------------- |
| `integer`  | `number` without a decimal fraction point             |
| `double`   | `number` with a decimal fraction point                |
| `boolean`  | `boolean`                                             |
| `string`   | `string`                                              |
| `null`     | `null` literal                                        |
| `datetime` | `string` containing an XML Datetime normalized TO UTC |
| `list`     | `array`                                               |
| `set`      | `array`                                               |
| `map`      | `object`, where the keys are the `string`s            |

The root of the JSON-LD document is a JSON object.

In addition, a valid JSON-LD document contains a `@context` field, specifying the string
`https://www.w3.org/ns/did/v1` or a JSON array of strings where the first element is
`https://www.w3.org/ns/did/v1` followed by other contexts, which should be included in the DID
Document Registries.

The contexts specify all the terms that a JSON-LD document can contain. All the terms in a JSON-LD
document that are not found in any context will be ignored.

Before using the information stated in a context, the integrity of the context should be checked.
For instance, if the `@context` field contains the URL `https://www.example.com/my-context`, then
the resource found at that link may change over time, and may be compromised as well. This may
invalidate the DID document, since fields in the DID document may not be present in the JSON-LD
context because a malicious user has removed them, making a verifier client ignore those fields.

## DID resolution

The DID resolution process takes in input a DID and returns in output the associated DID document.

The DID resolver implements the following functions:

-   ```
    resolve(did, resolutionOptions) -> (didResolutionMetadata, didDocument, didDocumentMetadata)
    ```
    which returns the DID document as a map;
-   ```
    resolveRepresentation(did, resolutionOptions) -> (didResolutionMetadata, didDocumentStream, didDocumentMetadata)
    ```
    which returns the DID document as a JSON-LD document.

In both the cases, the result must be encoded in the JSON-LD format, specifying the context
`https://w3id.org/did-resolution/v1` in the `@context` field.

### `did`

The DID to resolve.

### `resolutionOptions`

A structure defining additional options of the DID resolution process. This structure is required,
but it may be empty.

In particular, the structure can contain the field `accept`, which determines the media type of the
representation of the DID document contained in `didDocumentStream` and returned by the
`resolveRepresentation` function. The `accept` field is ignored by the `resolve` function.

Additional fields can be added, provided that they are described in the DID Specification
Registries.

### `didResolutionMetadata`

A structure containing one of the following fields:

-   `contentType`: if the resolution is successful and the `resolveRepresentation` function has been
    called, then this field contains the string `application/did+ld+json`. Otherwise, if the
    resolution is not successful or if the `resolve` function has been called, this field must not
    be present;

-   `error`: if the resolution is not successful, then this field contains a description of the
    error occurred. The possible values are:

    -   `invalidDid`, if the DID specified in the `did` parameter does not conform the DID syntax;
    -   `notFound`, if the DID document associated with the specified `did` has not been found;
    -   `representationNotSupported`, if the `resolveRepresentation` function has been called and
        the `accept` field of the `resolutionOptions` parameter is not the string
        `application/did+ld+json`;
    -   `methodNotSupported` if the DID resolver does not support the DID method;
    -   `internalError` if an unexpected error occurs during the DID resolution process.

    Additional values can be used, provided that they are described in the DID Specification
    Registries.

    In case the resolution is successful, then this field must not be present.

Additional fields can be added, provided that they are described in the DID Specification
Registries.

### `didDocument`

In case the resolution is successful, this value is the DID document expressed as a map.

If, instead, the resolution is not successful, this value is empty.

### `didDocumentStream`

In case the resolution is successful, this value is the JSON-LD representation of the DID document,
provided that the `accept` field of the `resolutionOptions` parameter is the string
`application/did+ld+json`.

If, instead, the resolution is not successful, or the `accept` field of the `resolutionOptions`
parameter is not the string `application/did+ld+json`, then this value is empty.

### `didDocumentMetadata`

In case the resolution is successful, this value is a structure containing metadata related to the
DID document. The structure contains one or more of the following properties:

-   `created`, a `string` containing the date and time of when the document has been created. The
    date and time must be formatted as an XML Datetime normalized to UTC 00:00:00 and without
    sub-second decimal precision;

-   `updated`, a `string` containing the date and time of the last update of the document. The date
    and time must be formatted as an XML Datetime normalized to UTC 00:00:00 and without sub-second
    decimal precision.

    This property should be omitted if not update operation has ever been performed;

-   `deactivated`, a `boolean` value expressing whether the DID document has been deactivated. If
    the document has been deactivated, this field must be present, and must have value `true`. If
    the document, instead, has not been deactivated, then this field can be either omitted, or it
    can be specified with value `false`;
-   `versionId`, an ASCII `string` containing the version of the resolved DID document;
-   `nextVersionId`, an ASCII string containing the version ID of the next version of the DID
    document.

    This property is present only if the resolved DID document is not the latest version of the
    document.

-   `nextUpdate`, a `string` containing the date and time of the next update performed on the DID
    document. The date and time must be formatted as an XML Datetime normalized to UTC 00:00:00 and
    without sub-second decimal precision.

    This property is present only if the resolved DID document is not the latest version of the
    document.

Note that the `nextVersionId` and `nextUpdate` properties can also be omitted if the DID method does
not support the versioning of the DID documents.

Additional fields can be added, provided that they are described in the DID Specification
Registries.

In case the resolution is not successful, this value is an empty structure.

## DID URL dereferencing

The DID URL dereferencing process takes in input a DID URL and returns in output the resource
identified by the specified DID URL.

Note that if the DID URL to resolve contains a fragment, then th dereferencing of the part of the
DID URL before the fragment is done by the DID resolver, while the dereferencing of the fragment is
done by the client invoking the DID resolver.

For example, if the DID resolver is requested to resolve the DID `did:example:123#xyz`, then
`did:example:123` is resolved by the DID resolver, while the fragment `#xyz` is resolved by the
client against the resource returned by the DID resolver upon the resolution of `did:example:123`.

The DID resolver implements the following function:

-   ```
    dereference(didUrl, dereferenceOptions) -> (dereferencingMetadata, contentStream, contentMetadata)
    ```

### `didUrl`

The DID URL to dereference.

To dereference a relative DID URL (e.g., a DID URL containing only the fragment), the caller must
specify the absolute DID URL.

### `dereferenceOptions`

A structure defining additional options of the dereferencing process. This structure is required,
but it may be empty.

In particular, the structure can contain the field `accept`, which determines the media type of the
resource contained in the returned `contentStream`.

Additional fields can be added to the structure, provided that they are described in the DID
Specification Registries.

### `dereferencingMetadata`

A structure containing one of the following fields:

-   `contentType`: if the dereferencing is successful, then this field contains the media type of
    the resource contained in the returned `contentStream`. Otherwise, if the dereferencing is not
    successful, this field must not be present;
-   `error`: if the resolution is not successful, then this field contains a description of the
    error occurred. The possible values are:

    -   `invalidDidUrl`, if the DID URL specified in the `didUrl` parameter does not conform the DID
        URL syntax;
    -   `notFound`, if the DID URL specified in the `didUrl` parameter does not refer to a resource.
    -   `representationNotSupported`, if the `accept` property of the `dereferenceOptions` parameter
        is not the string `application/did+ld+json`;
    -   `methodNotSupported` if the DID resolver does not support the DID method;
    -   `internalError` if an unexpected error occurs during the DID URL dereferencing process.

    Additional values can be used, provided that they are described in the DID Specification
    Registries.

    In case the resolution is successful, then this field must not be present.

Additional fields can be added, provided that they are described in the DID Specification
Registries.

### `contentStream`

If the dereferencing process has been executed successfully, this value is the resource referred by
the DID URL specified in the `didUrl` parameter.

If the dereferencing was not successful, then this value is empty.

#### `contentMetadata`

In case the dereferencing process was successfully performed, this value is a structure expressing
metadata about the resource in `contentStream`.

If `contentStream` is a DID document, this structure must be a `didDocumentMetadata`, described
[here](#diddocumentmetadata). Otherwise, this structure can contain any metadata related to the
resource contained in `contentStream`.

If the dereferencing was not successful, then this value is an empty structure.

## DID method

The DID method describes how the previously described features are implemented.

In particular, it describes the mechanisms for creating, resolving, updating and deactivating a DID
or a DID document using a specific verifiable data registry.

Note that the DID resolution algorithm involves the execution of the read operation on a DID
according to its DID method.

Regarding the read operation, DID methods may directly return a stored DID document, or it can
perform complex multistep processes that involve on-the-fly construction of a "virtual" DID
document.

A verifiable read guarantees about the integrity and correctness of the result of the _read_
operation. DID methods may define different ways of implementing their _read_ operation, but it
should offer at least one implementation that allows a DID resolver to perform a verifiable read.

For example, in case the read operation involves the use of blockchains, the DID resolver may check
whether the returned DID document hasn't been tampered with by checking a content integrity proof.

See the [did-method-specification.md](did-method-specification.md) file for further details on the
implemented DID method.

## Verifiable credential

Verifiable credentials are cryptographically secure, privacy respecting, and machine-verifiable.

In the ecosystem where verifiable credentials are expected to be useful, five main actors can be
identified:

1. **Holder**: the entity that possesses one or more verifiable credentials and that can generate
   verifiable presentations from them;
2. **Issuer**: the entity that asserts claims about one or more subject, creating a verifiable
   credential of these claims, and transmitting the verifiable credential to the holder;
3. **Subject**: the entity about which claims are made. In many cases the holder of a verifiable
   credential is also the subject. However, there are cases where this is not the case. For
   instance, a parent, which is the holder, may hold verifiable credentials issued to a child, which
   is the subject;
4. **Verifier**: the entity that receives a verifiable credential, optionally inside a verifiable
   presentation, so to process it;
5. **Verifiable data registry**: a system that mediates the creation and verification of
   identifiers, keys and other relevant data like verifiable credential schemas or revocation
   registries.

### Requirements

Verifiable credentials should comply with the following requirements:

1. Verifiable credentials represent statements made by an issuer in a tamper-evident and
   privacy-respecting manner;
2. Holders hold verifiable credentials issued by different issuers;
3. Holder transform a verifiable credential into a verifiable presentation so to make it
   tamper-evident;
4. Issuers can issue verifiable credentials about any subject;
5. Acting as issuer, holder or verifier does not require any registration nor approval by any
   authority, as the trust involved is bilateral between parties;
6. Verifiable presentations allow any verifier to verify the authenticity of any verifiable
   credentials issued by any issuer;
7. Holders can interact with any issuer and any verifier through any user agent;
8. Holders can share verifiable presentations that can then be verified without revealing the
   identity of the verifier to any issuer;
9. Holders can store verifiable credentials in any location, without affecting their verifiability
   and without making the issuer know anything about where they are stored or when they are
   accessed;
10. Holders can present verifiable presentations to any verifier without affecting the authenticity
    of the claims;
11. A verifier can verify verifiable presentations from any holder;
12. The verification process should not depend on direct interactions between issuers and verifiers;
13. Issuers can issue verifiable credentials that support selective disclosure;
14. Verifiable presentations can either disclose the attributes of a verifiable credential, or they
    can satisfy boolean conditions called derived predicates;
15. Issuers can issue revocable verifiable credentials;
16. The process of cryptographically protecting and verifying verifiable credentials and verifiable
    presentations have to be deterministic, bi-directional, and lossless;
17. Verifiable credentials and verifiable presentations have to be serializable in one or more
    machine-readable data formats. The process of serialization and/or de-serialization has to be
    deterministic, bi-directional, and lossless;
18. The serialization and verification of a verifiable credential or verifiable presentation has to
    be transformable to a generic data model in a deterministic process, so that the resulting
    credential or presentation is semantically and syntactically equivalent to the original
    construct, without any loss of data or content;
19. The data model and serialization must be extendable with minimal coordination;
20. Revocation by the issuer should not reveal any identifying information about the subject, the
    holder, the specific verifiable credential, or the verifier;
21. Issuers can disclose the revocation reason;
22. Issuers revoking verifiable credentials should distinguish between revocation for cryptographic
    integrity (e.g., the signing key is compromised) and revocation for a status change (e.g., the
    driver's licence is suspended);
23. Issuers can provide a service for refreshing a verifiable credential;
24. Any entity can act as an issuer;
25. Holders can restrict the amount of information exposed in a verifiable credential they choose to
    share;
26. Holders can limit the duration of the verifiable credentials they share;
27. Verifiers must be able to access all the information required to verify the authenticity of a
    verifiable credential or verifiable presentation;
28. Holders can select if and which appropriate verifiable credentials should be sent to a verifier;
29. Issuers must be able to revoke claims in any moment.

An algorithm that receives a non-conforming verifiable credential or verifiable presentation must
generate an error.

### Lifecycle

The lifecycle of verifiable credentials and verifiable presentations in the ecosystem often takes a
common path:

1. The issuer issues one or more verifiable credentials about a subject;
2. The holder stores the verifiable credentials;
3. The holder might trasnfer one or more of its verifiable credentals to another holder;
4. The holder presents one or more verifiable credentials, optionally packed in a verifiable
   presentation, to a verifier;
5. The verifier verifies the received verifiable credential or verifiable presentation. This should
   include checking also the credential status for revocation of the verifiable credentials.

In addition:

-   An issuer might revoke a verifiable credential;
-   A holder might delete a verifiable credential.

Note that the order of the actions is not fixed, and some actions might be taken more than once.
Moreover, such action-recurrence might be immediate or at any later point.

The specification does not define any protocol for transferring verifiable credentials or verifiable
presentations. The specification also does not define an authorization framework, nor the decisions
that a verifier might make after verifying a verifiable credential or verifiable presentation.

### Attributes

| Name                                            | Required | Type                                        | Credentials | Presentations |
| ----------------------------------------------- | :------: | ------------------------------------------- | :---------: | :-----------: |
| [`@context`](#context)                          |    ✅    | `set<string>`                               |     ✅      |      ✅       |
| [`id`](#id-1)                                   |    ❌    | `string`                                    |     ✅      |      ✅       |
| [`type`](#type)                                 |    ✅    | `set<string>`                               |     ✅      |      ✅       |
| [`credentialSubject`](#credentialsubject)       |    ✅    | `object\|set<*>`                            |     ✅      |      ❌       |
| [`issuer`](#issuer)                             |    ✅    | `string\|object`                            |     ✅      |      ❌       |
| [`issuanceDate`](#issuancedate)                 |    ✅    | `date-time`                                 |     ✅      |      ❌       |
| [`proof`](#proof)                               |    ✅    | `Proof\|set<Proof>`                         |     ✅      |      ✅       |
| [`expirationDate`](#expirationdate)             |    ❌    | `date-time`                                 |     ✅      |      ❌       |
| [`credentialStatus`](#credentialstatus)         |    ❌    | `CredentialStatus`                          |     ✅      |      ❌       |
| [`verifiableCredential`](#verifiablecredential) |    ❌    | `set<VerifiableCredential>`                 |     ❌      |      ✅       |
| [`holder`](#holder)                             |    ❌    | `string`                                    |     ❌      |      ✅       |
| [`credentialSchema`](#credentialschema)         |    ❌    | `CredentialSchema \| set<CredentialSchema>` |     ✅      |      ❌       |
| [`refreshService`](#refreshservice)             |    ❌    | `RefreshService \| set<RefreshService>`     |     ✅      |      ✅       |

#### `@context`

An ordered set of one or more strings, in which the first string must be the URI
`https://www.w3.org/2018/credentials/v1`, while the other strings are URIs pointing to documents
containing machine-readable information about the fields that can be found in a valid verifiable
credential or verifiable presentation.

Additional contexts should be public and highly available so to be accessible at any time to the
verifiers that will process the verifiable credential or verifiable presentation.

If different contexts define the same term, then the verifiers must abort the process of validating
the verifiable credential or verifiable presentation.

Note that the verifier is not required to check the received verifiable credential or verifiable
presentation against the contexts. This allows to use simple JSON libraries or processors to extract
the information from the verifiable credential or verifiable presentation, making only the libraries
or processors that support also JSON-LD performing the full JSON-LD processing.

In any case, libraries and processors are required to check whether the order of the values in this
field is respected.

It is up to the verifiers to accept or not a verifiable credential that contains additional
contexts.

#### `id`

A string containing a URI that, once dereferenced, results in a document containing machine-readable
information about the thing identified by that identifier.

Since the `id` can be used to correlate the subject activities, when privacy is a strong
consideration the `id` property may be omitted.

Indeed, multiple verifiers, or an issuer and a verifier, can collude and correlate the holder. If
holder want to reduce correlation, they should use verifiable credential schemes that allow for
hiding the identifier when creating a verifiable presentation.

#### `type`

A set of strings containing either:

-   URIs that, once dereferenced, result in a document containing machine-readable information about
    the type;
-   JSON-LD terms described in one of the contexts specified in the `@context` property. In
    particular:
    -   In case of verifiable credentials, this set must contain the string `VerifiableCredential`;
    -   In case of verifiable presentations, this set must contain the string
        `VerifiablePresentation`.

Verifiable credentials and verifiable presentations that do not have a `type` property are not
verifiable.

Additional types can be associated to the verifiable credential or verifiable presentation so that
software systems can process additional information contained in the credential or presentation.

#### `credentialSubject`

A set of objects each of which contains one or more properties that are related to a subject of the
verifiable credentials.

Each object may contain an `id` property, which contains an identifier (like a DID) that uniquely
identifies the user the verifiable credential is issued to.

However, the use of this property may create a greater risk of correlation when the identifiers are
long-lived or used across more than one web domain. In this case, it is strongly advised that
identifiers are either:

-   Bound to a single origin;
-   Single-use
-   Replaced by short-lived, single-use bearer tokens. These types of tokens are verifiable
    credentials that do not specify the `credentialSubject.id` property. While they can be
    privacy-enhancing since they do not contain any identifier of the holder, bearer tokens must be
    carefully crafted so not to accidentally divulge more information that the holder expects.
    Moreover, these tokens should be used only once because the repeated use of the same bearer
    token across multiple sites enables these sites to potentially collude to track or correlate the
    holder.

Note that it is possible to express information related to multiple objects inside the same
verifiable credential. In this case, the `credentialSubject` property will be a set of objects.

#### `issuer`

A string expressing the issuer of the verifiable credential. In particular, the string contains the
URI of a resource that, once dereferenced, results in a document containing machine-readable
information about the issuer.

It is also possible to express additional information about the issuer by associating and object
with the issuer property. Each property of that object expresses different information, e.g., the
name of the issuer.

Note that the value of the issuer property can be a DID.

#### `issuanceDate`

A date-time string representing the date and time after which the credential becomes valid, which
could be a date and time in the future.

#### `proof`

An object containing a cryptographic proof that can be used to detect tampering and to verify the
authorship of a verifiable credential or a verifiable presentation.

This field may also contain multiple proofs in the form of a set of objects, each of which
describing a proof.

Such proofs can be:

-   External if they wrap expressions of a data model, like JSON Web Tokens;
-   Embedded if all their related data is included in the object.

In case of embedded proofs, the specific meaning of each field of the object is dictated by the
`type` property that the proof object must contain.

In any case, the other fields found in an object proof depend on the specific proof-creation
algorithm.

The algorithms and suites that can be used to generate valid proofs and then to verify them can be
found [here](https://w3c-ccg.github.io/ld-cryptosuite-registry/#signature-suites).

Note that the properties in this field may create a greater risk of correlation when the same values
are used across more than one session or domain and the value does not change. To avoid this type of
correlation, signature values and metadata should be regenerated each time.

#### `expirationDate`

A `date-time` string representing the date and time after which the verifiable credential cannot be
considered valid anymore.

#### `credentialStatus`

An object with the following properties:

-   `id: string` which is a URI;
-   `type: string`, which expresses the credential status type.

The value of the `type` field is expected to provide enough information to determine the current
status of the credential. In particular, dereferencing the URI specified in the `id` field, the
resulting resource contains machine-readable information stating the current status of the
credential.

The precise content of the credential status information obtained by dereferencing the URI specified
in the `id` field is determined by the value of the `type` field.

Note that, to avoid correlation, issuers must not use mechanisms to determine the current status of
a credential that are unique per credential. Indeed, this enables issuers to collude and correlate
the holder of a specific verifiable credential to the verifiers receiving it.

For example, if the verifiable credential contains this value for the `credentialStatus` property:

```json5
{
    // ...
    credentialStatus: {
        id: "https://my.service.com/status/15",
        type: "...."
    }
    // ...
}
```

then the issuer is able to track each verifier asking for the status of that specific verifiable
credential, effectively correlating the holder and the verifiers.

To avoid this, issuers should use a publicly-available revocation list, and then placing the URL in
the `credentialStatus.id` property so that the verifiers fetch the entire revocation list and look
into it to check if the verifiable credential has been revoked.

In this case, the issuer is cannot correlate the holder and the verifier anymore, since any
verifier, when receiving any verifiable credential presented by any holder, will ask for the same
revocation list.

#### `verifiableCredential`

A set of verifiable credentials, or a set of data derived from one or more verifiable credentials in
a cryptographically verifiable format.

#### `holder`

A string containing the URI of the entity that is generating the verifiable presentation.

#### `credentialSchema`

One or more data schemas that can be included by the issuer to impose a particular schema on the
contents of a verifiable credential.

Each data schema is described by an object with at least two fields:

-   `id: string`, which is the URI identifying the schema file;
-   `type: string`, which is the type of the schema (e.g., `JsonSchemaValidator2018`).

Depending on the value of the `type` field, additional fields may be added to the data schema
object.

Data schemas can also be used to specify mappings to other binary formats, such as those used to
perform zero-knowledge proofs. In this case, the issuer may insert in the `credentialSchema`
property an object containing the URL pointing to a zero-knowledge packed binary data format that is
capable of transforming the input data into a format that can be then used by a verifier to
determine if the proof provided with the verifiable credential is valid.

Note that this field has a different purpose from the `@context` one. Indeed, the JSON-LD contexts
just give the semantics of the fields in a verifiable credential, but does not enforce neither the
structure (which fields are present) nor the syntax of the credential (which values are correct for
each field).

Therefore, this field allows the verifier to perform syntactic checking of the verifiable
credentials using verification mechanisms such as JSON Schema validation.

#### `refreshService`

One or more objects describing services that can be contacted to refresh an expired verifiable
credential or verifiable presentation.

Each of these object must contain at least two properties:

-   `id: string`, which is the URI pointing to the refresh service;
-   `type: string`, which describes the type of refresh service (e.g., `ManualRefreshService2018`).

Additional properties may be added based on the value of the `type` property.

If this property is included in a verifiable credential, then either the verifier or the holder can
ask for the refreshing of the credential. If, instead, this property in included in a verifiable
presentation, then only the holder can ask for the refreshing of the credentials included in the
presentation. This is useful if the holder wants to refresh one or more credentials before
presenting them to a verifier.

The refresh service is expected to be used on when either the credential has expired, or the issuer
does not public any credential status information. Issuers should not include the `refreshService`
property in a verifiable credential if it does not contain public information or if the refresh
service is not protected.

Note that placing a `refreshService` property in a verifiable credential may be used by the verifier
to make the issuer issue the credential directly to the verifier, effectively bypassing the holder.

### Trust model

The verifiable credentials trust model is as follows:

-   The verifier trusts the issuer. To establish this trust, a verifiable credential is expected to
    either:
    -   Include a proof establishing that the issuer generated the verifiable credential;
    -   Have been transmitted in a way clearly establishing that the issuer generated the verifiable
        credential and hat the verifiable credential was not tampered with in transit or storage.
-   The holder and the verifier trust the issuer to issuer true (i.e., not false) credentials about
    the subject, and to revoke them quickly when appropriate;
-   The holder trusts the repository that stores and protects the access to the holder's verifiable
    credentials. In particular, the holder trusts the repository to store the credentials securely,
    not to release them to anyone other than the holder, and not to corrupt or loose them while they
    are in its care
-   All entities trust the verifiable data registry to be tamper-evident and to be a correct record
    of which data is controlled by which entity.

Note that:

-   The issuer and the verifier do not need to trust the repository storing the holder's verifiable
    credentials;
-   The issuer does not need to know or trust the verifier.

### Data integrity proofs

Data integrity proofs allow to easily protect verifiable credentials and verifiable presentations.

A data integrity proof object contains the following fields:

-   `id: string`: an optional identifier for the proof, which must be a URL. It can be used in cases
    where there are multiple proofs, and we want to give them an order;
-   `type: string`: the type of the cryptographic proof. This field determines what other fields are
    required to secure and verify the proof.

    A commonly used value for this field is `DataIntegrityProof`. This type requires the
    specification of the additional `cryptosuite` field, which specifies the name of the
    cryptographic suite used to create the proof;

-   `proofPurpose: string`: the reason the proof was created. The value of this field acts as a
    safeguard to prevent the proof from being misused by being applied to a purpose other than the
    one that was intended.

    Commonly used values are:

    -   `authentication`: indicates that a given proof is only to be used by an authentication
        protocol;
    -   `assertionMethod`: indicates that a proof can only be used for making assertions, like
        signing a verifiable credential or verifiable presentation.

-   `verificationMethod: string`: the URL (e.g., a DID URL) that, once dereferenced, results in a
    machine-readable document containing all the information needed to verify the proof;
-   `created: datetime`: the date and time the proof was created;
-   `domain: string`: an optional string or URI indicating the intended usage of the proof. The
    verifier should use this value to ensure the proof was intended to be used by them.

    This field is useful in challenge-response protocols where the verifier is operating from within
    a security domain known to the creator of the proof.

    A valid value for this field can be a DNS domain, a full Web origin, a well-known text string,
    or a UUID;

-   `challenge: string`: an optional randomly generated string that bounds the verifiable
    presentation to a specific request, avoiding reply-attacks;

-   `proofValue: string`: the data necessary to verify the proof using the specified
    `verificationMethod`. The value of this field must be a multibase-encoded binary value.

#### Generating the proof

To generate a proof, the following three steps are performed:

1. Transformation, which is a process described by a transformation algorithm that takes in input
   the data to sign and prepares it for the hashing process;
2. Hashing, which is a process described by a hashing algorithm that computes an identifier for the
   transformed data using a cryptographic function;
3. Proof generation, which is a process described by a proof serialization algorithm that computes a
   value that protects the integrity of the input data from modification.

The following is the pseudocode of a function generating a valid proof:

```javascript
function addProof(unsecuredDataDocument, cryptoSuiteOptions) {
    // Create a copy of the input document
    let securedDataDocument = unsecuredDataDocument.copy();
    // Transform the input document, so to obtain the data to hash
    let transformedData = transformDocument(unsecuredDataDocument, cryptoSuiteOptions);
    // Compute the hash of the transformed data
    let hashData = hash(transformedData, cryptoSuiteOptions);
    // Compute the proof
    let proof = computeProofObject(hashData, cryptoSuiteOptions);
    /*
     * Here the proof object contains the genrated proof. This code assumes the proof object to
     * contain all the required fields (at least, type, verificationMethod and proofPurpose, plus
     * any other field required by the cryptographic suite to verify the proof). If you are not
     * sure, you should verify that the proof object effectively contains all the required fields
     * and, if not, you should either add them, or raise an error.
     */
    // Add the proof to the document
    securedDataDocument.proof = proof;

    return securedDataDocument;
}
```

where the following functions are made available from the chosen cryptographic suite:

-   `transformDocument(unsecuredDataDocument, cryptoSuiteOptions)`, which is the transformation
    algorithm that, given the unsecured data document (i.e., the verifiable credential without the
    proof), computes the value that will then be hashed to compute the digital signature;
-   `hash(transformedData, cryptoSuiteOptions)`, which is the hashing algorithm that, given the
    transformed data, computes its hash;
-   `computeProofObject(hashData, cryptoSuiteOptions)`, which is the proof serialization algorithm
    that, given the computed hash, computes the final valid object to place in the `proof` field of
    the verifiable credential.

#### Verifying the proof

To verify a proof, the following three steps are performed:

1. Transformation, which is a process described by a transformation algorithm that takes in input
   the data to sign and prepares it for the hashing process;
2. Hashing, which is a process described by a hashing algorithm that computes an identifier for the
   transformed data using a cryptographic function;
3. Proof verification, which is a process described bt a proof verification algorithm that applies a
   cryptographic proof verification function to see if the input data can be trusted.

The following is the pseudocode of the function that verifies a proof:

```javascript
function verifyProof(securedDataDocument, options) {
    // Extract the proof object.
    let proof = securedDataDocument.proof;
    /*
     * Here the proof object is issumed to contain all the required fields (at least, type,
     * verificationMethod and proofPurpose, plus any other field required by the cryptographic suite
     * to verify the proof). This check can be performed before calling this function, or it can be
     * done right here.
     * Note that any proof object that does not contain the required fields should be discarded by
     * raising an error.
     */
    if (proof.proofPurpose != options.expectedProofPurpose) {
        // Raise an error
    }
    // Copy the secured data document removing the proof
    let unsecuredDataDocument = securedDataDocument.copy();
    delete unsecuredDataDocument.proof;

    // Transform the input document, so to obtain the data to hash
    let transformedData = transformDocument(unsecuredDataDocument, cryptoSuiteOptions);
    // Compute the hash of the transformed data
    let hashData = hash(transformedData, options);
    // Verify the proof
    let isProofVerified = proofVerification(hashData, options);
    /*
     * Check additional fields of the proof, like created, domain or challenge
     */

    // Return the final result
    return isProofVerified;
}
```

where the following functions are made available from the chosen cryptographic suite:

-   `transformDocument(unsecuredDataDocument, cryptoSuiteOptions)`, which is the transformation
    algorithm that, given the unsecured data document (i.e., the verifiable credential without the
    proof), computes the value that will then be hashed to compute the digital signature;
-   `hash(transformedData, cryptoSuiteOptions)`, which is the hashing algorithm that, given the
    transformed data, computes its hash;
-   `proofVerification(hashData, cryptoSuiteOptions)`, which is the proof verification algorithm
    that, given the computed hash, verifies whether the specified `hashData` is correct.

#### Transofmration functions

Canonicalization might be the implementation of the
`transformDocument(unsecuredDataDocument, cryptoSuiteOptions)`, which given the unsecured data
document computes the value that will then be hashed to compute the digital signature;

#### Ecdsa Secp256k1 Recovery Signature 2020 signature suite

The signatures consumed by Ethereum make use of the Elliptic Curve Digital Signature Algorithm
(ECDSA) and secp256k1 constants to define the elliptic curve as stated
[here](https://ethereum.org/en/developers/docs/evm/#evm-instructions) and
[here](https://www.codementor.io/@yosriady/signing-and-verifying-ethereum-signatures-vhe8ro3h6#ecdsa)

The EcdsaSecp256k1RecoverySignature2020 signature suite standardizes the signature scheme of
Ethereum allowing it use with verifiable credentials and verifiable presentations.

Since the EcdsaSecp256k1RecoverySignature2020 signature suite requires additional fields in the
`proof` property of the verifiable credential or verifiable presentation, the additional JSON-LD
context
`https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld`
must be included in the verifiable credential or verifiable presentation.

In particular, the `proof` property of the verifiable credential or verifiable presentation that
makes use of the EcdsaSecp256k1RecoverySignature2020 signature suite is expected to provide the
following properties:

-   `type`, which must be the value `EcdsaSecp256k1RecoverySignature2020`;
-   `created`, which is the date and time the proof was created (see
    [Data Integrity Proofs](#data-integrity-proofs));
-   `verificationMethod`, which is a URL (like a DID URL) that, once dereferenced, results in a
    resource containing all the information needed to verify the proof (see
    [Data Integrity Proofs](#data-integrity-proofs));
-   `proofPurpose`, which is the reason the proof was created;
-   `jws`, which is the detached JWS Compact Serialization generated with this cryptographic suite.

An example of a `proof` object, extracted from
[here](https://w3c-ccg.github.io/security-vocab/#example-2), is:

```json
{
    "type": "EcdsaSecp256k1RecoverySignature2020",
    "created": "2020-04-11T21:07:06Z",
    "verificationMethod": "did:example:123#vm-3",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..pp9eiLCMfN4EfSB3cbl3UxJ4TtgUaTfByDaaB6IZbXsnvIy5AUIFjbgaiFNtq9-3f8mP7foD_HXpjrdWZfzlwAE"
}
```

This suite uses:

1. As transformation algorithm, the _Universal RDF Dataset Canonicalization Algorithm 2015_
   (_URDNA2015_);
2. As hashing algorithm, the SHA-256 algorithm;
3. As proof generation and proof verification algorithms, the JSON Web Signature Unencoded Payload
   Option with a detached payload. To compute the signature, the ES256K-R suite is used. Therefore,
   the JOSE Header of the JWS will be:

    ```json
    {
        "alg": "ES256K-R",
        "b64": false,
        "crit": ["b64"]
    }
    ```

### Zero-Knowledge Proofs

A zero-knowledge proof is a cryptographic method where an entity can prove to another entity that
they know a certain value without disclosing the actual value.

The key capabilities introduced by zero-knowledge proof mechanisms are the ability of a holder to:

-   Combine multiple verifiable credentials from multiple issuers into a single verifiable
    presentation without revealing the verifiable credentials nor the subject identifier to the
    verifier;
-   Selectively disclose the claims in a verifiable credential to a verifier without requiring the
    issuance of multiple atomic verifiable credentials;
-   Produce a derived verifiable credential formatted according to the verifier's data schema
    instead of the issuer's one, without needing to involve the issuer after the verifiable
    credential issuance.

There are two requirements for verifiable credentials when they are to be used in zero-knowledge
proof systems:

1. The verifiable credential must contain the `proof` property, so that the holder can derive a
   verifiable presentation that reveals only the information that the holder intends to reveal;
2. If a credential definition is being used, then the verifiable credential must contain the
   `credentialSchema` property, so that it can be used by all parties to perform various
   cryptographic operations in zero-knowledge.

The verifiable presentations derived from one or more verifiable credentials must fulfill the
following requirements:

1. Each derived verifiable credential within a verifiable presentation must contain all information
   necessary to verify the verifiable credential, either by including it directly within the
   credential, or by referencing the necessary information;
2. The verifiable presentation must not leak information that would enable the verifier to correlate
   the holder across multiple verifiable presentations;
3. The verifiable presentation should contain a `proof` property to enable the verifier to that that
   all derived verifiable credentials in the verifiable presentation where issued to the same holder
   without leaking personally identifiable information that the holder did not intend to share.

### Creating new credential types

Verifiable credentials must specify the `type` property. Sometimes, there are existing credential
types that can be reused. However, there are often cases where new credential types are needed.

To create a new credential type, the steps to follow are:

1. **Design the data model**, i.e., design what properties should be placed inside the
   `credentialSubject` property;
2. **Define the JSON-LD context**, i.e., define what contexts describe the fields that can be found
   in the `credentialSubject` property. You can either use an already-defined context (like
   _schema.org_), or you can define one by your own.

    Typically, you define your own context if the `credentialSubject` property may contain fields
    that are not described in well-known context, or if these well-known contexts contain much more
    term definitions that the ones that are necessary for your purpose.

    The last case does not mean that you cannot use well-known contexts (like _schema.org_) in your
    context definition. Indeed, you can reuse the `schema.org` vocabulary terms to create a more
    concise and targeted context that fits your needs;

3. **Select a publishing location**, i.e., if you created your own JSON-LD context, you should
   select where to publish the context so to allow any verifier to access it. Otherwise, you can
   skip this step.

    The location should be a URL that, once dereferenced, results in a resource that depends on the
    request of the user agent.

    In particular, by default, the resource returned should be JSON-LD context. If, instead, the
    user agent explicitly requests an HTML page (i.e., a resource with type `text/html`), the
    resource returned should be a page describing, in a human-readable format, the definitions of
    the terms in the context.

4. **Use the JSON-LD context when issuing new credentials**, i.e., when creating a verifiable
   credential, you should include the JSON-LD context in the `@context` field. In the case you have
   created your own context, you should also add the type defined in the JSON-LD context to the
   `type` property of the verifiable credential.

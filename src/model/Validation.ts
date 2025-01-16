import type { JSONSchema, FromSchema, $Compiler } from "json-schema-to-ts";
import { wrapCompilerAsTypeGuard } from "json-schema-to-ts";
import { slog } from "../slog";
import { Ajv } from "ajv";

type TypeGuard<T> = (data: unknown) => data is T;

/**
 * JSON Schema definition for the metadata of a post.
 */
const PostMetaSchema = {
  $id: "postMeta.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PostMeta",
  type: "object",
  required: ["createdBy", "createdAt", "lastModifiedBy", "lastModifiedAt"],
  properties: {
    createdBy: { type: "string" },
    createdAt: { type: "number" },
    lastModifiedBy: { type: "string" },
    lastModifiedAt: { type: "number" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * JSON Schema definition for the document structure of a post.
 */
const PostDocSchema = {
  $id: "postDoc.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PostDoc",
  type: "object",
  required: [],
  properties: {
    msg: { type: "string" },
    parent: { type: "string" },
    reactions: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: { type: "string" },
      },
    },
    // p2group64: { type: "string" }, // our extension?
  },
  additionalProperties: true, // Allow other arbitrary fields, but ignore them (other exntensions that arent ours)
} as const satisfies JSONSchema;

/**
 * JSON Schema definition for the structure of a post.
 */
const PostSchema = {
  $id: "post.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "Post",
  type: "object",
  required: ["path", "doc", "meta"],
  properties: {
    path: { type: "string" },
    doc: { $ref: "postDoc.json" },
    meta: { $ref: "postMeta.json" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * This schema defines an array structure for `Post` objects.
 */
const PostArraySchema = {
  $id: "postArray.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PostArray",
  type: "array",
  items: { $ref: "post.json" },
} as const satisfies JSONSchema;

/**
 * This schema defines the structure of an authentication object.
 */
const authSchema = {
  $id: "auth.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "Auth",
  type: "object",
  required: ["token"],
  properties: {
    token: { type: "string" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * This schema defines the structure of a URI object.
 */
const URISchema = {
  $id: "URI.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "URI",
  type: "object",
  required: ["uri"],
  properties: {
    uri: { type: "string" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * This schema defines the structure of a response for a PATCH operation.
 */
const PATCHResponseSchema = {
  $id: "PATCHResponse.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PATCHResponse",
  type: "object",
  required: ["uri", "patchFailed", "message"],
  properties: {
    uri: { type: "string" },
    patchFailed: { type: "boolean" },
    message: { type: "string" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

export type PostMeta = FromSchema<typeof PostMetaSchema>;
export type PostDoc = FromSchema<typeof PostDocSchema>;
export type Post = FromSchema<
  typeof PostSchema,
  { references: [typeof PostDocSchema, typeof PostMetaSchema] }
>;
export type PostArray = FromSchema<
  typeof PostArraySchema,
  {
    references: [
      typeof PostSchema,
      typeof PostDocSchema,
      typeof PostMetaSchema,
    ];
  }
>;

export type Auth = FromSchema<typeof authSchema>;
export type URI = FromSchema<typeof URISchema>;
export type PATCHResponse = FromSchema<typeof PATCHResponseSchema>;

const ajv = new Ajv();
const $compile: $Compiler = (schema) => ajv.compile(schema);
const compile = wrapCompilerAsTypeGuard($compile);

// Compile validators
export const isPostMeta = compile(PostMetaSchema);
export const isPostDoc = compile(PostDocSchema);
export const isPost = compile(PostSchema);
export const isPostArray = compile(PostArraySchema);
export const isAuth = compile(authSchema);
export const isURI = compile(URISchema);
export const isPATCHResponse = compile(PATCHResponseSchema);

/**
 * A utility function to fetch and validate data against a schema
 * @param url - The URL to fetch data from.
 * @param validate - A type guard function that checks if data conforms to type T.
 * @param options - Optional fetch configuration.
 * @returns A promise resolving to type T[] if validation passes.
 * @throws Error if validation fails or request is unsuccessful.
 */
export async function typedFetch<T>(
  url: string,
  validate: TypeGuard<T>,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }
  const data: unknown = await response.json();
  slog.info("Fetched data", ["data", data]);
  slog.info("Validation result for workspaces:", ["valid", validate(data)]);
  if (validate(data)) {
    return data;
  } else {
    throw new Error(`Response validation failed: ${JSON.stringify(data)}`);
  }
}

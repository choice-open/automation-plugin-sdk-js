import type { z } from "zod"
import type { JSONSchema } from "zod/v4/core"
import type { PluginManifestSchema } from "./schemas"

export interface PluginManifest {
  /** The name of the plugin. Must be a valid package name, optionally scoped. */
  name: string
  /** The version of the plugin. Must be a valid semver value. */
  version: string
  /** The description of the plugin. */
  description: string
  /** The author of the plugin. */
  author: string
  /** The email of the author. */
  email: string
  /** The repository of the plugin. */
  repository?: string
  /** The license file of the plugin. @default "license.md" */
  license?: string
  /** The privacy file of the plugin. @default "privacy.md" */
  privacy?: string
  /** The creation date of the plugin. @example "2000-01-01T00:00:00.000Z" */
  createdAt: string
}

export type PluginManifestOutput = z.output<typeof PluginManifestSchema>

/**
 * Internationalized text. It is used to store text in different languages.
 *
 * Only `en_US` is required and will be used by LLMs if necessary.
 *
 * Other languages are optional and will be fallback to `en_US` if not provided.
 *
 * @example
 * {
 *   en_US: "Hello, world!",
 *   zh_Hans: "你好，世界！"
 * }
 */
export interface I18nText {
  en_US: string
  zh_Hans?: string
}

export type Locale = keyof I18nText

export interface PluginProviderManifest {
  /** The human-readable name of the provider for UI display. */
  readonly name: I18nText

  /** The human-readable description of the provider for UI display. */
  readonly description: I18nText
}

export interface PluginToolProviderManifest extends PluginProviderManifest {
  /** The unique identifier of the tool. Must be unique within the plugin. */
  readonly id: string
  /**
   * The input schema of the tool.
   *
   * If not provided, the tool will be considered as a tool that does not accept any input.
   *
   * Please use `zod` to define the schema, and it will be translated to JSON Schema automatically.
   */
  readonly inputSchema?: z.ZodType<JSONSchema.JSONSchema>
  /**
   * The output schema of the tool.
   *
   * If not provided, the tool will be considered as a tool that does not return anything.
   *
   * Please use `zod` to define the schema, and it will be translated to JSON Schema automatically.
   */
  readonly outputSchema?: z.ZodType<JSONSchema.JSONSchema>
}

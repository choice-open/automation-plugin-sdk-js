import type { PluginToolProviderManifest } from "../types"
import { PluginProvider } from "."

export abstract class PluginToolProvider extends PluginProvider {
  static readonly manifest: PluginToolProviderManifest

  /**
   * Invoke the tool with the given context.
   *
   * @param context - The context of the tool invocation.
   * @returns The result of the tool invocation.
   */
  abstract invoke<Output, Context extends Record<string, unknown>>(
    context: Context,
  ): Promise<Output>
}

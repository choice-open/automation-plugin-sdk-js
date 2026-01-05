import type { Registry } from "./registry"

export interface ProviderManager {
  /**
   * Adds a new tool to the provider in the registry.
   *
   * @param tool - The tool to add.
   * @throws Error if the tool is not registered.
   */
  addTool: (tool: Feature) => void
}

export function createProvider(provider: Provider, registry: Registry): ProviderManager {
  return {
    addTool: (tool: Feature) => {
      registry.registerFeature("tool", tool, provider.name.en_US)
    },
  }
}

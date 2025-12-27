import type { PluginProviderManifest } from "../types"

// biome-ignore lint/complexity/noStaticOnlyClass: Abstract class with static property
export abstract class PluginProvider {
  static readonly manifest: PluginProviderManifest
}

export * from "./tool"

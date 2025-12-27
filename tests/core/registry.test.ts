import { beforeEach, describe, expect, test } from "bun:test"
import type { Feature, Provider } from "../../src/core/provider"
import { createRegistry } from "../../src/core/registry"

describe("registry", () => {
  let registry: ReturnType<typeof createRegistry>

  beforeEach(() => {
    registry = createRegistry()
  })

  describe("registerProvider", () => {
    test("should register a provider successfully", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }

      expect(() => registry.registerProvider(provider)).not.toThrow()
    })

    test("should throw error when registering duplicate provider", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }

      registry.registerProvider(provider)

      expect(() => registry.registerProvider(provider)).toThrow(
        'Provider "test-provider" already registered.',
      )
    })

    test("should handle providers with different names", () => {
      const provider1: Provider = {
        name: { en_US: "provider-1" },
      }
      const provider2: Provider = {
        name: { en_US: "provider-2" },
      }

      expect(() => {
        registry.registerProvider(provider1)
        registry.registerProvider(provider2)
      }).not.toThrow()
    })

    test("should use en_US key for provider name", () => {
      const provider: Provider = {
        name: { en_US: "test-provider", zh_CN: "测试提供者" },
      }

      registry.registerProvider(provider)

      // Try to register again with same en_US but different zh_CN
      const duplicateProvider: Provider = {
        name: { en_US: "test-provider", zh_CN: "不同的中文名" },
      }

      expect(() => registry.registerProvider(duplicateProvider)).toThrow(
        'Provider "test-provider" already registered.',
      )
    })
  })

  describe("registerFeature", () => {
    test("should register a feature for a registered provider", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }
      const feature: Feature = {
        name: { en_US: "test-tool" },
      }

      registry.registerProvider(provider)
      expect(() =>
        registry.registerFeature("tool", feature, "test-provider"),
      ).not.toThrow()
    })

    test("should throw error when provider is not registered", () => {
      const feature: Feature = {
        name: { en_US: "test-tool" },
      }

      expect(() =>
        registry.registerFeature("tool", feature, "non-existent-provider"),
      ).toThrow('Provider "non-existent-provider" not registered.')
    })

    test("should register multiple features for the same provider", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }
      const feature1: Feature = {
        name: { en_US: "tool-1" },
      }
      const feature2: Feature = {
        name: { en_US: "tool-2" },
      }

      registry.registerProvider(provider)
      registry.registerFeature("tool", feature1, "test-provider")
      registry.registerFeature("tool", feature2, "test-provider")

      // Both should be resolvable
      expect(registry.resolve("tool", "test-provider", "tool-1")).toBe(feature1)
      expect(registry.resolve("tool", "test-provider", "tool-2")).toBe(feature2)
    })

    test("should overwrite feature with same name", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }
      const feature1: Feature = {
        name: { en_US: "test-tool" },
      }
      const feature2: Feature = {
        name: { en_US: "test-tool" },
      }

      registry.registerProvider(provider)
      registry.registerFeature("tool", feature1, "test-provider")
      registry.registerFeature("tool", feature2, "test-provider")

      // Should resolve to the last registered feature
      expect(registry.resolve("tool", "test-provider", "test-tool")).toBe(
        feature2,
      )
    })

    test("should use en_US key for feature name", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }
      const feature: Feature = {
        name: { en_US: "test-tool", zh_CN: "测试工具" },
      }

      registry.registerProvider(provider)
      registry.registerFeature("tool", feature, "test-provider")

      // Should resolve using en_US key
      const resolved = registry.resolve("tool", "test-provider", "test-tool")
      expect(resolved).toBe(feature)
    })
  })

  describe("resolve", () => {
    test("should resolve a registered feature", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }
      const feature: Feature = {
        name: { en_US: "test-tool" },
      }

      registry.registerProvider(provider)
      registry.registerFeature("tool", feature, "test-provider")

      const resolved = registry.resolve("tool", "test-provider", "test-tool")
      expect(resolved).toBe(feature)
    })

    test("should throw error when provider is not registered", () => {
      expect(() =>
        registry.resolve("tool", "non-existent-provider", "test-tool"),
      ).toThrow('Provider "non-existent-provider" not registered.')
    })

    test("should throw error when feature is not registered", () => {
      const provider: Provider = {
        name: { en_US: "test-provider" },
      }

      registry.registerProvider(provider)

      expect(() =>
        registry.resolve("tool", "test-provider", "non-existent-tool"),
      ).toThrow('Feature "non-existent-tool" not registered.')
    })

    test("should resolve features from different providers", () => {
      const provider1: Provider = {
        name: { en_US: "provider-1" },
      }
      const provider2: Provider = {
        name: { en_US: "provider-2" },
      }
      const feature1: Feature = {
        name: { en_US: "same-tool-name" },
      }
      const feature2: Feature = {
        name: { en_US: "same-tool-name" },
      }

      registry.registerProvider(provider1)
      registry.registerProvider(provider2)
      registry.registerFeature("tool", feature1, "provider-1")
      registry.registerFeature("tool", feature2, "provider-2")

      expect(registry.resolve("tool", "provider-1", "same-tool-name")).toBe(
        feature1,
      )
      expect(registry.resolve("tool", "provider-2", "same-tool-name")).toBe(
        feature2,
      )
    })
  })

  describe("integration", () => {
    test("should handle complete workflow", () => {
      const provider1: Provider = {
        name: { en_US: "openai" },
      }
      const provider2: Provider = {
        name: { en_US: "anthropic" },
      }
      const tool1: Feature = {
        name: { en_US: "chat" },
      }
      const tool2: Feature = {
        name: { en_US: "completion" },
      }
      const tool3: Feature = {
        name: { en_US: "chat" },
      }

      // Register providers
      registry.registerProvider(provider1)
      registry.registerProvider(provider2)

      // Register features
      registry.registerFeature("tool", tool1, "openai")
      registry.registerFeature("tool", tool2, "openai")
      registry.registerFeature("tool", tool3, "anthropic")

      // Resolve features
      expect(registry.resolve("tool", "openai", "chat")).toBe(tool1)
      expect(registry.resolve("tool", "openai", "completion")).toBe(tool2)
      expect(registry.resolve("tool", "anthropic", "chat")).toBe(tool3)
    })
  })
})

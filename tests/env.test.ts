import { beforeEach, describe, expect, mock, test } from "bun:test"
import z from "zod"

// Test the schema directly since getEnv() calls process.exit() which is hard to test
const EnvSchema = z.object({
  DAEMON_SERVER_WS_URL: z.url({
    protocol: /wss?/,
    error: "DAEMON_SERVER_WS_URL must be a valid WebSocket URL.",
  }),
})

describe("env module", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  describe("EnvSchema validation", () => {
    test("should accept valid ws:// URL", () => {
      const result = EnvSchema.safeParse({
        DAEMON_SERVER_WS_URL: "ws://localhost:4000/socket",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DAEMON_SERVER_WS_URL).toBe(
          "ws://localhost:4000/socket",
        )
      }
    })

    test("should accept valid wss:// URL", () => {
      const result = EnvSchema.safeParse({
        DAEMON_SERVER_WS_URL: "wss://example.com/socket",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DAEMON_SERVER_WS_URL).toBe(
          "wss://example.com/socket",
        )
      }
    })

    test("should reject non-WebSocket URL", () => {
      const result = EnvSchema.safeParse({
        DAEMON_SERVER_WS_URL: "https://example.com",
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid URL", () => {
      const result = EnvSchema.safeParse({
        DAEMON_SERVER_WS_URL: "not-a-url",
      })
      expect(result.success).toBe(false)
    })

    test("should reject missing DAEMON_SERVER_WS_URL", () => {
      const result = EnvSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe("getEnv function", () => {
    beforeEach(() => {
      // Clear module cache to reset internal state between tests
      const cacheKey = Object.keys(require.cache || {}).find((key) =>
        key.includes("env"),
      )
      if (cacheKey) {
        delete require.cache[cacheKey]
      }
    })

    test("should return parsed env when DAEMON_SERVER_WS_URL is valid ws:// URL", () => {
      ;(
        process.env as Record<string, string | undefined>
      ).DAEMON_SERVER_WS_URL = "ws://localhost:4000/socket"

      const { getEnv } = require("../src/env")
      const env = getEnv()

      expect(env).toBeDefined()
      expect(env.DAEMON_SERVER_WS_URL).toBe("ws://localhost:4000/socket")
    })

    test("should return parsed env when DAEMON_SERVER_WS_URL is valid wss:// URL", () => {
      ;(
        process.env as Record<string, string | undefined>
      ).DAEMON_SERVER_WS_URL = "wss://example.com/socket"

      const { getEnv } = require("../src/env")
      const env = getEnv()

      expect(env).toBeDefined()
      expect(env.DAEMON_SERVER_WS_URL).toBe("wss://example.com/socket")
    })

    test("should cache parsed env on subsequent calls", () => {
      ;(
        process.env as Record<string, string | undefined>
      ).DAEMON_SERVER_WS_URL = "ws://localhost:4000/socket"

      const { getEnv } = require("../src/env")
      const env1 = getEnv()
      const env2 = getEnv()

      expect(env1).toBe(env2)
      expect(env1.DAEMON_SERVER_WS_URL).toBe("ws://localhost:4000/socket")
    })

    test("should exit process when DAEMON_SERVER_WS_URL is missing", () => {
      delete (process.env as Record<string, string | undefined>)
        .DAEMON_SERVER_WS_URL

      const exitMock = mock((code?: number) => {
        throw new Error(`process.exit(${code})`)
      })
      const consoleErrorMock = mock(() => {})
      const originalExit = process.exit
      const originalConsoleError = console.error

      process.exit = exitMock as unknown as typeof process.exit
      console.error = consoleErrorMock

      try {
        const { getEnv } = require("../src/env")
        expect(() => {
          getEnv()
        }).toThrow()
      } finally {
        process.exit = originalExit
        console.error = originalConsoleError
      }

      expect(exitMock).toHaveBeenCalledWith(1)
      expect(consoleErrorMock).toHaveBeenCalled()
    })

    test("should exit process when DAEMON_SERVER_WS_URL is invalid", () => {
      ;(
        process.env as Record<string, string | undefined>
      ).DAEMON_SERVER_WS_URL = "https://example.com"

      const exitMock = mock((code?: number) => {
        throw new Error(`process.exit(${code})`)
      })
      const consoleErrorMock = mock(() => {})
      const originalExit = process.exit
      const originalConsoleError = console.error

      process.exit = exitMock as unknown as typeof process.exit
      console.error = consoleErrorMock

      try {
        const { getEnv } = require("../src/env")
        expect(() => {
          getEnv()
        }).toThrow()
      } finally {
        process.exit = originalExit
        console.error = originalConsoleError
      }

      expect(exitMock).toHaveBeenCalledWith(1)
      expect(consoleErrorMock).toHaveBeenCalled()
    })
  })
})

import chalk from "chalk"
import { logger } from "./core/logger"
import { createRegistry } from "./core/registry"
import { createTransporter } from "./core/transporter"
import type { CredentialDefinition, PluginDefinition, ToolDefinition } from "./types"

const log = logger.child({ name: "Phoenix" })

/**
 * Creates a new plugin instance with the specified options.
 *
 * @param options - The options for configuring the plugin instance.
 * @returns An object containing methods to define providers and run the plugin process.
 */
export function createPlugin<Locales extends string[]>(options: PluginDefinition<Locales>) {
  const registry = createRegistry()
  const transporter = createTransporter(options.transporterOptions)

  return {
    /**
     * Adds a new credential definition in the registry.
     *
     * @param credential - The credential to add.
     * @throws Error if the credential is not registered.
     */
    addCredential: (credential: CredentialDefinition) => {
      registry.register("credential", credential)
    },

    /**
     * Adds a new tool definition in the registry.
     *
     * @param tool - The tool to add.
     * @throws Error if the tool is not registered.
     */
    addTool: (tool: ToolDefinition) => {
      registry.register("tool", tool)
    },

    /**
     * Starts the plugin's main process. This establishes the transporter connection and
     * sets up signal handlers for graceful shutdown on SIGINT and SIGTERM.
     */
    run: () => {
      const { channel, dispose } = transporter.connect()

      channel.push("shout", registry.serialize())

      channel.on("shout", async (message) => {
        if (message.providerName && message.featureName) {
          const { providerName, featureName } = message
          const feature = registry.resolve("tool", featureName)
          const response = await feature.invoke.apply(null, message.args)

          const data = chalk.blueBright(JSON.stringify(response, null, 2))
          log.trace(`${providerName}-${featureName} response:\n${data}`)
        }
      })

      void ["SIGINT", "SIGTERM"].forEach((signal) => {
        void process.on(signal, dispose)
      })
    },
  }
}

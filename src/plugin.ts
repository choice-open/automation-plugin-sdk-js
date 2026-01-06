import chalk from "chalk"
import { logger } from "./core/logger"
import { createRegistry } from "./core/registry"
import { createTransporter } from "./core/transporter"
import { CredentialDefinitionSchema, ModelDefinitionSchema, ToolDefinitionSchema } from "./schemas"
import type {
  CredentialDefinition,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "./types"

const log = logger.child({ name: "Phoenix" })

/**
 * Creates a new plugin instance with the specified options.
 *
 * @param options - The options for configuring the plugin instance.
 * @returns An object containing methods to define providers and run the plugin process.
 */
export function createPlugin<Locales extends string[]>(options: PluginDefinition<Locales>) {
  const { transporterOptions, version = process.env.npm_package_version, ...plugin } = options
  const registry = createRegistry(Object.assign(plugin, { version }))
  const transporter = createTransporter(transporterOptions)

  return {
    /**
     * Adds a new credential definition in the registry.
     *
     * @param credential - The credential to add.
     * @throws Error if the credential is not registered.
     */
    addCredential: (credential: CredentialDefinition) => {
      const definition = CredentialDefinitionSchema.parse(credential)
      registry.register("credential", definition)
    },

    /**
     * Adds a new tool definition in the registry.
     *
     * @param tool - The tool to add.
     * @throws Error if the tool is not registered.
     */
    addTool: (tool: ToolDefinition) => {
      const definition = ToolDefinitionSchema.parse(tool)
      registry.register("tool", definition)
    },

    /**
     * Adds a new model definition in the registry.
     *
     * @param model - The model to add.
     * @throws Error if the model is not registered.
     */
    addModel: (model: ModelDefinition) => {
      const definition = ModelDefinitionSchema.parse(model)
      registry.register("model", definition)
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

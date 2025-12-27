import { type Channel, Socket } from "phoenix"
import { PluginManifestSchema } from "./schemas"
import type { PluginManifest } from "./types"

export class Plugin {
  readonly socket: Socket

  channel: Channel | undefined

  constructor(readonly manifest: PluginManifest) {
    this.manifest = PluginManifestSchema.parse(manifest)

    this.socket = new Socket("ws://localhost:4000/socket")
    this.socket.onClose(() => process.exit(0))
    this.socket.connect()

    void ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => this.dispose())
    })
  }

  dispose() {
    console.info(`${this.manifest.name} is shutting down...`)
    this.channel?.leave()
    this.socket.disconnect()
  }

  run() {
    console.info(`${this.manifest.name} is running...`)
    console.debug(Bun.inspect(this.manifest, { colors: true }))

    this.channel = this.socket.channel("mirror:lobby", {})
    this.channel
      .join()
      .receive("ok", () => {
        console.info(`${this.manifest.name} connected to mirror:lobby`)
      })
      .receive("error", (error) => {
        console.error(
          `${this.manifest.name} failed to connect to mirror:lobby`,
          error,
        )
      })

    this.channel.on("shout", (message) => {
      console.debug(Bun.inspect(message, { colors: true }))
    })
  }
}

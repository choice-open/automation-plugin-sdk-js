import { isNil } from "es-toolkit/predicate"
import z from "zod"

declare module "bun" {
  interface Env {
    /** The URL of the Daemon Server WebSocket. */
    readonly DAEMON_SERVER_WS_URL: string | undefined
  }
}

const EnvSchema = z.object({
  DAEMON_SERVER_WS_URL: z.url({
    protocol: /wss?/,
    error: "DAEMON_SERVER_WS_URL must be a valid WebSocket URL.",
  }),
})

let env: z.infer<typeof EnvSchema> | undefined

export function getEnv() {
  if (isNil(env)) {
    const result = EnvSchema.safeParse(process.env)

    if (!result.success) {
      console.error(z.prettifyError(result.error))
      process.exit(1)
    }

    env = result.data
  }

  return env
}

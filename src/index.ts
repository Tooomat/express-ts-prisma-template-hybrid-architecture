import { config } from "./config/env";
import { databaseService } from "./infrastructure/database/index.database";
import { winstonLogger } from "./infrastructure/logging/index.logging";
import { webApp } from "./infrastructure/server";

const app = webApp
let server: ReturnType<typeof app.listen>

async function bootstrap() {
  await databaseService.connect()

  server = webApp.listen(config.APP_PORT, () => {
      winstonLogger.info({
          type: "app:started",
          port: config.APP_PORT,
          timestamp: new Date().toISOString()
      })
      // winstonLogger.info(`🚀 Server running on port ${config.APP_PORT}`);
  })
}

bootstrap().catch((e) => {
    winstonLogger.error({
      type: "app:bootstrap_failed",
      reason: e instanceof Error ? e.message : "unknown_error",
      timestamp: new Date().toISOString()
    })
    process.exit(1)
})

async function gracefulShutdown(signal: string) {
  winstonLogger.info({ type: "app:shutdown_started", signal, timestamp: new Date().toISOString() })

  server?.close(async () => {
    await databaseService.disconnect()
    winstonLogger.info({ type: "app:shutdown_complete", timestamp: new Date().toISOString() })
    process.exit(0)
  })

  // paksa exit kalau ada request yang gantung lebih dari 20 detik
  setTimeout(() => {
    winstonLogger.error({ type: "app:shutdown_forced", timestamp: new Date().toISOString() })
    process.exit(1)
  }, 20_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM')) // SIGNAL TERMINATE
process.on('SIGINT', () => gracefulShutdown('SIGINT')) // SIGNAL INTERRUPT (ex: ctrl + c)

process.on('unhandledRejection', (reason) => {
    winstonLogger.error({
      type: "app:unhandled_rejection",
      reason: reason instanceof Error ? reason.message : String(reason),
      timestamp: new Date().toISOString()
    })
})

process.on('uncaughtException', async (err) => {
    winstonLogger.error({
      type: "app:uncaught_exception",
      reason: err.message,
      timestamp: new Date().toISOString()
    })
    await databaseService.disconnect()
    process.exit(1)
})
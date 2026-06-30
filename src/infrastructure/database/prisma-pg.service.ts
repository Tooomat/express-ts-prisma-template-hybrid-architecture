import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { WinstonLoggerService } from "../logging/winston-logging.service";
import * as env from "../../config/env";

const isDev = env.config.NODE_ENV === "development"

export class PrismaPgService {

  public readonly client: PrismaClient
  private isConnected = false

  constructor(private readonly logger: WinstonLoggerService) {
    const adapter = new PrismaPg({
      connectionString: env.config.DATABASE_URL,
    });

    this.client = new PrismaClient({
      adapter,
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "info" },
        // ...(isDev ? [{ emit: "event", level: "query" }] : []),
      ] as Prisma.LogDefinition[],
    })

    this.setupListeners()
  }

  private setupListeners() {
    this.client.$on("error" as never, (e: Prisma.LogEvent) => {
      this.logger.error({
        type: "prisma:error",
        message: e.message,
        target: e.target,
        timestamp: new Date().toISOString()
      })
    })

    this.client.$on("warn" as never, (e: Prisma.LogEvent) => {
      this.logger.warn({
        type: "prisma:warn",
        message: e.message,
        timestamp: new Date().toISOString()
      })
    })

    this.client.$on("info" as never, (e: Prisma.LogEvent) => {
      this.logger.info({
        type: "prisma:info",
        message: e.message,
        timestamp: new Date().toISOString()
      })
    })

    if (isDev) {
      this.client.$on("query" as never, (e: Prisma.QueryEvent) => {
        this.logger.debug({
          type: "prisma:query",
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        })
      })
    }
  }

  // Wajib dipanggil saat startup — kalau DB unreachable, app harus crash & restart
  // lewat orchestrator (Docker/K8s), bukan jalan dalam state setengah hidup.
  async connect(): Promise<void> {
    try {
      await this.client.$connect()
      this.isConnected = true
      this.logger.info({
        type: "infra:database:connected",
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      this.logger.error({
        type: "infra:database:connection_failed",
        reason: e instanceof Error ? e.message : "unknown_error",
        timestamp: new Date().toISOString()
      })
      throw e
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect()
    this.isConnected = false
    this.logger.info({
      type: "infra:database:disconnected",
      timestamp: new Date().toISOString()
    })
  }

  get ready(): boolean {
    return this.isConnected
  }

  // Untuk endpoint /health (readiness probe di K8s/load balancer)
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }
}
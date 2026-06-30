import { Redis } from "ioredis"
import { config } from "../../config/env"
import { WinstonLoggerService } from "../logging/winston-logging.service"

export class RedisService {
    private readonly _client: Redis
    private isReady = false

    constructor(private logger: WinstonLoggerService) {
        this._client = new Redis({
            port: config.REDIS_PORT,
            host: config.REDIS_HOST,
            password: config.REDIS_PASSWORD,
            db: config.REDIS_DB,
            lazyConnect: true,
            maxRetriesPerRequest: 3,        // jangan retry selamanya per command
            connectTimeout: 5000,           // jangan gantung kalau host unreachable
            retryStrategy: (times) => {
                if (times > 10) {
                    this.logger.error({
                        type: "infra:redis:retry_exhausted",
                        attempts: times,
                        timestamp: new Date().toISOString()
                    })
                    return null              // stop retry, biarkan caller handle error
                }
                return Math.min(times * 200, 3000)  // exponential-ish backoff, max 3s
            },
            reconnectOnError: (err) => {
                const targetErrors = ['READONLY', 'ECONNRESET']
                return targetErrors.some(e => err.message.includes(e))
            }
        })

        this._client.on('connect', () => {
            this.isReady = true
            this.logger.info({
                type: "infra:redis:connected",
                timestamp: new Date().toISOString()
            })
        })

        this._client.on('error', (err) => {
            this.isReady = false
            this.logger.error({
                type: "infra:redis:error",
                reason: err.message,
                timestamp: new Date().toISOString()
            })
        })

        this._client.on('reconnecting', (delay: number) => {
            this.logger.warn({
                type: "infra:redis:reconnecting",
                delayMs: delay,
                timestamp: new Date().toISOString()
            })
        })

        this._client.on('end', () => {
            this.isReady = false
            this.logger.warn({
                type: "infra:redis:connection_closed",
                timestamp: new Date().toISOString()
            })
        })
    }

    get client(): Redis {
        return this._client
    }

    get ready(): boolean {
        return this.isReady
    }

    async disconnect(): Promise<void> {
        await this._client.quit()
    }
}
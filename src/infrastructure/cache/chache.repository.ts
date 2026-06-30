import { RedisService } from "./redis"
import { WinstonLoggerService } from "../logging/winston-logging.service"

export class CacheRepository {
    constructor(
        private redisService: RedisService,
        private logger: WinstonLoggerService
    ) {}

    async get(key: string): Promise<string | null> {
        try {
            return await this.redisService.client.get(key)
        } catch (e) {
            this.logger.error({
                type: "infra:cache:get_failed",
                key,
                reason: e instanceof Error ? e.message : "unknown_error",
                timestamp: new Date().toISOString()
            })
            return null  // fail-open: anggap cache miss, jangan crash caller
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
        try {
            if (ttlSeconds) {
                await this.redisService.client.set(key, value, 'EX', ttlSeconds)
            } else {
                await this.redisService.client.set(key, value)
            }
            return true
        } catch (e) {
            this.logger.error({
                type: "infra:cache:set_failed",
                key,
                reason: e instanceof Error ? e.message : "unknown_error",
                timestamp: new Date().toISOString()
            })
            return false  // caller bisa cek return value kalau write-nya kritikal
        }
    }

    async setNx(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
        try {
            const result = ttlSeconds
                ? await this.redisService.client.set(key, value, 'EX', ttlSeconds, 'NX')
                : await this.redisService.client.set(key, value, 'NX')
            return result === 'OK'
        } catch (e) {
            this.logger.error({
                type: "infra:cache:setnx_failed",
                key,
                reason: e instanceof Error ? e.message : "unknown_error",
                timestamp: new Date().toISOString()
            })
            return false
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.redisService.client.del(key)
        } catch (e) {
            this.logger.error({
                type: "infra:cache:del_failed",
                key,
                reason: e instanceof Error ? e.message : "unknown_error",
                timestamp: new Date().toISOString()
            })
            // tidak throw — del gagal bukan fatal, key bisa expired sendiri via TTL
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redisService.client.exists(key)
            return result === 1
        } catch (e) {
            this.logger.error({
                type: "infra:cache:exists_failed",
                key,
                reason: e instanceof Error ? e.message : "unknown_error",
                timestamp: new Date().toISOString()
            })
            return false
        }
    }
}
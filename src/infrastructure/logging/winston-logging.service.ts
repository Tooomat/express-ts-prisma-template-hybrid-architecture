import * as env from "../../config/env"
import winston from "winston";

export class WinstonLoggerService {

    private readonly logger: winston.Logger

    constructor() {
        
        this.logger = winston.createLogger({
            level:
                env.config.NODE_ENV === "development" || env.config.NODE_ENV === "test"
                    ? "debug"
                    : "info",

            format: winston.format.combine(
                winston.format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",   // lebih readable
                }),
                winston.format.errors({ stack: true }), // penting untuk error
                winston.format.splat(),                 // support %s, %d dll
                winston.format.json()
            ),

            transports: [
                new winston.transports.Console(
                    env.config.NODE_ENV === "development"
                    ? {
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        ),
                    }
                    : undefined   // kosong saja, pakai format global
                ),
                //new winston.transports.File({ filename: 'combined.log' })
            ],
        })
    }

    info(meta?: unknown): void {
        this.logger.info(meta)
    }

    warn(meta?: unknown): void {
        this.logger.warn(meta)
    }

    error(meta?: unknown): void {
        this.logger.error(meta)
    }

    debug(meta?: unknown): void {
        this.logger.debug(meta)
    }
}
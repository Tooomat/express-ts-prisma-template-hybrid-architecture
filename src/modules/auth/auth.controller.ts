import { NextFunction, Request, Response } from "express"
import {
  success_handler,
  success_handler_without_data
} from "../../shared/response/web.response"
import { AuthService } from "./auth.service"
import { type AuthResponse } from "./auth.dto"
import { WinstonLoggerService } from "../../infrastructure/logging/winston-logging.service"
import { errorUtils } from "../../shared/utils/error.utils"

export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private logger: WinstonLoggerService
    ) {
        this.register = this.register.bind(this)
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result: AuthResponse = await this.authService.register(req.body, (req as any).requestId) 

            success_handler_without_data(res, "register success", 201)

        } catch (e) {
            this.logger.error({
                type: "auth:register:error",
                requestId: (req as any).requestId,
                userId: (req as any).user?.id ?? 'anonymous',
                reason: e instanceof Error ? e.message : "unknown_error",
                origin: errorUtils.parseErrorOrigin(e),
                timestamp: new Date().toISOString()
            })
            next(e)
        }
    }
}
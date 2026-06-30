import { BadRequestException } from "../../shared/http/exception-response.http"
import { AuthValidation } from "./auth.validation"
import { ValidationService } from "../../shared/validation/validation.service"
import { toAuthResponse, type RegisterUserDTO, type AuthResponse} from "./auth.dto"
import { IAuthRepository } from "./auth.Irepo"

import bcrypt from 'bcrypt'
import { WinstonLoggerService } from "../../infrastructure/logging/winston-logging.service"
import { errorUtils } from "../../shared/utils/error.utils"

export class AuthService {

    constructor(
        private authRepo: IAuthRepository,
        private validationService: ValidationService,
        private logger: WinstonLoggerService,
    ) {}
    
    async register(req: RegisterUserDTO, requestId: string): Promise<AuthResponse> {
        const validate: RegisterUserDTO = this.validationService.validate(AuthValidation.REGISTER_SCHEMA, req)
        
        const existingUser = await this.authRepo.findByEmail(validate.email)
        if (existingUser) {
            this.logger.warn({
                type: "auth:register:failed",
                requestId,
                reason: "email_already_exists",
                origin: errorUtils.parseErrorOrigin(),
                userId: "anonymous",
                timestamp: new Date().toISOString()
            })
            throw new BadRequestException("Email already exists")
        }

        const hashedPassword = await bcrypt.hash(validate.password, 10)

        const user = await this.authRepo.create({
            email: validate.email,
            password: hashedPassword 
        })

        this.logger.info({ 
            type: "auth:register:success",
            requestId,
            userId: user.id,
            timestamp: new Date().toISOString()
        })

        return toAuthResponse(user)
    }
}
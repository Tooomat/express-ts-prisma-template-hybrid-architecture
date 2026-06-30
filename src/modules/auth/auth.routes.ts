import { Router } from 'express'
import { AuthController } from './auth.controller'
import { PrismaAuthRepository } from './auth.repo'
import { AuthService } from './auth.service'
import { ValidationService } from '../../shared/validation/validation.service'
import { winstonLogger } from '../../infrastructure/logging/index.logging'
import { databaseService } from '../../infrastructure/database/index.database'

const authRouter = Router()

const repo = new PrismaAuthRepository(databaseService)
const validationService = new ValidationService()
const service = new AuthService(repo, validationService, winstonLogger)
const controller = new AuthController(service, winstonLogger)

authRouter.post('/register', controller.register)

export { authRouter }
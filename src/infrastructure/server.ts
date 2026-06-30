import express from "express"
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "../config/env";
import { 
    corsGuard, 
    helmetGuard, 
    hppMiddleware,
    xssProtection
} from "../shared/middleware/security.middleware";
import { createRequestLogger } from "../shared/middleware/logging.middleware";
import router from "../shared/router";
import { ErrorHandlerMiddleware } from "../shared/middleware/web-error-handler.middleware";
import { winstonLogger } from "./logging/index.logging";

const isProd = config.NODE_ENV === 'production'

export const webApp = express();

webApp.set('trust proxy', isProd ? 1 : false)

// LOGGER REQUEST MIDDLEWARE
webApp.use(createRequestLogger(winstonLogger))

// HELMET
webApp.use(helmetGuard)

// CORS
webApp.use(corsGuard)

// STATIC FILES
webApp.use(
  "/public",
  express.static(path.join(process.cwd(), "public"))
)

webApp.use(express.json())
webApp.use(express.urlencoded({ extended: true }))
webApp.use(cookieParser())

// HPP
webApp.use(hppMiddleware)

// XSS
webApp.use(xssProtection)


// ROUTES
webApp.use(router)

// ERROR HANDLER
webApp.use(ErrorHandlerMiddleware(winstonLogger))
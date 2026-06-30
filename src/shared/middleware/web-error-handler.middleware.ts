import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { errorUtils } from "../utils/error.utils";
import { WinstonLoggerService } from "../../infrastructure/logging/winston-logging.service";
import { HttpException } from "../http/exception-response.http";

const getStatusMessage = (status: number): string => {
    const statusMessages: Record<number, string> = {
        // 2xx
        200: "OK",
        201: "Created",
        204: "No content",

        // 3xx
        301: "Moved permanently",
        302: "Found",
        304: "Not modified",

        // 4xx
        400: "Bad request",
        401: "Unauthorized",
        402: "Payment required",
        403: "Forbidden",
        404: "Not found",
        405: "Method not allowed",
        406: "Not acceptable",
        408: "Request timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length required",
        413: "Payload too large",
        414: "URI too long",
        415: "Unsupported media type",
        422: "Unprocessable entity",
        423: "Locked",
        424: "Failed dependency",
        425: "Too early",
        426: "Upgrade required",
        429: "Too many requests",
        431: "Request header fields too large",
        451: "Unavailable for legal reasons",

        // 5xx
        500: "Internal server error",
        501: "Not implemented",
        502: "Bad gateway",
        503: "Service unavailable",
        504: "Gateway timeout",
        505: "HTTP version not supported",
        507: "Insufficient storage",
        508: "Loop detected",
        511: "Network authentication required",
    }
        
    return statusMessages[status] || "An error occurred"
}

export const ErrorHandlerMiddleware = (logger: WinstonLoggerService) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId ?? "unknown";
    const userId = (req as any).user?.id ?? "anonymous";
    const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";

    const baseLog = {
      requestId,
      userId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip,
    };

    // ==================== Zod Error ====================
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // ==================== Http Exception ====================
    if (err instanceof HttpException) {
      const origin = errorUtils.parseErrorOrigin(err);

      logger.error({
        type: "error:response",
        ...baseLog,
        statusCode: err.status,
        message: err.message,
        origin,
      });

      return res.status(err.status).json({
        success: false,
        message: getStatusMessage(err.status),
        error: err.message,
      });
    }

    // ==================== Unexpected Error ====================
    logger.error({
      type: "error:unhandled",
      ...baseLog,
      message: err.message,
      origin: errorUtils.parseErrorOrigin(err),
      stack: err.stack,
    });

    return res.status(500).json({
      success: false,
      message: getStatusMessage(500),
      error: "Internal server error",
    });
  };
};
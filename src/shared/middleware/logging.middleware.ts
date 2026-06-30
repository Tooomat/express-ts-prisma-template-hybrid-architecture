import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { WinstonLoggerService } from "../../infrastructure/logging/winston-logging.service";

// Inject logger (lebih baik daripada import langsung)
export const createRequestLogger = (logger: WinstonLoggerService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = randomUUID();

    // Attach requestId ke request object
    (req as any).requestId = requestId;   // nanti bisa di-improve dengan declaration merging

    res.on("finish", () => {
      const duration = Date.now() - start;

      const logData = {
        type: "http:request",
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get("user-agent"),
        userId: (req as any).user?.id ?? "anonymous",
      };

      // Log berdasarkan status code
      if (res.statusCode >= 500) {
        logger.error(logData);
      } else if (res.statusCode >= 400) {
        logger.warn(logData);
      } else {
        logger.info(logData);
      }
    });

    next();
  };
};
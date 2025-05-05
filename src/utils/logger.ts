import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

// Ensure logs directory exists
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Sanitize sensitive information
    const sanitizedMeta = { ...meta };
    if (sanitizedMeta.headers?.authorization) {
      sanitizedMeta.headers.authorization = '[REDACTED]';
    }
    if (sanitizedMeta.body?.password) {
      sanitizedMeta.body.password = '[REDACTED]';
    }
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitizedMeta
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Express middleware for logging requests
export const setupLogging = (app: any) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Log request
    logger.info({
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      // Sanitize sensitive headers
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined
      }
    });

    // Log response
    res.on('finish', () => {
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: res.get('X-Response-Time')
      });
    });

    next();
  });
}; 
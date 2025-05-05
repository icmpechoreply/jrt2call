import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // Add user info to request
    req.user = typeof decoded === 'object' ? decoded : undefined;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn({
        message: 'Invalid token attempt',
        ip: req.ip,
        path: req.path
      });
      throw new AppError('Invalid or expired token', 401);
    }
    next(error);
  }
}; 
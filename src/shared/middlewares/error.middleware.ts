import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../errors';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || '';

  // Known application errors
  if (error instanceof BaseException) {
    logger.warn('Application error', {
      requestId,
      code: error.code,
      message: error.message,
      path: req.path,
    });

    res.status(error.statusCode).json({
      success: false,
      error: error.toJSON(),
      meta: { requestId, timestamp: new Date().toISOString() },
    });
    return;
  }

  // MongoDB duplicate key error
  const mongoError = error as MongoError;
  if (mongoError.name === 'MongoServerError' && mongoError.code === 11000) {
    const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'field';
    res.status(409).json(
      ApiResponse.error('DUPLICATE_KEY', `A record with this ${field} already exists`, undefined, requestId)
    );
    return;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    res.status(400).json(
      ApiResponse.error('VALIDATION_ERROR', error.message, undefined, requestId)
    );
    return;
  }

  // Unknown errors
  logger.error('Unexpected error', {
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    },
    meta: { requestId, timestamp: new Date().toISOString() },
  });
};

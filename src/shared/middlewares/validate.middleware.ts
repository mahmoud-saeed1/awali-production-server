import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/api-response';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = (error as z.ZodError).issues || [];
        const details = issues.reduce(
          (acc: Record<string, string[]>, err: z.ZodIssue) => {
            const path = err.path.join('.');
            acc[path] = acc[path] || [];
            acc[path].push(err.message);
            return acc;
          },
          {} as Record<string, string[]>
        );

        res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'Invalid request data', details));
        return;
      }
      next(error);
    }
  };
};

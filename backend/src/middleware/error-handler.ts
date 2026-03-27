import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/** Domain error with an associated HTTP status code */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Global error handler — must be the last middleware registered */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.map(String),
        message: e.message,
      })),
    });
    return;
  }

  // Application domain error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
    return;
  }

  // Unknown error — log and return generic 500
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal server error' });
}

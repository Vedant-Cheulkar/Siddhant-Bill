import type { Request, Response, NextFunction } from 'express';
import { isDuplicateKeyError, duplicateKeyMessage } from '../utils/mongoErrors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (isDuplicateKeyError(err)) {
    return res.status(409).json({ message: duplicateKeyMessage(err) });
  }

  const status = (err as { status?: number }).status ?? 500;
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred';

  if (status >= 500) {
    logger.error('Unexpected error', {
      error: err instanceof Error ? err.stack : err,
      correlationId: req.headers['x-correlation-id']
    });
  }

  res.status(status).json({ message });
}

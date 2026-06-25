import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const HEADER = 'x-correlation-id';

export function correlationId(req: Request, res: Response, next: NextFunction) {
  const id = (req.header(HEADER) || randomUUID()).trim();
  res.setHeader('X-Correlation-Id', id);
  (req as Request & { correlationId: string }).correlationId = id;
  next();
}

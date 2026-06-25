import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const DEFAULT_PERMISSIONS = [
  'CUSTOMER_READ',
  'CUSTOMER_WRITE',
  'PRODUCT_READ',
  'PRODUCT_WRITE',
  'INVOICE_READ',
  'INVOICE_WRITE',
  'REPORT_READ',
];

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      email: user.email,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      roles: user.roles,
      permissions: user.permissions,
      fullName: user.fullName,
    },
    env.jwtSecret,
    { subject: user.id, expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] },
  );
}

export function accessTokenExpiresInSeconds(): number {
  const raw = env.jwtAccessExpiresIn;
  if (raw.endsWith('m')) return Number(raw.slice(0, -1)) * 60;
  if (raw.endsWith('h')) return Number(raw.slice(0, -1)) * 3600;
  if (raw.endsWith('d')) return Number(raw.slice(0, -1)) * 86400;
  return 900;
}

export function toAuthUser(doc: {
  _id: string;
  email: string;
  fullName: string;
  organizationId: string;
}): AuthUser {
  return {
    id: doc._id,
    email: doc.email,
    fullName: doc.fullName,
    tenantId: doc.organizationId,
    organizationId: doc.organizationId,
    roles: ['ADMIN'],
    permissions: DEFAULT_PERMISSIONS,
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const token = header.slice(7).trim();
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
      tenantId: payload.tenantId as string,
      organizationId: payload.organizationId as string,
      roles: (payload.roles as string[]) ?? ['ADMIN'],
      permissions: (payload.permissions as string[]) ?? DEFAULT_PERMISSIONS,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

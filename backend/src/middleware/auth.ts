import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { normalizeRole, permissionsForRole, rolesForRole, type UserRole } from '../auth/roles.js';
import { User } from '../models/User.js';

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
  role?: string | null;
}): AuthUser {
  const role = normalizeRole(doc.role);
  return {
    id: doc._id,
    email: doc.email,
    fullName: doc.fullName,
    tenantId: doc.organizationId,
    organizationId: doc.organizationId,
    roles: rolesForRole(role),
    permissions: permissionsForRole(role),
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  (async () => {
    try {
      const token = header.slice(7).trim();
      const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
      const user = await User.findById(payload.sub as string);
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }
      if (user.active === false) {
        res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
        return;
      }
      req.user = toAuthUser(user);
      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  })().catch(next);
}

export function requirePermission(...required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions ?? [];
    const missing = required.filter((p) => !permissions.includes(p));
    if (missing.length > 0) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.roles[0] as UserRole | undefined;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

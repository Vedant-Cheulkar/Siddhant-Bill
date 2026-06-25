import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  accessTokenExpiresInSeconds,
  requireAuth,
  signAccessToken,
  toAuthUser,
} from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function issueRefreshToken(userId: string) {
  const raw = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresDays);
  await RefreshToken.create({ tokenHash: hashToken(raw), userId, expiresAt });
  return raw;
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const authUser = toAuthUser(user);
    const accessToken = signAccessToken(authUser);
    const refreshToken = await issueRefreshToken(user._id);
    res.json(
      ok({
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresInSeconds(),
      }),
    );
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const authUser = toAuthUser(user);
    res.json(
      ok({
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.fullName,
        tenantId: authUser.tenantId,
        organizationId: authUser.organizationId,
        roles: authUser.roles,
        permissions: authUser.permissions,
      }),
    );
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });
    const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken), revokedAt: null });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    stored.revokedAt = new Date();
    await stored.save();
    const user = await User.findById(stored.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const authUser = toAuthUser(user);
    res.json(
      ok({
        accessToken: signAccessToken(authUser),
        refreshToken: await issueRefreshToken(user._id),
        expiresIn: accessTokenExpiresInSeconds(),
      }),
    );
  }),
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { refreshToken } = (req.body ?? {}) as { refreshToken?: string };
    if (refreshToken) {
      await RefreshToken.updateOne(
        { tokenHash: hashToken(refreshToken), revokedAt: null },
        { revokedAt: new Date() },
      );
    }
    res.json(ok(null, 'Logged out successfully'));
  }),
);

export default router;

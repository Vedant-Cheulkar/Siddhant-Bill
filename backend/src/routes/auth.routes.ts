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
import { validatePassword } from '../utils/password.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { normalizeEmail, validateEmail } from '../utils/email.js';
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  recordFailedLogin,
} from '../middleware/loginRateLimit.js';

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
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitError = checkLoginRateLimit(normalizedEmail);
    if (rateLimitError) return res.status(429).json({ message: rateLimitError });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.active === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
    }
    clearLoginAttempts(normalizedEmail);
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
    if (user.active === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
    }
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
    if (user.active === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
    }
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

router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

    res.json(ok(null, 'Password updated successfully'));
  }),
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = normalizeEmail(email);
    const emailError = validateEmail(normalizedEmail);
    if (emailError) return res.status(400).json({ message: emailError });

    const user = await User.findOne({ email: normalizedEmail });
    const genericMessage =
      'If an account exists for this email, use the reset link below or ask your administrator.';

    if (!user || user.active === false) {
      return res.json(ok({ message: genericMessage }));
    }

    const rawToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await PasswordReset.updateMany({ userId: user._id, usedAt: null }, { usedAt: new Date() });
    await PasswordReset.create({
      _id: randomUUID(),
      tokenHash: hashToken(rawToken),
      userId: user._id,
      expiresAt,
    });

    const resetUrl = `${env.passwordResetBaseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

    res.json(
      ok({
        message: genericMessage,
        resetUrl,
        expiresAt: expiresAt.toISOString(),
      }),
    );
  }),
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const stored = await PasswordReset.findOne({
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!stored) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const user = await User.findById(stored.userId);
    if (!user || user.active === false) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();

    stored.usedAt = new Date();
    await stored.save();
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

    res.json(ok(null, 'Password reset successfully. You can sign in with your new password.'));
  }),
);

export default router;

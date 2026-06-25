import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { USER_ROLES, type UserRole } from '../auth/roles.js';
import { User, toUserResponse } from '../models/User.js';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validatePassword } from '../utils/password.js';

const router = Router();
router.use(requireAuth);

const canReadUsers = requirePermission('USER_READ');
const canWriteUsers = requirePermission('USER_WRITE');

router.get(
  '/',
  canReadUsers,
  asyncHandler(async (req, res) => {
    const docs = await User.find({ organizationId: req.user!.organizationId })
      .sort({ fullName: 1 })
      .lean();
    res.json(ok(docs.map((d) => toUserResponse(d as never))));
  }),
);

router.post(
  '/',
  canWriteUsers,
  asyncHandler(async (req, res) => {
    const body = req.body as {
      email?: string;
      fullName?: string;
      password?: string;
      role?: UserRole;
    };

    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim();
    const password = body.password ?? '';
    const role = body.role ?? 'ACCOUNTANT';

    if (!email || !fullName) {
      return res.status(400).json({ message: 'Email and full name are required' });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'A user with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({
      _id: randomUUID(),
      email,
      fullName,
      passwordHash,
      organizationId: req.user!.organizationId,
      role,
      active: true,
    });

    res.status(201).json(ok(toUserResponse(doc)));
  }),
);

router.patch(
  '/:id',
  canWriteUsers,
  asyncHandler(async (req, res) => {
    const body = req.body as {
      fullName?: string;
      role?: UserRole;
      active?: boolean;
      password?: string;
    };

    const doc = await User.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (body.role !== undefined) {
      if (!USER_ROLES.includes(body.role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      if (doc._id === req.user!.id && body.role !== 'ADMIN') {
        return res.status(400).json({ message: 'You cannot remove your own admin role' });
      }
      doc.role = body.role;
    }

    if (body.fullName !== undefined) doc.fullName = body.fullName.trim();
    if (body.active !== undefined) {
      if (doc._id === req.user!.id && body.active === false) {
        return res.status(400).json({ message: 'You cannot deactivate your own account' });
      }
      doc.active = body.active;
    }

    if (body.password) {
      const passwordError = validatePassword(body.password);
      if (passwordError) return res.status(400).json({ message: passwordError });
      doc.passwordHash = await bcrypt.hash(body.password, 10);
    }

    if (body.role === undefined && body.active === false && doc.role === 'ADMIN') {
      const adminCount = await User.countDocuments({
        organizationId: req.user!.organizationId,
        role: 'ADMIN',
        active: true,
        _id: { $ne: doc._id },
      });
      if (adminCount === 0) {
        return res.status(400).json({ message: 'Cannot deactivate the last active admin' });
      }
    }

    doc.updatedAt = new Date();
    await doc.save();
    res.json(ok(toUserResponse(doc)));
  }),
);

export default router;

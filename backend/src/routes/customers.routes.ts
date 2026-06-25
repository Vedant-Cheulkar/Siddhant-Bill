import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer, toCustomerResponse } from '../models/Customer.js';
import { ok } from '../utils/apiResponse.js';
import { paginate, parsePageQuery } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const q = String(req.query.q ?? '').toLowerCase();
    const isActive = req.query.isActive as string | undefined;

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (isActive === 'true') filter.active = true;
    if (isActive === 'false') filter.active = false;

    let docs = await Customer.find(filter).sort({ name: 1 }).lean();
    if (q) {
      docs = docs.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    const mapped = docs.map((d) => toCustomerResponse(d as never));
    res.json(ok(paginate(mapped, page, size)));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Customer.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toCustomerResponse(doc)));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const now = new Date();
    const doc = await Customer.create({
      _id: randomUUID(),
      organizationId: req.user!.organizationId,
      code: body.code,
      name: body.name,
      gstin: body.gstin,
      pan: body.pan,
      email: body.email,
      phone: body.phone,
      billingStateCode: body.billingStateCode ?? '27',
      creditDays: body.creditDays ?? 30,
      active: body.active ?? true,
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
    });
    res.status(201).json(ok(toCustomerResponse(doc)));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const doc = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      {
        code: body.code,
        name: body.name,
        gstin: body.gstin,
        pan: body.pan,
        email: body.email,
        phone: body.phone,
        billingStateCode: body.billingStateCode,
        creditDays: body.creditDays,
        active: body.active,
        notes: body.notes,
        updatedAt: new Date(),
      },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toCustomerResponse(doc)));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }),
);

export default router;

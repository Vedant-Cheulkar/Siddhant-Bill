import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer, toCustomerResponse } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { ok } from '../utils/apiResponse.js';
import { parsePageQuery } from '../utils/pagination.js';
import { buildPageResult, escapeRegex } from '../utils/mongoPaginate.js';
import { normalizeEmail, validateEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { sanitizeIndianCustomerFields, validateIndianCustomerFields } from '../utils/india.js';

const router = Router();
router.use(requireAuth);

const canRead = requirePermission('CUSTOMER_READ');
const canWrite = requirePermission('CUSTOMER_WRITE');

function parseCustomerBody(body: Record<string, unknown>) {
  const fields = sanitizeIndianCustomerFields({
    gstin: body.gstin as string | undefined,
    pan: body.pan as string | undefined,
    phone: body.phone as string | undefined,
    billingStateCode: (body.billingStateCode as string) ?? '27',
  });
  const validationError = validateIndianCustomerFields(fields);
  return { fields, validationError };
}

router.get(
  '/',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const q = String(req.query.q ?? '').trim();
    const isActive = req.query.isActive as string | undefined;

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (isActive === 'true') filter.active = true;
    if (isActive === 'false') filter.active = false;
    if (q) {
      const pattern = escapeRegex(q);
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { code: { $regex: pattern, $options: 'i' } },
      ];
    }

    const safeSize = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);

    const [docs, total] = await Promise.all([
      Customer.find(filter)
        .sort({ name: 1 })
        .skip(safePage * safeSize)
        .limit(safeSize)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    const mapped = docs.map((d) => toCustomerResponse(d as never));
    res.json(ok(buildPageResult(mapped, safePage, safeSize, total)));
  }),
);

router.get(
  '/lookup',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const docs = await Customer.find({ organizationId: orgId, deletedAt: null })
      .select('_id name')
      .sort({ name: 1 })
      .lean();
    res.json(ok(docs.map((d) => ({ id: d._id, name: d.name }))));
  }),
);

router.get(
  '/:id',
  canRead,
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
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const { fields, validationError } = parseCustomerBody(body);
    if (validationError) return res.status(400).json({ message: validationError });
    if (body.email) {
      const emailError = validateEmail(String(body.email));
      if (emailError) return res.status(400).json({ message: emailError });
    }

    const now = new Date();
    const doc = await Customer.create({
      _id: randomUUID(),
      organizationId: req.user!.organizationId,
      code: body.code,
      name: body.name,
      gstin: fields.gstin,
      pan: fields.pan,
      email: body.email ? normalizeEmail(String(body.email)) : body.email,
      phone: fields.phone,
      billingStateCode: fields.billingStateCode ?? '27',
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
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const { fields, validationError } = parseCustomerBody(body);
    if (validationError) return res.status(400).json({ message: validationError });
    if (body.email) {
      const emailError = validateEmail(String(body.email));
      if (emailError) return res.status(400).json({ message: emailError });
    }

    const doc = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      {
        code: body.code,
        name: body.name,
        gstin: fields.gstin,
        pan: fields.pan,
        email: body.email ? normalizeEmail(String(body.email)) : body.email,
        phone: fields.phone,
        billingStateCode: fields.billingStateCode,
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
  canWrite,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const customerId = req.params.id;

    const [invoiceCount, workOrderCount] = await Promise.all([
      Invoice.countDocuments({ organizationId: orgId, customerId, deletedAt: null }),
      WorkOrder.countDocuments({ organizationId: orgId, customerId, deletedAt: null }),
    ]);

    if (invoiceCount > 0 || workOrderCount > 0) {
      return res.status(409).json({
        message: 'Cannot delete customer with existing invoices or work orders',
      });
    }

    const doc = await Customer.findOneAndUpdate(
      { _id: customerId, organizationId: orgId, deletedAt: null },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }),
);

export default router;

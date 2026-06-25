import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer } from '../models/Customer.js';
import { WorkOrder, toWorkOrderDetail, toWorkOrderSummary } from '../models/WorkOrder.js';
import { ok } from '../utils/apiResponse.js';
import { paginate, parsePageQuery } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { calcGrandTotal, calcLineTotal, type LineItemInput } from '../utils/calc.js';

const router = Router();
router.use(requireAuth);

function mapItems(raw: Array<Record<string, unknown>>) {
  return raw.map((it, i) => {
    const input: LineItemInput = {
      quantity: Number(it.quantity ?? 0),
      unitPrice: Number(it.unitPrice ?? 0),
      taxPercent: Number(it.taxPercent ?? 0),
      discountPercent: Number(it.discountPercent ?? 0),
    };
    return {
      _id: String(it.id ?? it._id ?? `wli-${randomUUID().slice(0, 8)}-${i}`),
      productId: it.productId as string | undefined,
      description: String(it.description ?? ''),
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      taxPercent: input.taxPercent,
      discountPercent: input.discountPercent ?? 0,
      lineTotal: calcLineTotal(input),
    };
  });
}

async function nextOrderNumber(orgId: string) {
  const count = await WorkOrder.countDocuments({ organizationId: orgId });
  return `WO-2026-${String(count + 1).padStart(3, '0')}`;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const status = req.query.status as string | undefined;
    const q = String(req.query.q ?? '').toLowerCase();

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (status) filter.status = status;

    let docs = await WorkOrder.find(filter).lean();
    if (q) {
      docs = docs.filter(
        (w) =>
          w.orderNumber.toLowerCase().includes(q) ||
          (w.customerName ?? '').toLowerCase().includes(q) ||
          (w.vehicleRef ?? '').toLowerCase().includes(q),
      );
    }
    docs.sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
    res.json(ok(paginate(docs.map((d) => toWorkOrderSummary(d as never)), page, size)));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await WorkOrder.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toWorkOrderDetail(doc)));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const cust = await Customer.findOne({ _id: body.customerId, organizationId: orgId, deletedAt: null });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? []);
    const doc = await WorkOrder.create({
      _id: randomUUID(),
      organizationId: orgId,
      orderNumber: await nextOrderNumber(orgId),
      status: 'OPEN',
      customerId: body.customerId,
      customerName: cust?.name,
      vehicleRef: body.vehicleRef,
      serviceDate: body.serviceDate ?? new Date().toISOString().slice(0, 10),
      description: body.description,
      notes: body.notes,
      grandTotal: calcGrandTotal(items),
      items,
    });
    res.status(201).json(ok(toWorkOrderDetail(doc)));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const existing = await WorkOrder.findOne({ _id: req.params.id, organizationId: orgId, deletedAt: null });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const cust = await Customer.findOne({ _id: body.customerId ?? existing.customerId, organizationId: orgId });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? existing.items);
    existing.customerId = String(body.customerId ?? existing.customerId);
    existing.customerName = cust?.name ?? existing.customerName;
    existing.vehicleRef = (body.vehicleRef as string) ?? existing.vehicleRef;
    existing.serviceDate = String(body.serviceDate ?? existing.serviceDate);
    existing.description = (body.description as string) ?? existing.description;
    existing.notes = (body.notes as string) ?? existing.notes;
    existing.set('items', items);
    existing.grandTotal = calcGrandTotal(items);
    existing.updatedAt = new Date();
    await existing.save();
    res.json(ok(toWorkOrderDetail(existing)));
  }),
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    const doc = await WorkOrder.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { status, updatedAt: new Date() },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toWorkOrderDetail(doc)));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await WorkOrder.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }),
);

export default router;

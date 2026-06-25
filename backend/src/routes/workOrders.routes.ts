import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer } from '../models/Customer.js';
import { WorkOrder, toWorkOrderDetail, toWorkOrderSummary } from '../models/WorkOrder.js';
import { ok } from '../utils/apiResponse.js';
import { parsePageQuery } from '../utils/pagination.js';
import { buildPageResult, escapeRegex } from '../utils/mongoPaginate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { calcGrandTotal, calcLineTotal, type LineItemInput } from '../utils/calc.js';
import { nextWorkOrderNumber } from '../utils/sequence.js';
import { validateLineItems } from '../utils/lineItems.js';
import {
  assertWorkOrderDeletable,
  assertWorkOrderEditable,
  assertWorkOrderTransition,
  type WorkOrderStatus,
} from '../utils/statusGuards.js';

const router = Router();
router.use(requireAuth);

const canRead = requirePermission('INVOICE_READ');
const canWrite = requirePermission('INVOICE_WRITE');

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

router.get(
  '/',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const status = req.query.status as string | undefined;
    const q = String(req.query.q ?? '').trim();

    const filter: Record<string, unknown> = { organizationId: orgId, deletedAt: null };
    if (status) filter.status = status;
    if (q) {
      const pattern = escapeRegex(q);
      filter.$or = [
        { orderNumber: { $regex: pattern, $options: 'i' } },
        { customerName: { $regex: pattern, $options: 'i' } },
        { vehicleRef: { $regex: pattern, $options: 'i' } },
      ];
    }

    const safeSize = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);

    const [docs, total] = await Promise.all([
      WorkOrder.find(filter)
        .sort({ serviceDate: -1 })
        .skip(safePage * safeSize)
        .limit(safeSize)
        .lean(),
      WorkOrder.countDocuments(filter),
    ]);

    res.json(
      ok(
        buildPageResult(
          docs.map((d) => toWorkOrderSummary(d as never)),
          safePage,
          safeSize,
          total,
        ),
      ),
    );
  }),
);

router.get(
  '/:id',
  canRead,
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
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const cust = await Customer.findOne({ _id: body.customerId, organizationId: orgId, deletedAt: null });
    if (!cust) return res.status(400).json({ message: 'Customer not found' });
    const lineError = validateLineItems(body.items as Array<Record<string, unknown>>);
    if (lineError) return res.status(400).json({ message: lineError });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? []);
    const doc = await WorkOrder.create({
      _id: randomUUID(),
      organizationId: orgId,
      orderNumber: await nextWorkOrderNumber(orgId),
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
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const existing = await WorkOrder.findOne({ _id: req.params.id, organizationId: orgId, deletedAt: null });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    assertWorkOrderEditable(existing.status);
    const cust = await Customer.findOne({ _id: body.customerId ?? existing.customerId, organizationId: orgId });
    const lineError = validateLineItems(
      (body.items as Array<Record<string, unknown>>) ?? existing.items,
    );
    if (lineError) return res.status(400).json({ message: lineError });
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
  canWrite,
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ message: 'status is required' });

    const existing = await WorkOrder.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    assertWorkOrderTransition(existing.status, status);
    existing.status = status as WorkOrderStatus;
    existing.updatedAt = new Date();
    await existing.save();
    res.json(ok(toWorkOrderDetail(existing)));
  }),
);

router.delete(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    const doc = await WorkOrder.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    assertWorkOrderDeletable(doc.status);
    doc.deletedAt = new Date();
    doc.updatedAt = new Date();
    await doc.save();
    res.status(204).send();
  }),
);

export default router;

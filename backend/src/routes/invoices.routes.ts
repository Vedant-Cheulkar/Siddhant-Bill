import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer } from '../models/Customer.js';
import { Invoice, toInvoiceDetail, toInvoiceSummary } from '../models/Invoice.js';
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
      _id: String(it.id ?? it._id ?? `li-${randomUUID().slice(0, 8)}-${i}`),
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

async function nextDisplayNumber(orgId: string) {
  const count = await Invoice.countDocuments({ organizationId: orgId });
  return `SL-2026-${String(count + 1).padStart(3, '0')}`;
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

    let docs = await Invoice.find(filter).lean();
    if (q) {
      docs = docs.filter(
        (i) =>
          i.displayNumber.toLowerCase().includes(q) ||
          (i.customerName ?? '').toLowerCase().includes(q),
      );
    }
    docs.sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
    res.json(ok(paginate(docs.map((d) => toInvoiceSummary(d as never)), page, size)));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Invoice.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toInvoiceDetail(doc)));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const cust = await Customer.findOne({ _id: body.customerId, organizationId: orgId, deletedAt: null });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? []);
    const doc = await Invoice.create({
      _id: randomUUID(),
      organizationId: orgId,
      displayNumber: (body.displayNumber as string) ?? (await nextDisplayNumber(orgId)),
      status: 'DRAFT',
      customerId: body.customerId,
      customerName: cust?.name,
      invoiceDate: body.invoiceDate ?? new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate,
      currency: body.currency ?? 'INR',
      grandTotal: calcGrandTotal(items),
      notes: body.notes,
      items,
    });
    res.status(201).json(ok(toInvoiceDetail(doc)));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const existing = await Invoice.findOne({ _id: req.params.id, organizationId: orgId, deletedAt: null });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const cust = await Customer.findOne({ _id: body.customerId ?? existing.customerId, organizationId: orgId });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? existing.items);
    existing.customerId = String(body.customerId ?? existing.customerId);
    existing.customerName = cust?.name ?? existing.customerName;
    existing.invoiceDate = String(body.invoiceDate ?? existing.invoiceDate);
    existing.dueDate = (body.dueDate as string) ?? existing.dueDate;
    existing.currency = String(body.currency ?? existing.currency ?? 'INR');
    existing.notes = (body.notes as string) ?? existing.notes;
    existing.set('items', items);
    existing.grandTotal = calcGrandTotal(items);
    existing.updatedAt = new Date();
    await existing.save();
    res.json(ok(toInvoiceDetail(existing)));
  }),
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    const doc = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { status, updatedAt: new Date() },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toInvoiceDetail(doc)));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user!.organizationId, deletedAt: null },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }),
);

export default router;

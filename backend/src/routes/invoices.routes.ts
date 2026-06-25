import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Customer } from '../models/Customer.js';
import { Invoice, toInvoiceDetail, toInvoiceSummary } from '../models/Invoice.js';
import { OrganizationSettings } from '../models/OrganizationSettings.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { ok } from '../utils/apiResponse.js';
import { parsePageQuery } from '../utils/pagination.js';
import { buildPageResult, escapeRegex } from '../utils/mongoPaginate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { calcGrandTotal, calcLineTotal, type LineItemInput } from '../utils/calc.js';
import { nextInvoiceNumber } from '../utils/sequence.js';
import { validateLineItems } from '../utils/lineItems.js';
import { buildInvoicePdf } from '../utils/invoicePdf.js';
import {
  assertInvoiceDeletable,
  assertInvoiceEditable,
  assertInvoiceTransition,
  type InvoiceStatus,
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
        { displayNumber: { $regex: pattern, $options: 'i' } },
        { customerName: { $regex: pattern, $options: 'i' } },
      ];
    }

    const safeSize = Math.min(Math.max(size, 1), 100);
    const safePage = Math.max(page, 0);

    const [docs, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ invoiceDate: -1 })
        .skip(safePage * safeSize)
        .limit(safeSize)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    res.json(
      ok(
        buildPageResult(
          docs.map((d) => toInvoiceSummary(d as never)),
          safePage,
          safeSize,
          total,
        ),
      ),
    );
  }),
);

router.get(
  '/:id/pdf',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const doc = await Invoice.findOne({
      _id: req.params.id,
      organizationId: orgId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const [customer, settings] = await Promise.all([
      Customer.findOne({ _id: doc.customerId, organizationId: orgId }).lean(),
      OrganizationSettings.findById(orgId).lean(),
    ]);

    const pdf = await buildInvoicePdf({
      invoice: doc,
      customerName: customer?.name ?? doc.customerName ?? undefined,
      customerGstin: customer?.gstin ?? undefined,
      settings: settings as never,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.displayNumber}.pdf"`);
    res.send(pdf);
  }),
);

router.get(
  '/:id',
  canRead,
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
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const cust = await Customer.findOne({ _id: body.customerId, organizationId: orgId, deletedAt: null });
    if (!cust) return res.status(400).json({ message: 'Customer not found' });
    if (cust.active === false) {
      return res.status(400).json({ message: 'Cannot create invoice for an inactive customer' });
    }
    const lineError = validateLineItems(body.items as Array<Record<string, unknown>>);
    if (lineError) return res.status(400).json({ message: lineError });
    const items = mapItems((body.items as Array<Record<string, unknown>>) ?? []);
    const doc = await Invoice.create({
      _id: randomUUID(),
      organizationId: orgId,
      displayNumber: await nextInvoiceNumber(orgId),
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

    const workOrderId = body.workOrderId as string | undefined;
    if (workOrderId) {
      const wo = await WorkOrder.findOne({
        _id: workOrderId,
        organizationId: orgId,
        deletedAt: null,
      });
      if (!wo) return res.status(400).json({ message: 'Work order not found' });
      if (wo.status !== 'COMPLETED') {
        return res.status(400).json({ message: 'Only completed work orders can be invoiced' });
      }
      wo.status = 'INVOICED';
      wo.updatedAt = new Date();
      await wo.save();
    }

    res.status(201).json(ok(toInvoiceDetail(doc)));
  }),
);

router.put(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const orgId = req.user!.organizationId;
    const existing = await Invoice.findOne({ _id: req.params.id, organizationId: orgId, deletedAt: null });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    assertInvoiceEditable(existing.status);
    const cust = await Customer.findOne({
      _id: body.customerId ?? existing.customerId,
      organizationId: orgId,
      deletedAt: null,
    });
    if (!cust) return res.status(400).json({ message: 'Customer not found' });
    if (cust.active === false) {
      return res.status(400).json({ message: 'Cannot assign an inactive customer to an invoice' });
    }
    const lineError = validateLineItems(
      (body.items as Array<Record<string, unknown>>) ?? existing.items,
    );
    if (lineError) return res.status(400).json({ message: lineError });
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
  canWrite,
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ message: 'status is required' });

    const existing = await Invoice.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    assertInvoiceTransition(existing.status, status);
    existing.status = status as InvoiceStatus;
    existing.updatedAt = new Date();
    await existing.save();
    res.json(ok(toInvoiceDetail(existing)));
  }),
);

router.delete(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    const doc = await Invoice.findOne({
      _id: req.params.id,
      organizationId: req.user!.organizationId,
      deletedAt: null,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    assertInvoiceDeletable(doc.status);
    doc.deletedAt = new Date();
    doc.updatedAt = new Date();
    await doc.save();
    res.status(204).send();
  }),
);

export default router;

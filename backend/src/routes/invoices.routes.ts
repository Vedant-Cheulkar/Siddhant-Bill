import { Router } from 'express';
import { Customer } from '../models/Customer.js';
import { OrganizationSettings } from '../models/OrganizationSettings.js';
import { toInvoiceDetail, toInvoiceSummary } from '../models/Invoice.js';
import { ok } from '../utils/apiResponse.js';
import { parsePageQuery } from '../utils/pagination.js';
import { buildPageResult } from '../utils/mongoPaginate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { buildInvoicePdf } from '../utils/invoicePdf.js';
import { InvoiceService } from '../services/InvoiceService.js';

const router = Router();
router.use(requireAuth);

const canRead = requirePermission('INVOICE_READ');
const canWrite = requirePermission('INVOICE_WRITE');

router.get(
  '/',
  canRead,
  asyncHandler(async (req, res) => {
    const orgId = req.user!.organizationId;
    const { page, size } = parsePageQuery(req.query as Record<string, unknown>);
    const status = req.query.status as string | undefined;
    const q = String(req.query.q ?? '').trim();

    const { docs, total, safePage, safeSize } = await InvoiceService.listInvoices(orgId, page, size, status, q);

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
    const doc = await InvoiceService.getInvoiceById(req.params.id as string, orgId);
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
    const doc = await InvoiceService.getInvoiceById(req.params.id as string, req.user!.organizationId);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(ok(toInvoiceDetail(doc)));
  }),
);

router.post(
  '/',
  canWrite,
  asyncHandler(async (req, res) => {
    try {
      const doc = await InvoiceService.createInvoice(req.body as Record<string, unknown>, req.user!.organizationId);
      res.status(201).json(ok(toInvoiceDetail(doc)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Not found') return res.status(404).json({ message });
      res.status(400).json({ message });
    }
  }),
);

router.put(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    try {
      const existing = await InvoiceService.updateInvoice(req.params.id as string, req.body as Record<string, unknown>, req.user!.organizationId);
      res.json(ok(toInvoiceDetail(existing)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Not found') return res.status(404).json({ message });
      res.status(400).json({ message });
    }
  }),
);

router.patch(
  '/:id/status',
  canWrite,
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ message: 'status is required' });

    try {
      const existing = await InvoiceService.updateStatus(req.params.id as string, status, req.user!.organizationId);
      res.json(ok(toInvoiceDetail(existing)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Not found') return res.status(404).json({ message });
      res.status(400).json({ message });
    }
  }),
);

router.delete(
  '/:id',
  canWrite,
  asyncHandler(async (req, res) => {
    try {
      await InvoiceService.deleteInvoice(req.params.id as string, req.user!.organizationId);
      res.status(204).send();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Not found') return res.status(404).json({ message });
      res.status(400).json({ message });
    }
  }),
);

export default router;

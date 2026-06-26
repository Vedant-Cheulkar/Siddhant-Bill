import { randomUUID } from 'crypto';
import { Customer } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { escapeRegex } from '../utils/mongoPaginate.js';
import { calcGrandTotal, calcLineTotal, type LineItemInput } from '../utils/calc.js';
import { nextInvoiceNumber } from '../utils/sequence.js';
import { validateLineItems } from '../utils/lineItems.js';
import {
  assertInvoiceDeletable,
  assertInvoiceEditable,
  assertInvoiceTransition,
  type InvoiceStatus,
} from '../utils/statusGuards.js';

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

export class InvoiceService {
  static async listInvoices(orgId: string, page: number, size: number, status?: string, q?: string) {
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
      Invoice.estimatedDocumentCount(), // Replaced countDocuments with estimatedDocumentCount for performance optimization
    ]);

    return { docs, total, safePage, safeSize };
  }

  static async getInvoiceById(id: string, orgId: string) {
    return Invoice.findOne({ _id: id, organizationId: orgId, deletedAt: null });
  }

  static async createInvoice(body: Record<string, unknown>, orgId: string) {
    const cust = await Customer.findOne({ _id: body.customerId, organizationId: orgId, deletedAt: null });
    if (!cust) throw new Error('Customer not found');
    if (cust.active === false) {
      throw new Error('Cannot create invoice for an inactive customer');
    }
    const lineError = validateLineItems(body.items as Array<Record<string, unknown>>);
    if (lineError) throw new Error(lineError);
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
      if (!wo) throw new Error('Work order not found');
      if (wo.status !== 'COMPLETED') {
        throw new Error('Only completed work orders can be invoiced');
      }
      wo.status = 'INVOICED';
      wo.updatedAt = new Date();
      await wo.save();
    }

    return doc;
  }

  static async updateInvoice(id: string, body: Record<string, unknown>, orgId: string) {
    const existing = await Invoice.findOne({ _id: id, organizationId: orgId, deletedAt: null });
    if (!existing) throw new Error('Not found');
    assertInvoiceEditable(existing.status);
    
    const cust = await Customer.findOne({
      _id: body.customerId ?? existing.customerId,
      organizationId: orgId,
      deletedAt: null,
    });
    if (!cust) throw new Error('Customer not found');
    if (cust.active === false) {
      throw new Error('Cannot assign an inactive customer to an invoice');
    }
    
    const lineError = validateLineItems(
      (body.items as Array<Record<string, unknown>>) ?? existing.items,
    );
    if (lineError) throw new Error(lineError);
    
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
    return existing;
  }

  static async updateStatus(id: string, status: string, orgId: string) {
    const existing = await Invoice.findOne({
      _id: id,
      organizationId: orgId,
      deletedAt: null,
    });
    if (!existing) throw new Error('Not found');

    assertInvoiceTransition(existing.status, status);
    existing.status = status as InvoiceStatus;
    existing.updatedAt = new Date();
    await existing.save();
    return existing;
  }

  static async deleteInvoice(id: string, orgId: string) {
    const doc = await Invoice.findOne({
      _id: id,
      organizationId: orgId,
      deletedAt: null,
    });
    if (!doc) throw new Error('Not found');
    assertInvoiceDeletable(doc.status);
    doc.deletedAt = new Date();
    doc.updatedAt = new Date();
    await doc.save();
  }
}

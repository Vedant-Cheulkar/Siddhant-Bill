import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const lineSchema = new Schema(
  {
    _id: { type: String, required: true },
    productId: String,
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxPercent: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    _id: { type: String, required: true },
    organizationId: { type: String, required: true, index: true },
    displayNumber: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'ISSUED', 'CANCELLED'], required: true },
    customerId: { type: String, required: true },
    customerName: String,
    invoiceDate: { type: String, required: true },
    dueDate: String,
    currency: { type: String, default: 'INR' },
    grandTotal: { type: Number, required: true },
    notes: String,
    items: [lineSchema],
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

invoiceSchema.index({ organizationId: 1, displayNumber: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export type InvoiceDoc = InferSchemaType<typeof invoiceSchema> & { _id: string };
export const Invoice = mongoose.model('Invoice', invoiceSchema);

export function toInvoiceDetail(doc: InvoiceDoc) {
  return {
    id: doc._id,
    displayNumber: doc.displayNumber,
    status: doc.status,
    customerId: doc.customerId,
    customerName: doc.customerName,
    invoiceDate: doc.invoiceDate,
    dueDate: doc.dueDate,
    currency: doc.currency ?? 'INR',
    grandTotal: doc.grandTotal,
    notes: doc.notes,
    items: (doc.items ?? []).map((it) => ({
      id: it._id,
      productId: it.productId,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxPercent: it.taxPercent,
      discountPercent: it.discountPercent ?? 0,
      lineTotal: it.lineTotal,
    })),
    createdAt: (doc as InvoiceDoc & { createdAt: Date }).createdAt?.toISOString(),
    updatedAt: (doc as InvoiceDoc & { updatedAt: Date }).updatedAt?.toISOString(),
  };
}

export function toInvoiceSummary(doc: InvoiceDoc) {
  return {
    id: doc._id,
    displayNumber: doc.displayNumber,
    status: doc.status,
    customerId: doc.customerId,
    invoiceDate: doc.invoiceDate,
    grandTotal: doc.grandTotal,
    createdAt: (doc as InvoiceDoc & { createdAt: Date }).createdAt?.toISOString(),
  };
}

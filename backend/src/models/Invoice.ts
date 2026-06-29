import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const lineSchema = new Schema(
  {
    _id: { type: String, required: true },
    productId: String,
    hsnSac: String,
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxPercent: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    taxableAmount: Number,
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
    documentType: {
      type: String,
      enum: ['TAX_INVOICE', 'BILL_OF_SUPPLY', 'CREDIT_NOTE', 'DEBIT_NOTE'],
      default: 'TAX_INVOICE',
    },
    reverseCharge: { type: Boolean, default: false },
    placeOfSupply: String,
    taxType: { type: String, enum: ['INTRA', 'INTER'] },
    taxableAmount: Number,
    cgstAmount: Number,
    sgstAmount: Number,
    igstAmount: Number,
    grandTotal: { type: Number, required: true },
    notes: String,
    items: [lineSchema],
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

invoiceSchema.index({ organizationId: 1, displayNumber: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
invoiceSchema.index({ organizationId: 1, deletedAt: 1, invoiceDate: -1 });

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
    documentType: doc.documentType ?? 'TAX_INVOICE',
    reverseCharge: doc.reverseCharge ?? false,
    placeOfSupply: doc.placeOfSupply,
    taxType: doc.taxType,
    taxableAmount: doc.taxableAmount,
    cgstAmount: doc.cgstAmount,
    sgstAmount: doc.sgstAmount,
    igstAmount: doc.igstAmount,
    grandTotal: doc.grandTotal,
    notes: doc.notes,
    items: (doc.items ?? []).map((it) => ({
      id: it._id,
      productId: it.productId,
      hsnSac: it.hsnSac,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxPercent: it.taxPercent,
      discountPercent: it.discountPercent ?? 0,
      taxableAmount: it.taxableAmount,
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

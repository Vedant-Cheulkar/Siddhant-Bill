import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const woLineSchema = new Schema(
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

const workOrderSchema = new Schema(
  {
    _id: { type: String, required: true },
    organizationId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CANCELLED'],
      required: true,
    },
    customerId: { type: String, required: true },
    customerName: String,
    vehicleRef: String,
    serviceDate: { type: String, required: true },
    description: String,
    notes: String,
    grandTotal: { type: Number, required: true },
    items: [woLineSchema],
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

workOrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export type WorkOrderDoc = InferSchemaType<typeof workOrderSchema> & { _id: string };
export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

export function toWorkOrderDetail(doc: WorkOrderDoc) {
  return {
    id: doc._id,
    orderNumber: doc.orderNumber,
    status: doc.status,
    customerId: doc.customerId,
    customerName: doc.customerName,
    vehicleRef: doc.vehicleRef,
    serviceDate: doc.serviceDate,
    description: doc.description,
    notes: doc.notes,
    grandTotal: doc.grandTotal,
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
    createdAt: (doc as WorkOrderDoc & { createdAt: Date }).createdAt?.toISOString(),
    updatedAt: (doc as WorkOrderDoc & { updatedAt: Date }).updatedAt?.toISOString(),
  };
}

export function toWorkOrderSummary(doc: WorkOrderDoc) {
  return {
    id: doc._id,
    orderNumber: doc.orderNumber,
    status: doc.status,
    customerId: doc.customerId,
    serviceDate: doc.serviceDate,
    grandTotal: doc.grandTotal,
    vehicleRef: doc.vehicleRef,
    createdAt: (doc as WorkOrderDoc & { createdAt: Date }).createdAt?.toISOString(),
  };
}

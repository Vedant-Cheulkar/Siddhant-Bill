import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
  {
    _id: { type: String, required: true },
    organizationId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    gstin: String,
    pan: String,
    email: String,
    phone: String,
    billingStateCode: { type: String, default: '27' },
    creditDays: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
    notes: String,
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

customerSchema.index({ organizationId: 1, code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export type CustomerDoc = InferSchemaType<typeof customerSchema> & { _id: string };
export const Customer = mongoose.model('Customer', customerSchema);

export function toCustomerResponse(doc: CustomerDoc) {
  return {
    id: doc._id,
    code: doc.code,
    name: doc.name,
    gstin: doc.gstin,
    pan: doc.pan,
    email: doc.email,
    phone: doc.phone,
    billingStateCode: doc.billingStateCode,
    creditDays: doc.creditDays ?? 30,
    active: doc.active ?? true,
    notes: doc.notes,
    createdAt: (doc as CustomerDoc & { createdAt: Date }).createdAt?.toISOString(),
    updatedAt: (doc as CustomerDoc & { updatedAt: Date }).updatedAt?.toISOString(),
  };
}

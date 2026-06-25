import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    _id: { type: String, required: true },
    organizationId: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    hsnSac: String,
    unitId: String,
    salePrice: { type: Number, required: true },
    taxGroupId: String,
    active: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

productSchema.index({ organizationId: 1, sku: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: string };
export const Product = mongoose.model('Product', productSchema);

export function toProductResponse(doc: ProductDoc) {
  return {
    id: doc._id,
    sku: doc.sku,
    name: doc.name,
    description: doc.description,
    hsnSac: doc.hsnSac,
    unitId: doc.unitId,
    salePrice: doc.salePrice,
    taxGroupId: doc.taxGroupId,
    active: doc.active ?? true,
    createdAt: (doc as ProductDoc & { createdAt: Date }).createdAt?.toISOString(),
    updatedAt: (doc as ProductDoc & { updatedAt: Date }).updatedAt?.toISOString(),
  };
}

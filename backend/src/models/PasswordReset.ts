import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const passwordResetSchema = new Schema(
  {
    _id: { type: String, required: true },
    tokenHash: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

export type PasswordResetDoc = InferSchemaType<typeof passwordResetSchema> & { _id: string };
export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { USER_ROLES } from '../auth/roles.js';

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    organizationId: { type: String, required: true, index: true },
    role: { type: String, enum: USER_ROLES, default: 'ADMIN' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

export function toUserResponse(doc: UserDoc) {
  return {
    id: doc._id,
    email: doc.email,
    fullName: doc.fullName,
    role: doc.role ?? 'ADMIN',
    active: doc.active ?? true,
    organizationId: doc.organizationId,
    createdAt: (doc as UserDoc & { createdAt?: Date }).createdAt?.toISOString(),
    updatedAt: (doc as UserDoc & { updatedAt?: Date }).updatedAt?.toISOString(),
  };
}

export const User = mongoose.model('User', userSchema);

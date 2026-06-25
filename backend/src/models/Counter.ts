import mongoose, { Schema } from 'mongoose';

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);

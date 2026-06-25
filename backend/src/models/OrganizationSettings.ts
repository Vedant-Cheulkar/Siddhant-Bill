import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const companySchema = new Schema(
  {
    name: { type: String, default: 'Siddhant Logistics' },
    gstin: { type: String, default: '' },
    pan: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    stateCode: { type: String, default: '27' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    prefix: { type: String, default: 'SL' },
    startingNumber: { type: Number, default: 1 },
    defaultDueDays: { type: Number, default: 30 },
    terms: {
      type: String,
      default:
        'Payment due within 30 days of invoice date. Late payments may attract 2% per month interest.',
    },
  },
  { _id: false },
);

const taxSchema = new Schema(
  {
    defaultRate: { type: Number, default: 18 },
  },
  { _id: false },
);

const organizationSettingsSchema = new Schema(
  {
    _id: { type: String, required: true },
    company: { type: companySchema, default: () => ({}) },
    invoice: { type: invoiceSchema, default: () => ({}) },
    tax: { type: taxSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false },
);

export type OrganizationSettingsDoc = InferSchemaType<typeof organizationSettingsSchema> & {
  _id: string;
};

export const OrganizationSettings = mongoose.model('OrganizationSettings', organizationSettingsSchema);

export const DEFAULT_SETTINGS = {
  company: {
    name: 'Siddhant Logistics',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    stateCode: '27',
    phone: '',
    email: '',
  },
  invoice: {
    prefix: 'SL',
    startingNumber: 1,
    defaultDueDays: 30,
    terms:
      'Payment due within 30 days of invoice date. Late payments may attract 2% per month interest.',
  },
  tax: {
    defaultRate: 18,
  },
};

export function toSettingsResponse(doc: OrganizationSettingsDoc | null) {
  const company = { ...DEFAULT_SETTINGS.company, ...doc?.company };
  const invoice = { ...DEFAULT_SETTINGS.invoice, ...doc?.invoice };
  const tax = { ...DEFAULT_SETTINGS.tax, ...doc?.tax };

  return { company, invoice, tax };
}

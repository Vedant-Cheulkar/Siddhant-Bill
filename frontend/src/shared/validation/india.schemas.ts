import { z } from 'zod';
import {
  normalizeGstin,
  normalizeIndianPhone,
  normalizePan,
  validateGstin,
  validateGstinPanConsistency,
  validateGstinStateConsistency,
  validateHsnSac,
  validateIndianPhone,
  validateIndianStateCode,
  validatePan,
} from './india';

function optionalField(validate: (v: string) => string | null) {
  return z
    .string()
    .superRefine((val, ctx) => {
      if (!val?.trim()) return;
      const err = validate(val);
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
    });
}

export const zIndianStateCode = z
  .string()
  .trim()
  .length(2, 'Must be exactly 2 digits')
  .superRefine((val, ctx) => {
    const err = validateIndianStateCode(val);
    if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
  });

export const zOptionalIndianStateCode = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) return;
    const err = validateIndianStateCode(val);
    if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
  });

export const zOptionalPan = optionalField(validatePan).transform((v) =>
  v?.trim() ? normalizePan(v) : v,
);

export const zOptionalGstin = optionalField(validateGstin).transform((v) =>
  v?.trim() ? normalizeGstin(v) : v,
);

export const zOptionalIndianPhone = optionalField(validateIndianPhone).transform((v) => {
  if (!v?.trim()) return v;
  return normalizeIndianPhone(v);
});

export const zOptionalHsnSac = optionalField(validateHsnSac);

export const zOptionalEmail = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) return;
    const result = z.string().email().safeParse(val);
    if (!result.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid email address' });
    }
  });

/** Cross-check GSTIN ↔ PAN ↔ state on customer / company records. */
export function refineIndianTaxIds<
  T extends { gstin?: string; pan?: string; billingStateCode?: string; stateCode?: string },
>(schema: z.ZodType<T>) {
  return schema.superRefine((data, ctx) => {
    const stateCode = data.billingStateCode ?? data.stateCode ?? '';
    const panErr = validateGstinPanConsistency(data.gstin ?? '', data.pan ?? '');
    if (panErr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: panErr, path: ['pan'] });
    }
    const stateErr = validateGstinStateConsistency(data.gstin ?? '', stateCode);
    if (stateErr) {
      const path = data.billingStateCode !== undefined ? 'billingStateCode' : 'stateCode';
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: stateErr, path: [path] });
    }
  });
}

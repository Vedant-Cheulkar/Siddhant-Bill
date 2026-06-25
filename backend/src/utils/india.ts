/**
 * Indian regulatory field validation (GST, PAN, state codes, mobile, HSN/SAC).
 */

export const VALID_STATE_CODE_SET = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '26', '27', '29', '30', '31', '32',
  '33', '34', '35', '36', '37', '38', '97', '99',
]);

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const HSN_SAC_REGEX = /^(\d{4}|\d{6}|\d{8})$/;

export function normalizePan(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeGstin(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeIndianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function validateIndianStateCode(code: string): string | null {
  const trimmed = code.trim();
  if (!/^\d{2}$/.test(trimmed)) return 'Enter a valid 2-digit GST state code';
  if (!VALID_STATE_CODE_SET.has(trimmed)) return 'Unknown GST state code';
  return null;
}

export function validatePan(pan: string): string | null {
  const normalized = normalizePan(pan);
  if (!normalized) return null;
  if (normalized.length !== 10) return 'PAN must be exactly 10 characters';
  if (!PAN_REGEX.test(normalized)) return 'Invalid PAN format';
  return null;
}

export function validateGstin(gstin: string): string | null {
  const normalized = normalizeGstin(gstin);
  if (!normalized) return null;
  if (normalized.length !== 15) return 'GSTIN must be exactly 15 characters';
  if (!GSTIN_REGEX.test(normalized)) return 'Invalid GSTIN format';
  const stateErr = validateIndianStateCode(normalized.slice(0, 2));
  if (stateErr) return stateErr;
  return null;
}

export function validateIndianPhone(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return null;
  if (!INDIAN_MOBILE_REGEX.test(normalized)) return 'Invalid Indian mobile number';
  return null;
}

export function validateHsnSac(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  if (!HSN_SAC_REGEX.test(trimmed)) {
    return 'HSN/SAC must be 4, 6, or 8 digits';
  }
  return null;
}

export function validateGstinPanConsistency(gstin: string, pan: string): string | null {
  const g = normalizeGstin(gstin);
  const p = normalizePan(pan);
  if (!g || !p) return null;
  if (g.slice(2, 12) !== p) return 'PAN must match characters 3–12 of GSTIN';
  return null;
}

export function validateGstinStateConsistency(gstin: string, stateCode: string): string | null {
  const g = normalizeGstin(gstin);
  const s = stateCode.trim();
  if (!g || !s) return null;
  if (g.slice(0, 2) !== s) return 'State code must match first 2 digits of GSTIN';
  return null;
}

export interface IndianCustomerFields {
  gstin?: string;
  pan?: string;
  phone?: string;
  billingStateCode?: string;
}

export function validateIndianCustomerFields(body: IndianCustomerFields): string | null {
  if (body.billingStateCode) {
    const err = validateIndianStateCode(body.billingStateCode);
    if (err) return err;
  }
  if (body.pan) {
    const err = validatePan(body.pan);
    if (err) return err;
  }
  if (body.gstin) {
    const err = validateGstin(body.gstin);
    if (err) return err;
  }
  if (body.phone) {
    const err = validateIndianPhone(body.phone);
    if (err) return err;
  }
  if (body.gstin && body.pan) {
    const err = validateGstinPanConsistency(body.gstin, body.pan);
    if (err) return err;
  }
  if (body.gstin && body.billingStateCode) {
    const err = validateGstinStateConsistency(body.gstin, body.billingStateCode);
    if (err) return err;
  }
  return null;
}

export function sanitizeIndianCustomerFields(body: IndianCustomerFields): IndianCustomerFields {
  return {
    ...body,
    gstin: body.gstin?.trim() ? normalizeGstin(body.gstin) : body.gstin,
    pan: body.pan?.trim() ? normalizePan(body.pan) : body.pan,
    phone: body.phone?.trim() ? normalizeIndianPhone(body.phone) : body.phone,
    billingStateCode: body.billingStateCode?.trim() || body.billingStateCode,
  };
}

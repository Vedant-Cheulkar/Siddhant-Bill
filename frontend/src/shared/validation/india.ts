/**
 * Indian regulatory field validation (GST, PAN, state codes, mobile, HSN/SAC).
 * References: GSTIN format (15 chars), PAN format (10 chars), GST state codes.
 */

/** GST state / UT codes (2-digit, zero-padded). */
export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

export const VALID_STATE_CODE_SET = new Set(Object.keys(INDIAN_STATE_CODES));

/** ABCDE1234F */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** 27AABCM1234F1Z5 — state(2) + PAN(10) + entity(1) + Z + checksum(1) */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** 10-digit mobile starting 6–9 */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** HSN: 4/6/8 digits; SAC: 6 digits (typically 99xxxx) */
export const HSN_SAC_REGEX = /^(\d{4}|\d{6}|\d{8})$/;

export function normalizePan(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeGstin(value: string): string {
  return value.trim().toUpperCase();
}

/** Strip spaces/dashes; remove +91 / leading 0 for validation. */
export function normalizeIndianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function validateIndianStateCode(code: string): string | null {
  const trimmed = code.trim();
  if (!/^\d{2}$/.test(trimmed)) return 'Enter a valid 2-digit GST state code (e.g. 27)';
  if (!VALID_STATE_CODE_SET.has(trimmed)) return 'Unknown GST state code';
  return null;
}

export function validatePan(pan: string): string | null {
  const normalized = normalizePan(pan);
  if (!normalized) return null;
  if (normalized.length !== 10) return 'PAN must be exactly 10 characters';
  if (!PAN_REGEX.test(normalized)) return 'Invalid PAN format (e.g. ABCDE1234F)';
  return null;
}

export function validateGstin(gstin: string): string | null {
  const normalized = normalizeGstin(gstin);
  if (!normalized) return null;
  if (normalized.length !== 15) return 'GSTIN must be exactly 15 characters';
  if (!GSTIN_REGEX.test(normalized)) return 'Invalid GSTIN format (e.g. 27AABCM1234F1Z5)';
  const stateErr = validateIndianStateCode(normalized.slice(0, 2));
  if (stateErr) return `GSTIN state prefix invalid: ${stateErr}`;
  return null;
}

export function validateIndianPhone(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return null;
  if (!INDIAN_MOBILE_REGEX.test(normalized)) {
    return 'Enter a valid 10-digit Indian mobile number (starts with 6–9)';
  }
  return null;
}

export function validateHsnSac(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  if (!HSN_SAC_REGEX.test(trimmed)) {
    return 'HSN/SAC must be 4, 6, or 8 digits (e.g. 998814 or 87083000)';
  }
  return null;
}

/** GSTIN embeds PAN at positions 3–12 (1-based). */
export function gstinEmbeddedPan(gstin: string): string {
  return normalizeGstin(gstin).slice(2, 12);
}

export function validateGstinPanConsistency(gstin: string, pan: string): string | null {
  const g = normalizeGstin(gstin);
  const p = normalizePan(pan);
  if (!g || !p) return null;
  if (gstinEmbeddedPan(g) !== p) {
    return 'PAN must match characters 3–12 of the GSTIN';
  }
  return null;
}

export function validateGstinStateConsistency(gstin: string, stateCode: string): string | null {
  const g = normalizeGstin(gstin);
  const s = stateCode.trim();
  if (!g || !s) return null;
  if (g.slice(0, 2) !== s) {
    return 'State code must match the first 2 digits of GSTIN';
  }
  return null;
}

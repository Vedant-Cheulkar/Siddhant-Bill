import { describe, it, expect } from 'vitest';
import {
  validateGstin,
  validatePan,
  validateIndianPhone,
  validateIndianStateCode,
  validateGstinPanConsistency,
  validateGstinStateConsistency,
  validateHsnSac,
  normalizeIndianPhone,
} from '@shared/validation/india';

describe('Indian field validation', () => {
  it('accepts valid PAN', () => {
    expect(validatePan('AABCM1234F')).toBeNull();
  });

  it('rejects invalid PAN', () => {
    expect(validatePan('ABC123')).not.toBeNull();
  });

  it('accepts valid GSTIN', () => {
    expect(validateGstin('27AABCM1234F1Z5')).toBeNull();
  });

  it('rejects GSTIN with wrong length', () => {
    expect(validateGstin('27AABCM1234F')).not.toBeNull();
  });

  it('validates GST state code', () => {
    expect(validateIndianStateCode('27')).toBeNull();
    expect(validateIndianStateCode('99')).toBeNull();
    expect(validateIndianStateCode('55')).not.toBeNull();
  });

  it('validates Indian mobile numbers', () => {
    expect(validateIndianPhone('9820111222')).toBeNull();
    expect(validateIndianPhone('+91 98201 11222')).toBeNull();
    expect(normalizeIndianPhone('+91 98201 11222')).toBe('9820111222');
    expect(validateIndianPhone('5820111222')).not.toBeNull();
  });

  it('checks GSTIN and PAN consistency', () => {
    expect(validateGstinPanConsistency('27AABCM1234F1Z5', 'AABCM1234F')).toBeNull();
    expect(validateGstinPanConsistency('27AABCM1234F1Z5', 'ZZZZZ9999Z')).not.toBeNull();
  });

  it('checks GSTIN and state code consistency', () => {
    expect(validateGstinStateConsistency('27AABCM1234F1Z5', '27')).toBeNull();
    expect(validateGstinStateConsistency('27AABCM1234F1Z5', '24')).not.toBeNull();
  });

  it('validates HSN/SAC codes', () => {
    expect(validateHsnSac('998814')).toBeNull();
    expect(validateHsnSac('87083000')).toBeNull();
    expect(validateHsnSac('123')).not.toBeNull();
  });
});

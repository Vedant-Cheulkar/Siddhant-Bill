import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '@shared/utils/format';

describe('formatCurrency', () => {
  it('formats INR amounts with rupee symbol', () => {
    const result = formatCurrency(1000);
    expect(result).toMatch(/₹/);
    expect(result).toMatch(/1,000/);
  });

  it('rounds to zero decimal places', () => {
    const result = formatCurrency(1234.56);
    expect(result).not.toMatch(/\./);
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });

  it('handles large amounts with Indian number format', () => {
    const result = formatCurrency(1_00_000);
    expect(result).toMatch(/1,00,000/);
  });

  it('supports custom currency', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toMatch(/\$/);
  });
});

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    expect(formatDate('2026-05-22')).toBe('May 22, 2026');
  });

  it('returns original string on invalid input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('formats date with single-digit day', () => {
    expect(formatDate('2026-01-05')).toBe('Jan 5, 2026');
  });
});

describe('formatNumber', () => {
  it('formats number with Indian locale separators', () => {
    expect(formatNumber(100000)).toBe('1,00,000');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    const result = formatNumber(-500);
    expect(result).toMatch(/-/);
  });
});

import { describe, it, expect } from 'vitest';

interface LineItem {
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

function calcLineTotal(item: LineItem): number {
  const base = item.quantity * item.unitPrice;
  const afterDiscount = base * (1 - item.discountPercent / 100);
  return afterDiscount * (1 + item.taxPercent / 100);
}

function calcGrandTotal(items: LineItem[]): number {
  return items.reduce((s, i) => s + calcLineTotal(i), 0);
}

describe('calcLineTotal', () => {
  it('calculates simple line total without tax or discount', () => {
    expect(calcLineTotal({ quantity: 2, unitPrice: 100, taxPercent: 0, discountPercent: 0 })).toBe(200);
  });

  it('applies tax correctly', () => {
    expect(calcLineTotal({ quantity: 1, unitPrice: 100, taxPercent: 18, discountPercent: 0 })).toBe(118);
  });

  it('applies discount before tax', () => {
    const result = calcLineTotal({ quantity: 1, unitPrice: 100, taxPercent: 18, discountPercent: 10 });
    expect(result).toBeCloseTo(106.2, 2);
  });

  it('handles 100% discount (free item)', () => {
    expect(calcLineTotal({ quantity: 5, unitPrice: 200, taxPercent: 18, discountPercent: 100 })).toBe(0);
  });

  it('handles zero quantity', () => {
    expect(calcLineTotal({ quantity: 0, unitPrice: 500, taxPercent: 18, discountPercent: 0 })).toBe(0);
  });

  it('handles fractional quantity', () => {
    const result = calcLineTotal({ quantity: 2.5, unitPrice: 100, taxPercent: 0, discountPercent: 0 });
    expect(result).toBe(250);
  });
});

describe('calcGrandTotal', () => {
  it('sums multiple line items', () => {
    const items: LineItem[] = [
      { quantity: 1, unitPrice: 100, taxPercent: 0, discountPercent: 0 },
      { quantity: 2, unitPrice: 50,  taxPercent: 0, discountPercent: 0 },
    ];
    expect(calcGrandTotal(items)).toBe(200);
  });

  it('returns 0 for empty list', () => {
    expect(calcGrandTotal([])).toBe(0);
  });

  it('correctly totals with mixed tax rates', () => {
    const items: LineItem[] = [
      { quantity: 1, unitPrice: 100, taxPercent: 5,  discountPercent: 0 },
      { quantity: 1, unitPrice: 100, taxPercent: 18, discountPercent: 0 },
    ];
    expect(calcGrandTotal(items)).toBeCloseTo(223, 1);
  });
});

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent?: number;
}

export interface TaxBreakdown {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export function calcLineTaxable(item: LineItemInput): number {
  const discount = item.discountPercent ?? 0;
  return round2(item.quantity * item.unitPrice * (1 - discount / 100));
}

export function calcLineTotal(item: LineItemInput): number {
  const taxable = calcLineTaxable(item);
  return round2(taxable * (1 + item.taxPercent / 100));
}

export function calcGrandTotal(items: LineItemInput[]): number {
  return round2(items.reduce((sum, item) => sum + calcLineTotal(item), 0));
}

export function calcTaxBreakdown(items: LineItemInput[], isIntraState: boolean): TaxBreakdown {
  const taxableAmount = round2(items.reduce((s, item) => s + calcLineTaxable(item), 0));
  const taxAmount = round2(items.reduce((s, item) => s + round2(calcLineTaxable(item) * (item.taxPercent / 100)), 0));
  return {
    taxableAmount,
    cgstAmount: isIntraState ? round2(taxAmount / 2) : 0,
    sgstAmount: isIntraState ? round2(taxAmount / 2) : 0,
    igstAmount: isIntraState ? 0 : taxAmount,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

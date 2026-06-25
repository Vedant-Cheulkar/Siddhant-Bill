export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent?: number;
}

export function calcLineTotal(item: LineItemInput): number {
  const discount = item.discountPercent ?? 0;
  return round2(
    item.quantity * item.unitPrice * (1 + item.taxPercent / 100) * (1 - discount / 100),
  );
}

export function calcGrandTotal(items: LineItemInput[]): number {
  return round2(items.reduce((sum, item) => sum + calcLineTotal(item), 0));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

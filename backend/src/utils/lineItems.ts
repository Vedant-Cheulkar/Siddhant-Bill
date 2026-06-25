export function validateLineItems(raw: Array<Record<string, unknown>> | undefined): string | null {
  const items = raw ?? [];
  if (items.length === 0) return 'At least one line item is required';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = `Line item ${i + 1}`;
    const description = String(item.description ?? '').trim();
    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unitPrice ?? 0);
    const taxPercent = Number(item.taxPercent ?? 0);
    const discountPercent = Number(item.discountPercent ?? 0);

    if (!description) return `${label}: description is required`;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return `${label}: quantity must be greater than zero`;
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return `${label}: unit price cannot be negative`;
    }
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      return `${label}: tax must be between 0 and 100`;
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return `${label}: discount must be between 0 and 100`;
    }
  }

  return null;
}

import { httpError } from './httpError.js';

interface MongoDuplicateKeyError {
  code: number;
  keyPattern?: Record<string, unknown>;
}

export function isDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && (err as MongoDuplicateKeyError).code === 11000;
}

export function duplicateKeyMessage(err: MongoDuplicateKeyError): string {
  const keys = Object.keys(err.keyPattern ?? {});

  if (keys.includes('email')) return 'A user with this email already exists';
  if (keys.includes('code')) return 'A customer with this code already exists';
  if (keys.includes('sku')) return 'A product with this SKU already exists';
  if (keys.includes('displayNumber')) return 'An invoice with this number already exists';
  if (keys.includes('orderNumber')) return 'A work order with this number already exists';

  return 'A record with this value already exists';
}

export function throwIfDuplicateKey(err: unknown): void {
  if (isDuplicateKeyError(err)) {
    throw httpError(409, duplicateKeyMessage(err));
  }
}

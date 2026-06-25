export const USER_ROLES = ['ADMIN', 'ACCOUNTANT'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const BASE_PERMISSIONS = [
  'CUSTOMER_READ',
  'CUSTOMER_WRITE',
  'PRODUCT_READ',
  'PRODUCT_WRITE',
  'INVOICE_READ',
  'INVOICE_WRITE',
  'REPORT_READ',
] as const;

const ADMIN_PERMISSIONS = [...BASE_PERMISSIONS, 'USER_READ', 'USER_WRITE'] as const;

export function permissionsForRole(role: UserRole): string[] {
  if (role === 'ADMIN') return [...ADMIN_PERMISSIONS];
  return [...BASE_PERMISSIONS];
}

export function rolesForRole(role: UserRole): string[] {
  return [role];
}

export function normalizeRole(role?: string | null): UserRole {
  if (role === 'ACCOUNTANT') return 'ACCOUNTANT';
  return 'ADMIN';
}

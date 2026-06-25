import { httpError } from './httpError.js';

export const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'CANCELLED'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['ISSUED'],
  ISSUED: ['CANCELLED'],
  CANCELLED: [],
};

export const WORK_ORDER_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'INVOICED',
  'CANCELLED',
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

const WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: [],
  CANCELLED: [],
};

function assertKnownStatus<T extends string>(value: string, allowed: readonly T[], label: string): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw httpError(400, `Invalid ${label} status: ${value}`);
  }
}

export function assertInvoiceTransition(from: string, to: string): void {
  assertKnownStatus(from, INVOICE_STATUSES, 'invoice');
  assertKnownStatus(to, INVOICE_STATUSES, 'invoice');
  if (!INVOICE_TRANSITIONS[from].includes(to)) {
    throw httpError(400, `Cannot transition invoice from ${from} to ${to}`);
  }
}

export function assertInvoiceEditable(status: string): void {
  assertKnownStatus(status, INVOICE_STATUSES, 'invoice');
  if (status !== 'DRAFT') {
    throw httpError(400, 'Only draft invoices can be edited');
  }
}

export function assertInvoiceDeletable(status: string): void {
  assertKnownStatus(status, INVOICE_STATUSES, 'invoice');
  if (status !== 'DRAFT') {
    throw httpError(400, 'Only draft invoices can be deleted');
  }
}

export function assertWorkOrderTransition(from: string, to: string): void {
  assertKnownStatus(from, WORK_ORDER_STATUSES, 'work order');
  assertKnownStatus(to, WORK_ORDER_STATUSES, 'work order');
  if (!WORK_ORDER_TRANSITIONS[from].includes(to)) {
    throw httpError(400, `Cannot transition work order from ${from} to ${to}`);
  }
}

export function assertWorkOrderEditable(status: string): void {
  assertKnownStatus(status, WORK_ORDER_STATUSES, 'work order');
  if (status === 'INVOICED' || status === 'CANCELLED') {
    throw httpError(400, 'Invoiced or cancelled work orders cannot be edited');
  }
}

export function assertWorkOrderDeletable(status: string): void {
  assertKnownStatus(status, WORK_ORDER_STATUSES, 'work order');
  if (status !== 'OPEN' && status !== 'CANCELLED') {
    throw httpError(400, 'Only open or cancelled work orders can be deleted');
  }
}

import { Counter } from '../models/Counter.js';
import { Invoice } from '../models/Invoice.js';
import { OrganizationSettings } from '../models/OrganizationSettings.js';
import { WorkOrder } from '../models/WorkOrder.js';

async function bootstrapSequence(key: string, bootstrap: () => Promise<number>): Promise<void> {
  const existing = await Counter.findById(key);
  if (existing) return;

  const start = await bootstrap();
  try {
    await Counter.create({ _id: key, seq: start });
  } catch {
    // Another request initialized the counter first.
  }
}

function parseSuffix(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

async function maxInvoiceSuffix(orgId: string, prefix: string): Promise<number> {
  const [latest] = await Invoice.aggregate<{ displayNumber: string }>([
    {
      $match: {
        organizationId: orgId,
        deletedAt: null,
        displayNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` },
      },
    },
    { $sort: { displayNumber: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, displayNumber: 1 } },
  ]);

  return parseSuffix(latest?.displayNumber);
}

async function maxWorkOrderSuffix(orgId: string, prefix: string): Promise<number> {
  const [latest] = await WorkOrder.aggregate<{ orderNumber: string }>([
    {
      $match: {
        organizationId: orgId,
        deletedAt: null,
        orderNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` },
      },
    },
    { $sort: { orderNumber: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, orderNumber: 1 } },
  ]);

  return parseSuffix(latest?.orderNumber);
}

async function nextSequence(key: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true });
  return counter!.seq;
}

function currentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  // Indian FY: April 1 – March 31
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = String(fyStart + 1).slice(-2);
  return `${fyStart}-${fyEnd}`;
}

async function getInvoiceConfig(orgId: string) {
  const settings = await OrganizationSettings.findById(orgId).lean();
  const prefix = settings?.invoice?.prefix?.trim() || 'SL';
  const startingNumber = settings?.invoice?.startingNumber ?? 1;
  return { prefix, startingNumber };
}

export async function nextInvoiceNumber(orgId: string): Promise<string> {
  const fy = currentFinancialYear();
  const { prefix, startingNumber } = await getInvoiceConfig(orgId);
  const numberPrefix = `${prefix}/${fy}/`;
  const key = `invoice:${orgId}:${fy}`;

  await bootstrapSequence(key, async () => {
    const max = await maxInvoiceSuffix(orgId, numberPrefix);
    return Math.max(max, startingNumber - 1);
  });

  const seq = await nextSequence(key);
  return `${numberPrefix}${String(seq).padStart(3, '0')}`;
}

export async function nextWorkOrderNumber(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'WO';
  const numberPrefix = `${prefix}-${year}-`;
  const key = `workOrder:${orgId}:${year}`;

  await bootstrapSequence(key, () => maxWorkOrderSuffix(orgId, numberPrefix));

  const seq = await nextSequence(key);
  return `${numberPrefix}${String(seq).padStart(3, '0')}`;
}

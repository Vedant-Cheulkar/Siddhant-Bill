import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../db/connect.js';
import { Customer } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { WorkOrder } from '../models/WorkOrder.js';
import {
  DEFAULT_USER,
  ORGANIZATION_ID,
  SEED_CUSTOMERS,
  SEED_INVOICES,
  SEED_PRODUCTS,
  SEED_WORK_ORDERS,
} from './seedData.js';

function mapLineItem<T extends { id: string }>({ id, ...rest }: T) {
  return { _id: id, ...rest };
}

export async function runSeed(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    await connectDb();
  }

  const existing = await User.findOne({ email: DEFAULT_USER.email });
  if (existing) {
    console.log(`Seed skipped: user ${DEFAULT_USER.email} already exists`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_USER.password, 10);

  await User.create({
    _id: DEFAULT_USER.id,
    email: DEFAULT_USER.email,
    fullName: DEFAULT_USER.fullName,
    passwordHash,
    organizationId: ORGANIZATION_ID,
    role: 'ADMIN',
    active: true,
  });

  await Customer.insertMany(
    SEED_CUSTOMERS.map(({ id, createdAt, updatedAt, ...rest }) => ({
      _id: id,
      organizationId: ORGANIZATION_ID,
      ...rest,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })),
  );

  await Product.insertMany(
    SEED_PRODUCTS.map(({ id, createdAt, updatedAt, ...rest }) => ({
      _id: id,
      organizationId: ORGANIZATION_ID,
      ...rest,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })),
  );

  await Invoice.insertMany(
    SEED_INVOICES.map(({ id, items, createdAt, updatedAt, ...rest }) => ({
      _id: id,
      organizationId: ORGANIZATION_ID,
      ...rest,
      items: items.map(mapLineItem),
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })),
  );

  await WorkOrder.insertMany(
    SEED_WORK_ORDERS.map(({ id, items, createdAt, updatedAt, ...rest }) => ({
      _id: id,
      organizationId: ORGANIZATION_ID,
      ...rest,
      items: items.map(mapLineItem),
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })),
  );

  console.log(
    `Seed complete: 1 user, ${SEED_CUSTOMERS.length} customers, ${SEED_PRODUCTS.length} products, ${SEED_INVOICES.length} invoices, ${SEED_WORK_ORDERS.length} work orders`,
  );
}

const isMainModule =
  Boolean(process.argv[1]) &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMainModule) {
  runSeed()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed failed', err);
      await mongoose.disconnect().catch(() => undefined);
      process.exit(1);
    });
}

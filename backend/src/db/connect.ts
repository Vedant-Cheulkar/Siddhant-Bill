import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

// Some Windows networks refuse SRV queries to the router DNS; public resolvers work.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  console.log('MongoDB connected');
}

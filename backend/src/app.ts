import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { correlationId } from './middleware/correlationId.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: env.nodeEnv === 'production',
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      exposedHeaders: ['X-Correlation-Id'],
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(correlationId);

  app.get('/actuator/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    const status = dbUp ? 'UP' : 'DOWN';
    res.status(dbUp ? 200 : 503).json({ status, database: dbUp ? 'UP' : 'DOWN' });
  });

  app.use('/api/v1', apiRoutes);
  app.use(errorHandler);

  return app;
}

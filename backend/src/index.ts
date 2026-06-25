import { createApp } from './app.js';
import { connectDb } from './db/connect.js';
import { env } from './config/env.js';
import { runSeed } from './seed/seed.js';

async function main() {
  await connectDb();
  if (env.seedOnStartup) {
    await runSeed();
  }
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Billing API listening on http://localhost:${env.port}`);
    console.log(`Health: http://localhost:${env.port}/actuator/health`);
    console.log(`API base: http://localhost:${env.port}/api/v1`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

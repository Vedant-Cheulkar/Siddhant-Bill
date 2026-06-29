import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/siddhant_billing'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-key-minimum-32-characters-long-for-hs256'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((s) => s.trim()),
  seedOnStartup: process.env.SEED_ON_STARTUP !== 'false',
  passwordResetBaseUrl: process.env.PASSWORD_RESET_BASE_URL ?? 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
};

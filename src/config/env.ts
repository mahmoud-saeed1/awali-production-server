import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),
  BASE_URL: z.string().default('http://localhost:5000/api/v1'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_DB_NAME: z.string().min(1).default('awali_dashboard'),
  MONGODB_POOL_SIZE: z.coerce.number().default(10),

  // JWT
  JWT_SECRET: z.string().min(20, 'JWT secret must be at least 20 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(20, 'JWT refresh secret must be at least 20 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(4).max(14).default(12),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().default(''),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().default(''),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().default(''),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().default('awali-media'),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().default(''),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Super Admin Seed
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@awali.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default('Admin@Awali2026!'),
  SUPER_ADMIN_NAME_EN: z.string().default('Super Admin'),
  SUPER_ADMIN_NAME_AR: z.string().default('المدير العام'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

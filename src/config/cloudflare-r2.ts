import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: env.CLOUDFLARE_ACCOUNT_ID
    ? `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  forcePathStyle: true, // Required for Cloudflare R2 — uses path-style URLs
  credentials:
    env.CLOUDFLARE_R2_ACCESS_KEY_ID && env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME;
export const R2_PUBLIC_URL = env.CLOUDFLARE_R2_PUBLIC_URL;

import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

// Neon injects AWS_ENDPOINT_URL_S3, AWS_REGION and branch-scoped credentials.
// No browser-facing upload endpoints are exposed by this application.
export const STORAGE_BUCKET = 'vaqt-xati-private';
let client: S3Client | undefined;
export function storage() {
  if (!process.env.AWS_ENDPOINT_URL_S3 || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Neon Object Storage environment variables are missing');
  }
  return client ??= new S3Client({ forcePathStyle: true });
}

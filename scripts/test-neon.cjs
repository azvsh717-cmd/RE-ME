// Writes and deletes one uniquely named private test object; no connection strings are logged.
const { loadEnvConfig } = require('@next/env');
const postgres = require('postgres');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');
loadEnvConfig(process.cwd());
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  for (const key of ['AWS_ENDPOINT_URL_S3','AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY']) if (!process.env[key]) throw new Error(`${key} is missing`);
  const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  try { const rows = await sql`select 1 as ok`; if (rows[0].ok !== 1) throw new Error('Unexpected query result'); console.log('Postgres: SELECT 1 passed'); } finally { await sql.end(); }
  const s3 = new S3Client({ forcePathStyle: true });
  const Bucket = 'vaqt-xati-private', Key = `health-check/${randomUUID()}.txt`, value = 'vaqt-xati-neon-check';
  let written = false;
  try {
    await s3.send(new PutObjectCommand({Bucket, Key, Body: value, ContentType:'text/plain'})); written = true;
    const res = await s3.send(new GetObjectCommand({Bucket, Key}));
    if (await res.Body.transformToString() !== value) throw new Error('Object content mismatch');
    console.log('Object Storage: write and read passed');
  } finally { if (written) { await s3.send(new DeleteObjectCommand({Bucket, Key})); console.log('Object Storage: test object deleted'); } s3.destroy(); }
}
main().catch(e => { console.error('Neon test failed:', e.name, e.message.replace(/postgres(?:ql)?:\/\/\S+/gi, '[redacted]')); process.exitCode = 1; });

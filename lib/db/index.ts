import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
// Lazy initialization lets the application build before the user provides credentials.
let instance: ReturnType<typeof drizzle> | undefined;
export function db() { if (!instance) { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL sozlanmagan'); instance = drizzle(postgres(process.env.DATABASE_URL, { prepare: false, max: 1 })); } return instance; }

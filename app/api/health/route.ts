import { NextResponse } from 'next/server';
import postgres from 'postgres';

// Diagnostics endpoint: open /api/health in the browser to see what is missing.
// It never returns secret values, only whether each requirement is satisfied.
export const dynamic = 'force-dynamic';

async function checkDatabase() {
  if (!process.env.DATABASE_URL) return { ok: false, reason: 'DATABASE_URL sozlanmagan' };
  const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
  try {
    await sql`select 1 as ok`;
    const rows = await sql<{ table_name: string }[]>`
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('users', 'memory_facts', 'chat_messages', 'mood_scores')
    `;
    const found = rows.map(r => r.table_name).sort();
    const expected = ['chat_messages', 'memory_facts', 'mood_scores', 'users'];
    const missing = expected.filter(t => !found.includes(t));
    return missing.length
      ? { ok: false, reason: `Bazaga ulanish ishlaydi, lekin jadvallar yo‘q: ${missing.join(', ')}. drizzle/0000_initial.sql ni ishga tushiring.` }
      : { ok: true, tables: found };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return { ok: false, reason: `${err.code ?? 'XATO'}: ${(err.message ?? '').slice(0, 160)}`.replace(/postgres(?:ql)?:\/\/\S+/gi, '[redacted]') };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function GET() {
  const secret = process.env.SECRET_KEY ?? '';
  const dbState = await checkDatabase();
  const checks = {
    DATABASE_URL: { ok: Boolean(process.env.DATABASE_URL), hint: 'Supabase → Connect → Connection pooling (Session/Transaction) manzili' },
    SECRET_KEY: { ok: secret.length >= 32, hint: 'Kamida 32 belgi: openssl rand -hex 32' },
    GEMINI_API_KEY: { ok: Boolean(process.env.GEMINI_API_KEY), hint: 'AI suhbat uchun; ro‘yxatdan o‘tishga ta’sir qilmaydi' },
    database: dbState,
  };
  const ready = checks.DATABASE_URL.ok && checks.SECRET_KEY.ok && dbState.ok;
  return NextResponse.json({ ready, checks }, { status: ready ? 200 : 503 });
}

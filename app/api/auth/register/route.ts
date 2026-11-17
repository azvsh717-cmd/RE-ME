import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth';
import { configIssues, configErrorMessage } from '@/lib/config';

const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(72) });

// Postgres / network failures that usually mean the database is unreachable or not migrated yet.
function databaseHint(e: unknown) {
  const err = e as { code?: string; message?: string };
  const code = err.code ?? '';
  if (code === '42P01') return 'Bazada jadvallar yo‘q. `drizzle/0000_initial.sql` faylini Supabase SQL Editor’da ishga tushiring.';
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' || code === 'EAI_AGAIN') {
    return 'Bazaga ulanib bo‘lmadi. DATABASE_URL to‘g‘riligini va Supabase loyihasi faol ekanini tekshiring.';
  }
  if (code === '28P01' || code === '28000') return 'Bazaga kirish rad etildi: DATABASE_URL’dagi parol noto‘g‘ri.';
  if (code === '3D000') return 'Bunday nomdagi baza topilmadi: DATABASE_URL’dagi nomni tekshiring.';
  if (/SSL|self signed|certificate/i.test(err.message ?? '')) return 'SSL xatosi: DATABASE_URL oxiriga `?sslmode=require` qo‘shib ko‘ring.';
  return 'Ma’lumotlar bazasi bilan aloqa xatosi. DATABASE_URL va migratsiyani tekshiring.';
}

export async function POST(req: Request) {
  const issues = configIssues();
  if (issues.length) return NextResponse.json({ error: configErrorMessage(issues), code: 'CONFIG' }, { status: 500 });

  try {
    const p = schema.safeParse(await req.json());
    if (!p.success) return NextResponse.json({ error: 'Email to‘g‘ri, parol esa kamida 8 belgidan iborat bo‘lsin.' }, { status: 400 });

    const [u] = await db().insert(users).values({ email: p.data.email.toLowerCase(), passwordHash: await bcrypt.hash(p.data.password, 12) }).returning({ id: users.id });
    await setSession(u.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('register failed', e);
    if ((e as { code?: string }).code === '23505') return NextResponse.json({ error: 'Bu email allaqachon ro‘yxatdan o‘tgan.' }, { status: 409 });
    return NextResponse.json({ error: `Ro‘yxatdan o‘tib bo‘lmadi. ${databaseHint(e)}`, code: 'DB' }, { status: 500 });
  }
}

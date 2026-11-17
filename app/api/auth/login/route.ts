import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth';
import { z } from 'zod';
export async function POST(req:Request) { try { const data=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(72)}).safeParse(await req.json()); if(!data.success) return NextResponse.json({error:'Email yoki parol noto‘g‘ri.'},{status:400}); const [u]=await db().select().from(users).where(eq(users.email,data.data.email.toLowerCase())).limit(1); if(!u || !await bcrypt.compare(data.data.password,u.passwordHash)) return NextResponse.json({error:'Email yoki parol noto‘g‘ri.'},{status:401}); await setSession(u.id); return NextResponse.json({ok:true}); } catch(e) { console.error(e); return NextResponse.json({error:'Kirishda xatolik yuz berdi.'},{status:500}); } }

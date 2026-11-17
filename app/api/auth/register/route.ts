import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth';
const schema=z.object({email:z.string().trim().email().max(254),password:z.string().min(8).max(72)});
export async function POST(req:Request) { try { const p=schema.safeParse(await req.json()); if(!p.success) return NextResponse.json({error:'Email to‘g‘ri, parol esa kamida 8 belgidan iborat bo‘lsin.'},{status:400}); const [u]=await db().insert(users).values({email:p.data.email.toLowerCase(),passwordHash:await bcrypt.hash(p.data.password,12)}).returning({id:users.id}); await setSession(u.id); return NextResponse.json({ok:true}); } catch(e) { console.error(e); if ((e as {code?:string}).code==='23505') return NextResponse.json({error:'Bu email allaqachon ro‘yxatdan o‘tgan.'},{status:409}); return NextResponse.json({error:'Ro‘yxatdan o‘tib bo‘lmadi. Server sozlamalarini tekshiring.'},{status:500}); } }

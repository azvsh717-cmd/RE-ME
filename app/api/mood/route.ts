import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { moodScores } from '@/lib/db/schema';
import { sessionUser } from '@/lib/auth';
export async function GET() { try {const u=await sessionUser(); if(!u) return NextResponse.json({error:'Kirish kerak'},{status:401}); const data=await db().select().from(moodScores).where(eq(moodScores.userId,u.id)).orderBy(asc(moodScores.createdAt)); return NextResponse.json(data); } catch(e){console.error(e); return NextResponse.json({error:'Grafikni yuklab bo‘lmadi.'},{status:500});} }

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryFacts, chatMessages, moodScores } from '@/lib/db/schema';
import { sessionUser } from '@/lib/auth';
export async function GET() { try { const u=await sessionUser(); if(!u) return NextResponse.json({error:'Kirish kerak'},{status:401}); const [facts,messages,moods]=await Promise.all([db().select().from(memoryFacts).where(and(eq(memoryFacts.userId,u.id),eq(memoryFacts.source,'onboarding'))),db().select().from(chatMessages).where(eq(chatMessages.userId,u.id)),db().select().from(moodScores).where(eq(moodScores.userId,u.id))]); const items=[...facts.map(x=>({id:x.id,type:'onboarding',content:x.factText,createdAt:x.createdAt})),...messages.map(x=>({id:x.id,type:x.role,content:x.content,createdAt:x.createdAt})),...moods.map(x=>({id:x.id,type:'mood',content:`${x.score}/10${x.note?' — '+x.note:''}`,createdAt:x.createdAt}))].sort((a,b)=>a.createdAt.getTime()-b.createdAt.getTime()); return NextResponse.json(items); } catch(e){console.error(e); return NextResponse.json({error:'Yozuvlarni olib bo‘lmadi.'},{status:500});} }

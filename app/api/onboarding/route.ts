import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sessionUser, hasOnboarded } from '@/lib/auth';
import { db } from '@/lib/db';
import { memoryFacts } from '@/lib/db/schema';
import { questions } from '@/lib/questions';
export async function POST(req:Request) { try { const user=await sessionUser(); if(!user) return NextResponse.json({error:'Avval tizimga kiring.'},{status:401}); if(await hasOnboarded(user.id)) return NextResponse.json({error:'Savolnoma allaqachon to‘ldirilgan.'},{status:409}); const p=z.object({answers:z.array(z.string().trim().min(1).max(2000)).length(questions.length)}).safeParse(await req.json()); if(!p.success) return NextResponse.json({error:'Har bir savolga javob yozing.'},{status:400}); await db().insert(memoryFacts).values(p.data.answers.map((answer,i)=>({userId:user.id,source:'onboarding',factText:`${questions[i]} ${answer}`}))); return NextResponse.json({ok:true}); } catch(e) { console.error(e); return NextResponse.json({error:'Javoblarni saqlab bo‘lmadi.'},{status:500}); } }

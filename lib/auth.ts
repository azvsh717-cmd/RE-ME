import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memoryFacts, users } from '@/lib/db/schema';
const key = () => { const s = process.env.SECRET_KEY; if (!s || s.length < 32) throw new Error('SECRET_KEY kamida 32 belgidan iborat bo‘lishi kerak'); return new TextEncoder().encode(s); };
export async function setSession(id: string) { const token = await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuedAt().setExpirationTime('7d').sign(key()); cookies().set('vaqt_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7}); }
export async function sessionUser() { try { const token=cookies().get('vaqt_session')?.value; if (!token) return null; const {payload}=await jwtVerify(token,key(),{algorithms:['HS256']}); if (!payload.sub) return null; const [user]=await db().select({id:users.id,email:users.email,createdAt:users.createdAt}).from(users).where(eq(users.id,payload.sub)).limit(1); return user || null; } catch { return null; } }
export async function requireUser() { const user=await sessionUser(); if (!user) redirect('/login'); return user; }
export async function hasOnboarded(id:string) { const [fact]=await db().select({id:memoryFacts.id}).from(memoryFacts).where(and(eq(memoryFacts.userId,id),eq(memoryFacts.source,'onboarding'))).limit(1); return !!fact; }
export async function requireReadyUser() { const user=await requireUser(); if (!await hasOnboarded(user.id)) redirect('/onboarding'); return user; }

import { redirect } from 'next/navigation';
import { sessionUser, hasOnboarded } from '@/lib/auth';
export default async function Home(){ const user=await sessionUser(); if(!user) redirect('/login'); redirect(await hasOnboarded(user.id)?'/dashboard':'/onboarding'); }

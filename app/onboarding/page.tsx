import { requireUser, hasOnboarded } from '@/lib/auth'; import { redirect } from 'next/navigation'; import Onboarding from '@/components/onboarding';
export default async function Page(){const u=await requireUser(); if(await hasOnboarded(u.id)) redirect('/dashboard'); return <Onboarding/>;}

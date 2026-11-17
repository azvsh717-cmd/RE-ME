import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export async function POST() { cookies().delete('vaqt_session'); return NextResponse.json({ok:true}); }

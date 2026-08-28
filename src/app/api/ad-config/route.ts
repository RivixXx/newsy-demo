import { NextResponse } from 'next/server';
import { readAdConfig } from '@/lib/ad-config';

export async function GET() {
  return NextResponse.json(await readAdConfig(), {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  });
}

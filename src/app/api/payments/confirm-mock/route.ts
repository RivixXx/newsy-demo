import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: 'Endpoint removed. Migrated to Stripe.' }, { status: 410 });
}

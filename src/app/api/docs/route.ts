import { NextResponse } from 'next/server';
import { generateOpenAPIDocument } from '@/lib/openapi';

export const dynamic = 'force-static';

export function GET() {
  const document = generateOpenAPIDocument();
  return NextResponse.json(document, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
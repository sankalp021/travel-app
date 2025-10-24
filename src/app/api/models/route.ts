import { NextResponse } from 'next/server';

// This endpoint is intentionally disabled to avoid model listing calls.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ error: 'Model listing disabled' }, { status: 404 });
}

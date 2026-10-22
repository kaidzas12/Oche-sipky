import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    await db.get('SELECT 1 AS ok');
    return NextResponse.json({ ok: true, db: db.kind });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

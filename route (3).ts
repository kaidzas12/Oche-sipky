import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { isAdmin } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Neprihlásený.' }, { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  // zamietnutie nahlásenia (inzerát je v poriadku)
  await db.run("UPDATE reports SET status = 'dismissed' WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { allow, clientId } from '../../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // jedno zobrazenie na návštevníka a inzerát za 30 minút
  if (!allow(`view:${clientId(req)}:${id}`, 1, 30 * 60_000)) return NextResponse.json({ ok: true, counted: false });
  const db = await getDb();
  const day = new Date().toISOString().slice(0, 10);
  const exists = await db.get('SELECT 1 AS x FROM listings WHERE id = ?', [id]);
  if (!exists) return NextResponse.json({ error: 'Neexistuje.' }, { status: 404 });
  await db.run('INSERT INTO daily_views(day, listing_id, n) VALUES (?, ?, 1) ON CONFLICT (day, listing_id) DO UPDATE SET n = daily_views.n + 1', [day, id]);
  return NextResponse.json({ ok: true, counted: true });
}

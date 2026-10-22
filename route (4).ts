import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { isAdmin } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Neprihlásený.' }, { status: 401 });
  const { id } = await ctx.params;
  let b: { action?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Neplatné dáta.' }, { status: 400 }); }
  const db = await getDb();
  if (b.action === 'hide') await db.run("UPDATE listings SET status = 'hidden' WHERE id = ?", [id]);
  else if (b.action === 'show') {
    await db.run("UPDATE listings SET status = 'active' WHERE id = ?", [id]);
    await db.run("UPDATE reports SET status = 'dismissed' WHERE listing_id = ? AND status = 'open'", [id]);
  } else if (b.action === 'delete') {
    await db.run('DELETE FROM listings WHERE id = ?', [id]);
    await db.run('DELETE FROM photos WHERE id = ?', [id]);
    await db.run('DELETE FROM reports WHERE listing_id = ?', [id]);
    await db.run('DELETE FROM daily_views WHERE listing_id = ?', [id]);
  } else return NextResponse.json({ error: 'Neznáma akcia.' }, { status: 400 });
  return NextResponse.json({ ok: true });
}

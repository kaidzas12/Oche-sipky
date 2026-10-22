import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '../../../../../lib/db';
import { allow, clientId } from '../../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

const REASONS = ['spam', 'podvod', 'zakazany-tovar', 'nespravna-kategoria', 'iny'] as const;
const AUTO_HIDE_AT = 3;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const who = clientId(req);
  if (!allow(`report:${who}`, 8, 24 * 3600_000)) return NextResponse.json({ error: 'Dnes si už nahlásil veľa inzerátov.' }, { status: 429 });
  let b: { reason?: string; note?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Neplatné dáta.' }, { status: 400 }); }
  if (!REASONS.includes(b.reason as (typeof REASONS)[number])) return NextResponse.json({ error: 'Vyber dôvod nahlásenia.' }, { status: 400 });
  const note = (b.note ?? '').toString().trim().slice(0, 300);

  const db = await getDb();
  const l = await db.get<{ id: string }>("SELECT id FROM listings WHERE id = ? AND status = 'active'", [id]);
  if (!l) return NextResponse.json({ error: 'Inzerát neexistuje.' }, { status: 404 });
  const dup = await db.get('SELECT 1 AS x FROM reports WHERE listing_id = ? AND reporter = ? AND status = ?', [id, who, 'open']);
  if (dup) return NextResponse.json({ ok: true, already: true });

  await db.run('INSERT INTO reports(id, listing_id, reason, note, reporter, created_at, status) VALUES (?,?,?,?,?,?,?)',
    ['r' + crypto.randomBytes(6).toString('hex'), id, b.reason, note, who, Date.now(), 'open']);
  const n = (await db.get<{ c: number }>('SELECT COUNT(DISTINCT reporter) c FROM reports WHERE listing_id = ? AND status = ?', [id, 'open']))?.c ?? 0;
  if (n >= AUTO_HIDE_AT) await db.run("UPDATE listings SET status = 'hidden' WHERE id = ? AND status = 'active'", [id]);
  return NextResponse.json({ ok: true, hidden: n >= AUTO_HIDE_AT });
}

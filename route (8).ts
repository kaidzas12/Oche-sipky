import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = req.headers.get('x-edit-token') ?? '';
  const db = await getDb();
  const row = await db.get<{ token: string | null }>('SELECT token FROM listings WHERE id = ? AND is_seed = 0', [id]);
  if (!row || !row.token || row.token !== token) return NextResponse.json({ error: 'Nemáš oprávnenie zmazať tento inzerát.' }, { status: 403 });
  await db.run('DELETE FROM listings WHERE id = ?', [id]);
  await db.run('DELETE FROM photos WHERE id = ?', [id]);
  await db.run('DELETE FROM reports WHERE listing_id = ?', [id]);
  return NextResponse.json({ ok: true });
}

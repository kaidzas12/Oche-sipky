import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^u[0-9a-f]{12}$/.test(id)) return new NextResponse('Not found', { status: 404 });
  const db = await getDb();
  const row = await db.get<{ mime: string; data: Uint8Array }>('SELECT mime, data FROM photos WHERE id = ?', [id]);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(row.data), { headers: { 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=86400' } });
}

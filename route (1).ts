import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { isAdmin } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

const DAY = 86400000;
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Neprihlásený.' }, { status: 401 });
  const db = await getDb();
  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') ?? 'all';
  const q = (sp.get('q') ?? '').trim().toLowerCase().slice(0, 60);
  const now = Date.now();

  const c = (sql: string, p: unknown[] = []) => db.get<{ c: number }>(sql, p).then((r) => r?.c ?? 0);
  const [active, hidden, openReports, newToday, new7d] = await Promise.all([
    c("SELECT COUNT(*) c FROM listings WHERE status = 'active'"),
    c("SELECT COUNT(*) c FROM listings WHERE status = 'hidden'"),
    c("SELECT COUNT(*) c FROM reports WHERE status = 'open'"),
    c('SELECT COUNT(*) c FROM listings WHERE is_seed = 0 AND created_at >= ?', [now - DAY]),
    c('SELECT COUNT(*) c FROM listings WHERE is_seed = 0 AND created_at >= ?', [now - 7 * DAY]),
  ]);
  const userTotal = await c('SELECT COUNT(*) c FROM listings WHERE is_seed = 0');

  // posledných 14 dní
  const from = now - 13 * DAY;
  const days: { day: string; listings: number; views: number }[] = [];
  for (let i = 13; i >= 0; i--) days.push({ day: dayKey(now - i * DAY), listings: 0, views: 0 });
  const idx = new Map(days.map((d, i) => [d.day, i]));
  for (const r of await db.all<{ created_at: number }>('SELECT created_at FROM listings WHERE is_seed = 0 AND created_at >= ?', [from - DAY])) {
    const i = idx.get(dayKey(Number(r.created_at)));
    if (i != null) days[i].listings++;
  }
  for (const r of await db.all<{ day: string; n: number }>('SELECT day, SUM(n) n FROM daily_views WHERE day >= ? GROUP BY day', [dayKey(from)])) {
    const i = idx.get(r.day);
    if (i != null) days[i].views = Number(r.n);
  }
  const views7d = days.slice(-7).reduce((a, d) => a + d.views, 0);

  const byCat = await db.all<{ cat: string; c: number }>("SELECT cat, COUNT(*) c FROM listings WHERE status = 'active' GROUP BY cat ORDER BY c DESC");
  const topBrands = await db.all<{ brand: string; c: number }>("SELECT brand, COUNT(*) c FROM listings WHERE status = 'active' AND brand <> '' GROUP BY brand ORDER BY c DESC, brand ASC LIMIT 8");
  const topViewed = await db.all<{ id: string; title: string; n: number }>(
    `SELECT l.id, l.title, SUM(v.n) n FROM daily_views v JOIN listings l ON l.id = v.listing_id
     WHERE v.day >= ? GROUP BY l.id, l.title ORDER BY n DESC LIMIT 5`, [dayKey(now - 6 * DAY)]);

  const where: string[] = [];
  const params: unknown[] = [];
  if (status === 'active' || status === 'hidden') { where.push('l.status = ?'); params.push(status); }
  if (status === 'mine') where.push('l.is_seed = 0');
  if (q) {
    where.push('(lower(l.title) LIKE ? OR lower(l.seller) LIKE ? OR lower(l.city) LIKE ? OR lower(coalesce(l.contact, \'\')) LIKE ?)');
    const like = `%${q.replace(/[%_]/g, '')}%`;
    params.push(like, like, like, like);
  }
  const listings = await db.all(
    `SELECT l.id, l.title, l.cat, l.brand, l.price, l.city, l.seller, l.contact, l.status, l.is_seed, l.created_at,
            COALESCE((SELECT SUM(n) FROM daily_views v WHERE v.listing_id = l.id), 0) AS views,
            (SELECT COUNT(*) FROM reports r WHERE r.listing_id = l.id AND r.status = 'open') AS reports
     FROM listings l ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY l.created_at DESC LIMIT 150`, params);

  const reports = await db.all(
    `SELECT r.id, r.listing_id, r.reason, r.note, r.created_at, l.title, l.status AS listing_status
     FROM reports r LEFT JOIN listings l ON l.id = r.listing_id WHERE r.status = 'open' ORDER BY r.created_at DESC LIMIT 100`);

  return NextResponse.json({
    stats: { active, hidden, openReports, newToday, new7d, userTotal, views7d, days, byCat, topBrands, topViewed },
    listings, reports, db: db.kind,
  });
}

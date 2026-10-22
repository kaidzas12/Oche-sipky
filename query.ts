import { getDb, fold } from './db';
import { CAT_IDS, CONDS, WEIGHT_BINS, type Listing, type ListingsResponse, type PlayerInfo } from './types';
import { RANKING_DATE } from './seed';

type Filters = {
  cat?: string; q?: string; brands: string[]; player?: string; conds: string[];
  max?: number; retro: boolean; weights: string[]; tungs: number[]; ids: string[];
};

export function parseFilters(sp: URLSearchParams): Filters {
  const list = (k: string) => (sp.get(k) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const max = Number(sp.get('max'));
  return {
    cat: sp.get('cat') ?? undefined,
    q: (sp.get('q') ?? '').trim().slice(0, 80) || undefined,
    brands: list('brands'),
    player: sp.get('player') || undefined,
    conds: list('conds').filter((c) => (CONDS as readonly string[]).includes(c)),
    max: Number.isFinite(max) && max > 0 ? max : undefined,
    retro: sp.get('retro') === '1',
    weights: list('weights'),
    tungs: list('tungs').map(Number).filter(Number.isFinite),
    ids: list('ids').slice(0, 200),
  };
}

type Skip = 'cat' | 'brand' | 'player' | null;

function where(f: Filters, skip: Skip) {
  const c: string[] = ["status = 'active'"];
  const p: (string | number)[] = [];
  if (skip !== 'cat' && f.cat && (CAT_IDS as string[]).includes(f.cat)) { c.push('cat = ?'); p.push(f.cat); }
  if (skip !== 'brand' && f.brands.length) { c.push(`brand IN (${f.brands.map(() => '?').join(',')})`); p.push(...f.brands); }
  if (skip !== 'player' && f.player) { c.push('player = ?'); p.push(f.player); }
  if (f.conds.length) { c.push(`cond IN (${f.conds.map(() => '?').join(',')})`); p.push(...f.conds); }
  if (f.max) { c.push('price <= ?'); p.push(f.max); }
  if (f.retro) c.push('retro = 1');
  if (f.q) {
    for (const w of fold(f.q).split(/\s+/).filter(Boolean)) {
      c.push('search LIKE ?');
      p.push(`%${w.replace(/[%_]/g, '')}%`);
    }
  }
  const bins = WEIGHT_BINS.filter((b) => f.weights.includes(b.id));
  if (bins.length) {
    c.push('(' + bins.map(() => '(weight >= ? AND weight <= ?)').join(' OR ') + ')');
    bins.forEach((b) => p.push(b.lo, b.hi));
  }
  if (f.tungs.length) { c.push(`tung IN (${f.tungs.map(() => '?').join(',')})`); p.push(...f.tungs); }
  if (f.ids.length) { c.push(`id IN (${f.ids.map(() => '?').join(',')})`); p.push(...f.ids); }
  return { sql: c.length ? 'WHERE ' + c.join(' AND ') : '', params: p };
}

type Row = {
  id: string; title: string; cat: Listing['cat']; brand: string; price: number; cond: Listing['cond']; city: string;
  created_at: number | string; seller: string; contact: string | null; rating: number | null; reviews: number | null;
  descr: string; weight: number | null; tung: number | null; player: string | null; retro: number; kind: string | null;
  hue: number; has_photo: number;
};

export type { Row };
export function toListing(r: Row): Listing {
  return {
    id: r.id, title: r.title, cat: r.cat, brand: r.brand, price: r.price, cond: r.cond, city: r.city,
    daysAgo: Math.max(0, Math.floor((Date.now() - Number(r.created_at)) / 86400000)),
    seller: r.seller, contact: r.contact, rating: r.rating, reviews: r.reviews, desc: r.descr,
    weight: r.weight, tung: r.tung, player: r.player, retro: !!r.retro, kind: r.kind, hue: r.hue, hasPhoto: !!r.has_photo,
  };
}

export async function runQuery(sp: URLSearchParams): Promise<ListingsResponse> {
  const db = await getDb();
  const f = parseFilters(sp);
  const sort = sp.get('sort');
  const order = sort === 'asc' ? 'price ASC, created_at DESC' : sort === 'desc' ? 'price DESC, created_at DESC' : 'created_at DESC';

  const main = where(f, null);
  const items = (await db.all<Row>(`SELECT * FROM listings ${main.sql} ORDER BY ${order} LIMIT 200`, main.params)).map(toListing);
  const total = (await db.get<{ c: number }>(`SELECT COUNT(*) c FROM listings ${main.sql}`, main.params))?.c ?? 0;

  const wc = where(f, 'cat');
  const catCounts: Record<string, number> = {};
  let all = 0;
  for (const r of await db.all<{ cat: string; c: number }>(`SELECT cat, COUNT(*) c FROM listings ${wc.sql} GROUP BY cat`, wc.params)) {
    catCounts[r.cat] = r.c; all += r.c;
  }
  catCounts.all = all;

  const wb = where(f, 'brand');
  const bc = new Map<string, number>();
  for (const r of await db.all<{ brand: string; c: number }>(`SELECT brand, COUNT(*) c FROM listings ${wb.sql} GROUP BY brand`, wb.params)) bc.set(r.brand, r.c);
  const brands = (await db.all<{ name: string }>('SELECT name FROM brands'))
    .map((b) => ({ name: b.name, count: bc.get(b.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'sk'));

  const wp = where(f, 'player');
  const pc = new Map<string, number>();
  for (const r of await db.all<{ player: string; c: number }>(`SELECT player, COUNT(*) c FROM listings ${wp.sql} AND player IS NOT NULL GROUP BY player`, wp.params)) pc.set(r.player, r.c);
  const players = (await db.all<{ name: string; rank: number | null; grp: 'pdc' | 'legend' }>('SELECT name, rank, grp FROM players ORDER BY grp ASC, rank ASC, name ASC'))
    .map((p): PlayerInfo => ({ name: p.name, rank: p.rank, group: p.grp, count: pc.get(p.name) ?? 0 }));

  const maxPrice = (await db.get<{ m: number }>("SELECT COALESCE(MAX(price), 100) m FROM listings WHERE status = 'active'"))?.m ?? 100;
  return { items, total, catCounts, brands, players, maxPrice: Math.ceil(maxPrice / 10) * 10, rankingDate: RANKING_DATE };
}

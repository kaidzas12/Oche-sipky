import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb, fold, CAT_WORDS } from '../../../lib/db';
import { runQuery, toListing, type Row } from '../../../lib/query';
import { CAT_IDS, CONDS, TUNGS } from '../../../lib/types';
import { allow, clientId } from '../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(await runQuery(req.nextUrl.searchParams));
  } catch (e) {
    console.error('GET /api/listings', e);
    return NextResponse.json({ error: 'Chyba servera.' }, { status: 500 });
  }
}

const str = (v: unknown, min: number, max: number) => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length >= min && s.length <= max ? s : null;
};

export async function POST(req: NextRequest) {
  if (!allow(`add:${clientId(req)}`, 6, 3600_000)) {
    return NextResponse.json({ error: 'Pridal si veľa inzerátov za krátky čas. Skús to o chvíľu.' }, { status: 429 });
  }
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Neplatné dáta.' }, { status: 400 }); }

  const title = str(b.title, 3, 80);
  const city = str(b.city, 2, 40);
  const seller = str(b.seller, 2, 30);
  const contact = b.contact ? str(b.contact, 3, 80) : null;
  const brand = b.brand ? str(b.brand, 1, 40) ?? '' : '';
  const desc = b.desc ? str(b.desc, 0, 600) ?? '' : '';
  const price = Number(b.price);
  const cat = String(b.cat);
  const cond = String(b.cond);
  if (!title) return NextResponse.json({ error: 'Názov musí mať 3 až 80 znakov.' }, { status: 400 });
  if (!city) return NextResponse.json({ error: 'Zadaj mesto.' }, { status: 400 });
  if (!seller) return NextResponse.json({ error: 'Zadaj prezývku (2 až 30 znakov).' }, { status: 400 });
  if (!contact) return NextResponse.json({ error: 'Zadaj kontakt (e-mail alebo telefón), ktorý uvidia záujemcovia.' }, { status: 400 });
  if (!Number.isInteger(price) || price < 1 || price > 9999) return NextResponse.json({ error: 'Cena musí byť celé číslo od 1 do 9999.' }, { status: 400 });
  if (!(CAT_IDS as string[]).includes(cat)) return NextResponse.json({ error: 'Neplatná kategória.' }, { status: 400 });
  if (!(CONDS as readonly string[]).includes(cond)) return NextResponse.json({ error: 'Neplatný stav.' }, { status: 400 });

  let weight: number | null = null, tung: number | null = null, player: string | null = null;
  if (cat === 'darts') {
    if (b.weight !== '' && b.weight != null) {
      weight = Number(b.weight);
      if (!(weight >= 10 && weight <= 50)) return NextResponse.json({ error: 'Gramáž musí byť 10 až 50 g.' }, { status: 400 });
    }
    if (b.tung !== '' && b.tung != null) {
      tung = Number(b.tung);
      if (!(TUNGS as readonly number[]).includes(tung)) return NextResponse.json({ error: 'Neplatný podiel volfrámu.' }, { status: 400 });
    }
    player = b.player ? str(b.player, 1, 40) : null;
  }

  let photo: Buffer | null = null;
  if (typeof b.photo === 'string' && b.photo) {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(b.photo);
    if (!m || m[1].length > 700_000) return NextResponse.json({ error: 'Fotka musí byť JPEG do 500 kB.' }, { status: 400 });
    photo = Buffer.from(m[1], 'base64');
  }

  const id = 'u' + crypto.randomBytes(6).toString('hex');
  const token = crypto.randomBytes(16).toString('hex');
  try {
    const db = await getDb();
    if (photo) await db.run('INSERT INTO photos(id, mime, data) VALUES (?, ?, ?)', [id, 'image/jpeg', photo]);
    if (brand) await db.run('INSERT INTO brands(name) VALUES (?) ON CONFLICT DO NOTHING', [brand]);
    await db.run(
      `INSERT INTO listings (id,title,cat,brand,price,cond,city,created_at,seller,contact,rating,reviews,descr,weight,tung,player,retro,kind,hue,has_photo,token,is_seed,search,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,NULL,NULL,?,?,?,?,?,NULL,?,?,?,0,?,'active')`,
      [id, title, cat, brand, price, cond, city, Date.now(), seller, contact, desc, weight, tung, player,
        b.retro ? 1 : 0, crypto.randomInt(0, 360), photo ? 1 : 0, token,
        fold([title, brand, player ?? '', desc, city, CAT_WORDS[cat]].join(' '))],
    );
    const row = await db.get<Row>('SELECT * FROM listings WHERE id = ?', [id]);
    return NextResponse.json({ item: toListing(row!), token }, { status: 201 });
  } catch (e) {
    console.error('POST /api/listings', e);
    return NextResponse.json({ error: 'Inzerát sa nepodarilo uložiť.' }, { status: 500 });
  }
}

import fs from 'node:fs';
import path from 'node:path';
import { Pool, types } from 'pg';
import { BRANDS, PLAYERS, LISTINGS } from './seed';

/** Text bez diakritiky a malými písmenami, aby hľadanie "terc" našlo "terč". */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Slová kategórie, aby hľadanie "sipky littler" našlo aj inzerát bez slova šípky v názve. */
export const CAT_WORDS: Record<string, string> = {
  darts: 'sipky sipka darts', board: 'terc terce board', surround: 'surround ochrana steny', light: 'osvetlenie svetlo lampa led',
  acc: 'prislusenstvo letky driek puzdro podlozka', wear: 'oblecenie dres mikina',
};

/**
 * Jednotné rozhranie nad dvoma databázami:
 *  - PostgreSQL, ak je nastavená premenná DATABASE_URL (server),
 *  - SQLite v súbore data/oche.db, ak nie je (lokálny vývoj).
 * SQL sa píše so znakmi `?` ako parametrami, pre PostgreSQL sa prepíšu na $1, $2, ...
 */
export type Db = {
  kind: 'pg' | 'sqlite';
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<number>;
  exec(sql: string): Promise<void>;
};

function pgAdapter(url: string): Db {
  types.setTypeParser(20, (v) => parseInt(v, 10)); // bigint ako číslo
  const pool = new Pool({
    connectionString: url,
    max: 10,
    ssl: process.env.PGSSL === '1' ? { rejectUnauthorized: false } : undefined,
  });
  const q = (sql: string) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };
  return {
    kind: 'pg',
    async all<T>(sql: string, params: unknown[] = []) { return (await pool.query(q(sql), params)).rows as T[]; },
    async get<T>(sql: string, params: unknown[] = []) { return (await pool.query(q(sql), params)).rows[0] as T | undefined; },
    async run(sql: string, params: unknown[] = []) { return (await pool.query(q(sql), params)).rowCount ?? 0; },
    async exec(sql: string) { await pool.query(sql); },
  };
}

function sqliteAdapter(): Db {
  const dir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  // Vstavaná SQLite z Node.js (22.5+). Načíta sa cez getBuiltinModule, aby ju bundler nechal na pokoji.
  const mod = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
  const d = new mod.DatabaseSync(path.join(dir, 'oche.db'));
  d.exec('PRAGMA journal_mode = WAL');
  return {
    kind: 'sqlite',
    async all<T>(sql: string, params: unknown[] = []) { return d.prepare(sql).all(...(params as never[])) as unknown as T[]; },
    async get<T>(sql: string, params: unknown[] = []) { return d.prepare(sql).get(...(params as never[])) as unknown as T | undefined; },
    async run(sql: string, params: unknown[] = []) { return Number(d.prepare(sql).run(...(params as never[])).changes); },
    async exec(sql: string) { d.exec(sql); },
  };
}

const schema = (blob: string) => `
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  cat TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  cond TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  seller TEXT NOT NULL,
  contact TEXT,
  rating DOUBLE PRECISION,
  reviews INTEGER,
  descr TEXT NOT NULL DEFAULT '',
  weight DOUBLE PRECISION,
  tung INTEGER,
  player TEXT,
  retro INTEGER NOT NULL DEFAULT 0,
  kind TEXT,
  hue INTEGER NOT NULL DEFAULT 150,
  has_photo INTEGER NOT NULL DEFAULT 0,
  token TEXT,
  is_seed INTEGER NOT NULL DEFAULT 0,
  search TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_listings_cat ON listings(cat);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_player ON listings(player);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at);
CREATE TABLE IF NOT EXISTS players (name TEXT PRIMARY KEY, rank INTEGER, grp TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS brands (name TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data ${blob} NOT NULL);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  reporter TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);
CREATE TABLE IF NOT EXISTS daily_views (
  day TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, listing_id)
);
`;

async function addColumn(db: Db, table: string, col: string, ddl: string) {
  try { await db.get(`SELECT ${col} FROM ${table} LIMIT 1`); }
  catch { await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`); }
}

async function seedReference(db: Db) {
  for (const b of BRANDS) await db.run('INSERT INTO brands(name) VALUES (?) ON CONFLICT DO NOTHING', [b]);
  for (const p of PLAYERS)
    await db.run('INSERT INTO players(name, rank, grp) VALUES (?, ?, ?) ON CONFLICT (name) DO UPDATE SET rank = excluded.rank, grp = excluded.grp', [p.name, p.rank, p.group]);
}

async function seedDemo(db: Db) {
  const now = Date.now();
  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    await db.run(
      `INSERT INTO listings (id,title,cat,brand,price,cond,city,created_at,seller,contact,rating,reviews,descr,weight,tung,player,retro,kind,hue,has_photo,token,is_seed,search,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,NULL,1,?,'active') ON CONFLICT DO NOTHING`,
      [
        `s${i + 1}`, l.title, l.cat, l.brand, l.price, l.cond, l.city, now - l.days * 86400000 - i * 60000, l.seller,
        `${l.seller}@example.sk`, l.rating ?? 4.8, l.reviews ?? 10, l.desc ?? '', l.weight ?? null, l.tung ?? null,
        l.player ?? null, l.retro ? 1 : 0, l.kind ?? null, l.hue ?? (i * 47) % 360,
        fold([l.title, l.brand, l.player ?? '', l.desc ?? '', l.city, CAT_WORDS[l.cat]].join(' ')),
      ],
    );
  }
}

async function init(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  const db = url ? pgAdapter(url) : sqliteAdapter();
  await db.exec(schema(db.kind === 'pg' ? 'BYTEA' : 'BLOB'));
  await addColumn(db, 'listings', 'status', "TEXT NOT NULL DEFAULT 'active'");
  await seedReference(db);
  const n = await db.get<{ c: number }>('SELECT COUNT(*) c FROM listings');
  if ((n?.c ?? 0) === 0 && process.env.SEED_DEMO !== '0') await seedDemo(db);
  return db;
}

declare global {
  // eslint-disable-next-line no-var
  var __oche_db: Promise<Db> | undefined;
}

export function getDb(): Promise<Db> {
  if (!globalThis.__oche_db) {
    globalThis.__oche_db = init().catch((e) => { globalThis.__oche_db = undefined; throw e; });
  }
  return globalThis.__oche_db;
}

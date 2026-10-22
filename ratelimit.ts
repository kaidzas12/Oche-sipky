import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

const hits = new Map<string, number[]>();

/** Vráti true, ak je akcia povolená. Pamäť je len v jednom procese, pre začiatok to stačí. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { hits.set(key, arr); return false; }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}

/** Anonymný odtlačok klienta (IP sa neukladá v čitateľnej podobe). */
export function clientId(req: NextRequest): string {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  const salt = process.env.ADMIN_PASSWORD ?? 'oche';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16);
}

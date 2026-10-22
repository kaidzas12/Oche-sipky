import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'oche_admin';

function token(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHmac('sha256', pw).update('oche-admin-v1').digest('hex');
}

export const adminEnabled = () => !!process.env.ADMIN_PASSWORD;

export function sessionValue(): string | null { return token(); }

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(pw).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isAdmin(req: NextRequest): boolean {
  const t = token();
  const c = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!t || !c || c.length !== t.length) return false;
  return crypto.timingSafeEqual(Buffer.from(c), Buffer.from(t));
}

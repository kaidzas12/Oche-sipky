import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminEnabled, checkPassword, sessionValue } from '../../../../lib/auth';
import { allow, clientId } from '../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!adminEnabled()) return NextResponse.json({ error: 'Admin je vypnutý. Nastav premennú ADMIN_PASSWORD.' }, { status: 503 });
  if (!allow(`login:${clientId(req)}`, 8, 15 * 60_000)) return NextResponse.json({ error: 'Priveľa pokusov. Skús o 15 minút.' }, { status: 429 });
  let b: { password?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Neplatné dáta.' }, { status: 400 }); }
  if (!checkPassword(String(b.password ?? ''))) return NextResponse.json({ error: 'Nesprávne heslo.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionValue()!, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12,
  });
  return res;
}

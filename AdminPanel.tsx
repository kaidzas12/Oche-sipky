'use client';
import { useCallback, useEffect, useState } from 'react';
import { CATS } from '../lib/types';

type Stats = {
  active: number; hidden: number; openReports: number; newToday: number; new7d: number; userTotal: number; views7d: number;
  days: { day: string; listings: number; views: number }[];
  byCat: { cat: string; c: number }[]; topBrands: { brand: string; c: number }[]; topViewed: { id: string; title: string; n: number }[];
};
type Row = { id: string; title: string; cat: string; brand: string; price: number; city: string; seller: string; contact: string | null; status: string; is_seed: number; created_at: number | string; views: number; reports: number };
type Rep = { id: string; listing_id: string; reason: string; note: string; created_at: number | string; title: string | null; listing_status: string | null };
type Data = { stats: Stats; listings: Row[]; reports: Rep[]; db: string };

const REASON: Record<string, string> = { spam: 'Spam', podvod: 'Podvod', 'zakazany-tovar': 'Zakázaný tovar', 'nespravna-kategoria': 'Nesprávna kategória', iny: 'Iný dôvod' };
const catName = (id: string) => CATS.find((c) => c.id === id)?.label ?? id;
const when = (t: number | string) => new Date(Number(t)).toLocaleString('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

function Bars({ days }: { days: Stats['days'] }) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.listings, d.views)));
  const W = 560, H = 140, pad = 22, bw = (W - pad * 2) / days.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Inzeráty a zobrazenia za 14 dní" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad} x2={W - pad} y1={H - f * (H - 10)} y2={H - f * (H - 10)} stroke="var(--line)" />
          <text x={pad - 4} y={H - f * (H - 10) + 3} textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="var(--f-mono)">{Math.round(max * f)}</text>
        </g>
      ))}
      {days.map((d, i) => {
        const x = pad + i * bw;
        const vh = (d.views / max) * (H - 10), lh = (d.listings / max) * (H - 10);
        return (
          <g key={d.day}>
            <rect x={x + 3} y={H - vh} width={bw / 2 - 3} height={vh} fill="var(--ink)" opacity=".85"><title>{`${d.day}: ${d.views} zobrazení`}</title></rect>
            <rect x={x + bw / 2} y={H - lh} width={bw / 2 - 3} height={lh} fill="var(--accent)"><title>{`${d.day}: ${d.listings} nových inzerátov`}</title></rect>
            {(i % 2 === 1 || days.length < 8) && <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="var(--f-mono)">{d.day.slice(8)}.{d.day.slice(5, 7)}.</text>}
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [armed, setArmed] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ status, q });
    const r = await fetch(`/api/admin/data?${p}`, { cache: 'no-store' });
    if (r.status === 401) { setAuthed(false); return; }
    if (!r.ok) { setErr('Dáta sa nepodarilo načítať.'); return; }
    setData(await r.json()); setAuthed(true); setErr('');
  }, [status, q]);

  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error ?? 'Prihlásenie zlyhalo.'); return; }
    setPw(''); await load();
  };
  const act = async (id: string, action: 'hide' | 'show' | 'delete') => {
    if (action === 'delete' && armed !== id) { setArmed(id); return; }
    setArmed('');
    await fetch(`/api/admin/listings/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    await load();
  };
  const dismiss = async (id: string) => { await fetch(`/api/admin/reports/${id}`, { method: 'POST' }); await load(); };
  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); setData(null); setAuthed(false); };

  if (authed === null) return <div className="wrap"><p className="foot">Načítavam…</p></div>;

  if (!authed) {
    return (
      <div className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}>
        <div className="logo"><b>OCHE<i>.</i></b><span>admin</span></div>
        <form onSubmit={login} className="add" style={{ marginTop: 20, gridTemplateColumns: '1fr' }}>
          <label>Heslo
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required autoComplete="current-password" />
          </label>
          {err && <div className="err" role="alert">{err}</div>}
          <div className="row"><button className="btn primary" type="submit" disabled={busy}>Prihlásiť</button><a className="btn" href="/">Späť na bazár</a></div>
        </form>
      </div>
    );
  }

  const s = data?.stats;
  return (
    <div className="wrap">
      <header className="top">
        <div className="logo"><b>OCHE<i>.</i></b><span>admin · databáza {data?.db === 'pg' ? 'PostgreSQL' : 'SQLite (lokálna)'}</span></div>
        <div className="actions"><a className="btn" href="/">Bazár</a><button className="btn" type="button" onClick={logout}>Odhlásiť</button></div>
      </header>
      {err && <div className="err" role="alert">{err}</div>}

      {s && (
        <>
          <div className="stats">
            <div><b>{s.active}</b><span>aktívnych inzerátov</span></div>
            <div><b>{s.userTotal}</b><span>pridali používatelia</span></div>
            <div><b>{s.newToday}</b><span>nových za 24 h</span></div>
            <div><b>{s.new7d}</b><span>nových za 7 dní</span></div>
            <div><b>{s.views7d}</b><span>zobrazení za 7 dní</span></div>
            <div className={s.openReports ? 'warn' : ''}><b>{s.openReports}</b><span>nahlásení na vybavenie</span></div>
            <div><b>{s.hidden}</b><span>skrytých inzerátov</span></div>
          </div>

          <div className="panels">
            <section className="panel wide">
              <h2>Posledných 14 dní</h2>
              <Bars days={s.days} />
              <p className="legend"><i style={{ background: 'var(--ink)' }} /> zobrazenia <i style={{ background: 'var(--accent)' }} /> nové inzeráty</p>
            </section>
            <section className="panel">
              <h2>Podľa kategórie</h2>
              <ul className="mini">{s.byCat.map((c) => <li key={c.cat}><span>{catName(c.cat)}</span><b>{c.c}</b></li>)}</ul>
              <h2 style={{ marginTop: 14 }}>Top značky</h2>
              <ul className="mini">{s.topBrands.map((c) => <li key={c.brand}><span>{c.brand}</span><b>{c.c}</b></li>)}</ul>
            </section>
            <section className="panel">
              <h2>Najsledovanejšie (7 dní)</h2>
              {s.topViewed.length === 0 ? <p className="hint">Zobrazenia sa začnú počítať, keď si niekto otvorí detail inzerátu.</p>
                : <ul className="mini">{s.topViewed.map((c) => <li key={c.id}><span>{c.title}</span><b>{c.n}</b></li>)}</ul>}
            </section>
          </div>
        </>
      )}

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Nahlásenia ({data?.reports.length ?? 0})</h2>
        {data && data.reports.length === 0 && <p className="hint">Žiadne nahlásenia na vybavenie.</p>}
        <ul className="rows">
          {data?.reports.map((r) => (
            <li key={r.id}>
              <div className="grow">
                <b>{r.title ?? 'Zmazaný inzerát'}</b>
                <span className="spec"> · {REASON[r.reason] ?? r.reason} · {when(r.created_at)}{r.listing_status === 'hidden' ? ' · skrytý' : ''}</span>
                {r.note && <div className="hint" style={{ margin: '2px 0 0' }}>„{r.note}“</div>}
              </div>
              <div className="row">
                {r.title && r.listing_status !== 'hidden' && <button className="btn" type="button" onClick={() => act(r.listing_id, 'hide')}>Skryť inzerát</button>}
                <button className="btn" type="button" onClick={() => dismiss(r.id)}>Je v poriadku</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="bar" style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>Inzeráty</h2>
          <div className="row">
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Stav" style={{ width: 'auto' }}>
              <option value="all">Všetky</option><option value="mine">Len od používateľov</option><option value="active">Aktívne</option><option value="hidden">Skryté</option>
            </select>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hľadať názov, predajcu, mesto, kontakt" aria-label="Hľadať" style={{ width: 'min(300px, 100%)' }} />
          </div>
        </div>
        <ul className="rows">
          {data?.listings.map((l) => (
            <li key={l.id}>
              <div className="grow">
                <b>{l.title}</b> <span className={'pill ' + l.status}>{l.status === 'active' ? 'aktívny' : 'skrytý'}</span>
                {l.is_seed ? <span className="pill">ukážka</span> : null}
                {l.reports > 0 && <span className="pill bad">{l.reports}× nahlásený</span>}
                <div className="spec">{catName(l.cat)} · {l.price} € · {l.city} · {l.seller}{l.contact ? ` · ${l.contact}` : ''} · {l.views} zobrazení · {when(l.created_at)}</div>
              </div>
              <div className="row">
                {l.status === 'active'
                  ? <button className="btn" type="button" onClick={() => act(l.id, 'hide')}>Skryť</button>
                  : <button className="btn" type="button" onClick={() => act(l.id, 'show')}>Zobraziť</button>}
                <button className="btn" type="button" onClick={() => act(l.id, 'delete')}>{armed === l.id ? 'Naozaj? Klikni znova' : 'Zmazať'}</button>
              </div>
            </li>
          ))}
        </ul>
        {data && data.listings.length === 0 && <p className="hint">Nič sa nenašlo.</p>}
      </section>
    </div>
  );
}

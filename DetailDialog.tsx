'use client';
import { Fragment, useEffect, useState } from 'react';
import type { Listing } from '@/lib/types';
import { CATS } from '@/lib/types';
import Thumb from './Thumb';

const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const ago = (d: number) => (d === 0 ? 'dnes' : d === 1 ? 'včera' : `pred ${d} dňami`);
const num = (n: number) => String(n).replace('.', ',');

export default function DetailDialog({
  it, mine, isFav, onFav, onDelete, onClose, toast,
}: {
  it: Listing; mine: boolean; isFav: boolean; onFav: () => void; onDelete: () => Promise<void>; onClose: () => void; toast: (m: string) => void;
}) {
  const [armed, setArmed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  // započíta zobrazenie detailu (server si ho pohlídá raz za 30 minút na návštevníka)
  useEffect(() => {
    if (mine) return;
    fetch(`/api/listings/${it.id}/view`, { method: 'POST' }).catch(() => {});
  }, [it.id, mine]);

  const sendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setSending(true);
    try {
      const r = await fetch(`/api/listings/${it.id}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, note }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { toast(j.error ?? 'Nahlásenie sa nepodarilo odoslať.'); return; }
      toast('Ďakujeme, nahlásenie sme prijali.');
      setReporting(false); setReason(''); setNote('');
    } catch { toast('Spojenie so serverom zlyhalo.'); }
    finally { setSending(false); }
  };
  const rows: [string, string][] = [
    ['Kategória', CATS.find((c) => c.id === it.cat)?.label ?? ''],
    ['Značka', it.brand],
    ['Gramáž', it.weight != null ? `${num(it.weight)} g` : ''],
    ['Volfrám', it.tung ? `${it.tung} %` : ''],
    ['Hráč', it.player ?? ''],
    ['Stav', it.cond],
    ['Mesto', it.city],
    ['Pridané', ago(it.daysAgo)],
  ];
  const copy = async () => {
    try { await navigator.clipboard.writeText(it.contact ?? ''); toast('Kontakt je skopírovaný.'); }
    catch { toast('Kontakt si označ a skopíruj ručne.'); }
  };
  return (
    <div className="dlg" style={{ ['--h' as string]: it.hue }}>
      <div className="dlg-head">
        <h2>{it.title}</h2>
        <button className="x" type="button" onClick={onClose} aria-label="Zavrieť">×</button>
      </div>
      <div className="detail">
        <div><div className="thumb"><Thumb it={it} /></div></div>
        <div>
          <div className="price">{eur.format(it.price)}</div>
          <dl className="specs">
            {rows.filter((r) => r[1]).map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>))}
          </dl>
          {it.desc && <p style={{ margin: '0 0 12px' }}>{it.desc}</p>}
          <div className="seller">
            <span><b>{it.seller}</b></span>
            <span className="spec">{it.rating ? `★ ${num(it.rating)} · ${it.reviews} hodnotení` : 'nový predajca'}</span>
          </div>
          <div className="msg">
            <span className="hint" style={{ margin: 0 }}>Kontakt na predajcu</span>
            <div className="row">
              <code className="chip" style={{ userSelect: 'all' }}>{it.contact ?? 'neuvedený'}</code>
              {it.contact && <button className="btn" type="button" onClick={copy}>Kopírovať</button>}
            </div>
            <div className="row">
              <button className="btn" type="button" aria-pressed={isFav} onClick={onFav}>{isFav ? 'V obľúbených' : 'Uložiť do obľúbených'}</button>
              {!mine && <button className="btn" type="button" onClick={() => setReporting(!reporting)} aria-expanded={reporting}>Nahlásiť inzerát</button>}
              {mine && (
                <button
                  className="btn"
                  type="button"
                  onClick={async () => { if (!armed) { setArmed(true); return; } await onDelete(); }}
                >
                  {armed ? 'Naozaj zmazať? Klikni znova' : 'Zmazať inzerát'}
                </button>
              )}
            </div>
            {reporting && !mine && (
              <form className="msg" onSubmit={sendReport} style={{ marginTop: 4 }}>
                <label className="hint" htmlFor="rep-reason" style={{ margin: 0 }}>Prečo inzerát nahlasuješ?</label>
                <select id="rep-reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
                  <option value="">Vyber dôvod</option>
                  <option value="spam">Spam alebo reklama</option>
                  <option value="podvod">Podozrenie na podvod</option>
                  <option value="zakazany-tovar">Zakázaný tovar</option>
                  <option value="nespravna-kategoria">Nesprávna kategória</option>
                  <option value="iny">Iný dôvod</option>
                </select>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Doplň, čo je zlé (nepovinné)" aria-label="Poznámka" />
                <div className="row"><button className="btn primary" type="submit" disabled={sending || !reason}>{sending ? 'Odosielam…' : 'Odoslať nahlásenie'}</button></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

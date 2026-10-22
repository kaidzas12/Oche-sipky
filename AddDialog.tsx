'use client';
import { useState } from 'react';
import type { Listing } from '@/lib/types';
import { CONDS, TUNGS } from '@/lib/types';

async function toJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  let q = 0.8;
  let out = c.toDataURL('image/jpeg', q);
  while (out.length > 600_000 && q > 0.35) { q -= 0.15; out = c.toDataURL('image/jpeg', q); }
  return out;
}

export default function AddDialog({
  playerNames, brandNames, onClose, onCreated,
}: {
  playerNames: string[]; brandNames: string[]; onClose: () => void; onCreated: (item: Listing, token: string) => void;
}) {
  const [cat, setCat] = useState('darts');
  const [photo, setPhoto] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.retro = fd.get('retro') === 'on';
    body.price = Number(body.price);
    if (photo) body.photo = photo;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error ?? 'Inzerát sa nepodarilo uložiť.'); return; }
      onCreated(j.item, j.token);
    } catch { setErr('Spojenie so serverom zlyhalo. Skús to znova.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="dlg">
      <div className="dlg-head">
        <h2>Nový inzerát</h2>
        <button className="x" type="button" onClick={onClose} aria-label="Zavrieť">×</button>
      </div>
      <form className="add" onSubmit={submit}>
        <label className="full">Názov
          <input type="text" name="title" required minLength={3} maxLength={80} placeholder="napr. Target Luke Littler 95 %, 23 g" />
        </label>
        <label>Kategória
          <select name="cat" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="darts">Šípky</option><option value="board">Terče</option><option value="surround">Surround</option>
            <option value="light">Osvetlenie</option><option value="acc">Príslušenstvo</option><option value="wear">Oblečenie</option>
          </select>
        </label>
        <label>Cena (€)
          <input type="number" name="price" required min={1} max={9999} step={1} inputMode="numeric" />
        </label>
        <label>Stav
          <select name="cond" defaultValue="Dobrý">{CONDS.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label>Mesto
          <input type="text" name="city" required maxLength={40} placeholder="napr. Trnava" />
        </label>
        <label>Značka
          <input type="text" name="brand" maxLength={40} list="brandList" placeholder="Target, Winmau, Harrows…" />
          <datalist id="brandList">{brandNames.map((b) => <option key={b} value={b} />)}</datalist>
        </label>
        {cat === 'darts' && (
          <>
            <label>Gramáž (g)
              <input type="number" name="weight" min={10} max={50} step={0.5} inputMode="decimal" />
            </label>
            <label>Volfrám
              <select name="tung" defaultValue=""><option value="">neviem / iný</option>{TUNGS.map((t) => <option key={t} value={t}>{t} %</option>)}</select>
            </label>
            <label>Hráč (signature šípky)
              <input type="text" name="player" maxLength={40} list="playerList" placeholder="nechaj prázdne, ak nie sú signature" />
              <datalist id="playerList">{playerNames.map((p) => <option key={p} value={p} />)}</datalist>
            </label>
          </>
        )}
        <label className="check full"><input type="checkbox" name="retro" /> Staršie alebo retro kúsok</label>
        <label className="full">Popis
          <textarea name="desc" maxLength={600} placeholder="Stav, hrot (steel / soft), v akom balení, dôvod predaja…" />
        </label>
        <label>Tvoja prezývka
          <input type="text" name="seller" required minLength={2} maxLength={30} placeholder="napr. oche_ba" />
        </label>
        <label>Kontakt (e-mail alebo telefón)
          <input type="text" name="contact" required maxLength={80} placeholder="Zobrazí sa pri inzeráte" />
        </label>
        <label className="full">Fotka (nepovinná)
          <input
            type="file" accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) { setPhoto(''); return; }
              try { setPhoto(await toJpeg(f)); } catch { setErr('Fotku sa nepodarilo načítať.'); }
            }}
          />
          {photo && <img className="photo-prev" src={photo} alt="Náhľad fotky" />}
        </label>
        {err && <div className="err full" role="alert">{err}</div>}
        <div className="row full">
          <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Ukladám…' : 'Zverejniť'}</button>
          <button className="btn" type="button" onClick={onClose}>Zrušiť</button>
        </div>
      </form>
    </div>
  );
}

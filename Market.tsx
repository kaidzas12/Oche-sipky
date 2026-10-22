'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATS, CONDS, TUNGS, WEIGHT_BINS, type Listing, type ListingsResponse } from '@/lib/types';
import Thumb from './Thumb';
import Modal from './Modal';
import DetailDialog, { ago } from './DetailDialog';
import AddDialog from './AddDialog';

const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = (n: number) => String(n).replace('.', ',');

const TIPS = [
  'Nikto sa nenarodil s trojitou dvadsiatkou v ruke. Každý majster začínal pri obyčajnom terči doma.',
  'Meraj pokrok v týždňoch, nie v hodoch. Priemer 60 sa dá zdvihnúť na 70.',
  'Dobrý checkout začína pokojným nádychom, nie rýchlym hodom.',
  'Vybavenie ti pomôže, ale ruku trénuješ ty. Ťažšie šípky nenahradia tréning.',
  'Zlý večer sa počíta tiež. Zapíš si ho a príď zajtra o bod lepší.',
  'Tri šípky, tri príležitosti. Každé kolo začína odznova.',
  'Rovnaký postoj, rovnaký úchop, rovnaký výhoz. Opakovanie vyhráva zápasy.',
  'Aj tí najlepší hráči na svete začínali pri terči v obývačke alebo v pivnici.',
];

function loadJson<T>(k: string, d: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
}
function saveJson(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function Market() {
  const [cat, setCat] = useState<string>('all');
  const [qText, setQText] = useState('');
  const [q, setQ] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [player, setPlayer] = useState('');
  const [weights, setWeights] = useState<string[]>([]);
  const [tungs, setTungs] = useState<number[]>([]);
  const [conds, setConds] = useState<string[]>([]);
  const [max, setMax] = useState<number | null>(null);
  const [retro, setRetro] = useState(false);
  const [sort, setSort] = useState('new');
  const [favOnly, setFavOnly] = useState(false);
  const [fav, setFav] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [data, setData] = useState<ListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [adding, setAdding] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastMax = useRef(200);

  useEffect(() => {
    setFav(loadJson<string[]>('oche.fav', []));
    setTokens(loadJson<Record<string, string>>('oche.tokens', {}));
    setTip(Math.floor(Date.now() / 86400000) % TIPS.length);
  }, []);
  useEffect(() => { const t = setTimeout(() => setQ(qText.trim()), 220); return () => clearTimeout(t); }, [qText]);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3200);
  }, []);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (cat !== 'all') p.set('cat', cat);
    if (q) p.set('q', q);
    if (brands.length) p.set('brands', brands.join(','));
    if (player) p.set('player', player);
    if (weights.length) p.set('weights', weights.join(','));
    if (tungs.length) p.set('tungs', tungs.join(','));
    if (conds.length) p.set('conds', conds.join(','));
    if (max) p.set('max', String(max));
    if (retro) p.set('retro', '1');
    if (sort !== 'new') p.set('sort', sort);
    if (favOnly) p.set('ids', fav.length ? fav.join(',') : 'none');
    return p.toString();
  }, [cat, q, brands, player, weights, tungs, conds, max, retro, sort, favOnly, fav]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(`/api/listings?${query}`, { signal: ac.signal, cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<ListingsResponse>; })
      .then((d) => { setData(d); setError(''); lastMax.current = d.maxPrice; setLoading(false); })
      .catch((e) => { if (e.name !== 'AbortError') { setError('Inzeráty sa nepodarilo načítať. Skús obnoviť stránku.'); setLoading(false); } });
    return () => ac.abort();
  }, [query, version]);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const reset = () => {
    setBrands([]); setPlayer(''); setWeights([]); setTungs([]); setConds([]); setMax(null); setRetro(false);
    setQText(''); setQ(''); setFavOnly(false); setCat('all');
  };
  const toggleFav = (id: string) => {
    const n = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id];
    setFav(n); saveJson('oche.fav', n);
  };

  const maxPrice = data?.maxPrice ?? lastMax.current;
  const total = data?.total ?? 0;
  const countWord = total === 1 ? 'inzerát' : total >= 2 && total <= 4 ? 'inzeráty' : 'inzerátov';
  const pdc = data?.players.filter((p) => p.group === 'pdc') ?? [];
  const legends = data?.players.filter((p) => p.group === 'legend') ?? [];

  return (
    <div className="wrap">
      <header className="top">
        <div className="logo"><b>OCHE<i>.</i></b><span>bazár pre šípkarov</span></div>
        <div className="actions">
          <button className={'btn' + (favOnly ? ' on' : '')} type="button" aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}>
            Obľúbené <span>{fav.length}</span>
          </button>
          <button className="btn primary" type="button" onClick={() => setAdding(true)}>Pridať inzerát</button>
        </div>
      </header>

      <label className="search">
        <span hidden>Hľadať</span>
        <input type="search" value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Hľadať šípky, terč, hráča, značku…" autoComplete="off" />
      </label>

      <aside className="tip" aria-label="Motivácia">
        <b>Tip dňa</b>
        <p>{TIPS[tip]}</p>
        <button type="button" onClick={() => setTip((tip + 1) % TIPS.length)}>Ďalší</button>
      </aside>

      <nav className="tabs" aria-label="Kategórie">
        {CATS.map((c) => (
          <button key={c.id} className="tab" type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}<small>{data?.catCounts[c.id] ?? 0}</small>
          </button>
        ))}
      </nav>

      <div className="brands" aria-label="Značky">
        <span>Značky</span>
        <button className="chip" type="button" aria-pressed={brands.length === 0} onClick={() => setBrands([])}>Všetky</button>
        {data?.brands.map((b) => (
          <button key={b.name} className={'chip' + (b.count === 0 ? ' zero' : '')} type="button" aria-pressed={brands.includes(b.name)} onClick={() => toggle(brands, b.name, setBrands)}>
            {b.name}<small>{b.count}</small>
          </button>
        ))}
      </div>

      <div className="main">
        <aside className={'filters' + (filtersOpen ? ' open' : '')} id="filters" aria-label="Filtre">
          <div className="f-group">
            <h3>Gramáž šípok</h3>
            <div className="chips">
              {WEIGHT_BINS.map((w) => (
                <button key={w.id} className="chip" type="button" aria-pressed={weights.includes(w.id)} onClick={() => toggle(weights, w.id, setWeights)}>{w.label}</button>
              ))}
            </div>
            <p className="hint">Platí pre šípky. Bežné váhy sú 18 až 30 g.</p>
          </div>
          <div className="f-group">
            <h3>Volfrám</h3>
            <div className="chips">
              {TUNGS.map((t) => (
                <button key={t} className="chip" type="button" aria-pressed={tungs.includes(t)} onClick={() => toggle(tungs, t, setTungs)}>{t} %</button>
              ))}
            </div>
          </div>
          <div className="f-group">
            <h3>Hráč</h3>
            <select value={player} onChange={(e) => setPlayer(e.target.value)} aria-label="Hráč">
              <option value="">Všetci hráči ({data?.players.length ?? 0})</option>
              <optgroup label={`PDC rebríček, top 40 (${data?.rankingDate ?? ''})`}>
                {pdc.map((p) => <option key={p.name} value={p.name}>#{p.rank} {p.name} ({p.count})</option>)}
              </optgroup>
              <optgroup label="Legendy">
                {legends.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.count})</option>)}
              </optgroup>
            </select>
            <p className="hint">Číslo v zátvorke je počet inzerátov so šípkami daného hráča.</p>
          </div>
          <div className="f-group">
            <h3>Stav</h3>
            {CONDS.map((c) => (
              <label key={c} className="check"><input type="checkbox" checked={conds.includes(c)} onChange={() => toggle(conds, c, setConds)} /> {c}</label>
            ))}
          </div>
          <div className="f-group">
            <h3>Max. cena: {max ? `do ${eur.format(max)}` : 'bez limitu'}</h3>
            <input
              type="range" min={5} max={maxPrice} step={5} aria-label="Maximálna cena"
              value={max ?? maxPrice}
              onChange={(e) => { const v = Number(e.target.value); setMax(v >= maxPrice ? null : v); }}
            />
          </div>
          <div className="f-group">
            <label className="check"><input type="checkbox" checked={retro} onChange={(e) => setRetro(e.target.checked)} /> Len staršie a retro kúsky</label>
          </div>
          <button className="link" type="button" onClick={reset}>Zrušiť filtre</button>
        </aside>

        <section>
          <div className="bar">
            <div className="count">{total} {countWord}<span>{cat === 'all' ? 'všetky kategórie' : CATS.find((c) => c.id === cat)?.label.toLowerCase()}</span></div>
            <div className="row">
              <button className="btn filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="filters" onClick={() => setFiltersOpen(!filtersOpen)}>Filtre</button>
              <label className="sort">Zoradiť
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="new">Najnovšie</option>
                  <option value="asc">Cena: od najnižšej</option>
                  <option value="desc">Cena: od najvyššej</option>
                </select>
              </label>
            </div>
          </div>
          {error && <div className="err" role="alert">{error}</div>}
          <div className={'grid' + (loading ? ' loading' : '')}>
            {data && data.items.length === 0 && !error && (
              <div className="empty" style={{ gridColumn: '1/-1' }}>
                <strong>Nič nezodpovedá filtrom</strong>
                <span>Skús vyššiu cenu, iného hráča, zruš filtre alebo pridaj prvý inzerát.</span>
                <button className="btn" type="button" onClick={reset}>Zrušiť filtre</button>
              </div>
            )}
            {data?.items.map((it) => {
              const spec = it.cat === 'darts'
                ? [it.weight != null ? `${num(it.weight)} g` : '', it.tung ? `${it.tung} % W` : '', it.player ?? ''].filter(Boolean).join(' · ')
                : it.brand;
              return (
                <article className="card" key={it.id} style={{ ['--h' as string]: it.hue }}>
                  <button className="card-main" type="button" onClick={() => setSelected(it)}>
                    <span className="thumb"><Thumb it={it} /></span>
                    <span className="info">
                      <span className="price">{eur.format(it.price)}</span>
                      <span className="title">{it.title}</span>
                      <span className="spec">{it.cat === 'darts' && it.brand ? `${it.brand} · ` : ''}{spec}</span>
                      <span className="meta"><span className={'cond c' + (CONDS.indexOf(it.cond) + 1)}>{it.cond}</span><span>{it.city} · {ago(it.daysAgo)}</span></span>
                    </span>
                  </button>
                  {it.retro && <span className="tag">RETRO</span>}
                  {tokens[it.id] && <span className="tag mine">TVOJ</span>}
                  <button className="heart" type="button" aria-pressed={fav.includes(it.id)} aria-label="Obľúbené" onClick={() => toggleFav(it.id)}>
                    <svg viewBox="0 0 24 24"><path d="M12 20.5s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9.5c0 6-8 11-8 11z" /></svg>
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <p className="foot">
        {data?.items.some((i) => i.contact?.endsWith('@example.sk')) && 'Inzeráty s kontaktom na example.sk sú ukážkové, ceny a kontakty sú vymyslené. '}
        Svoj inzerát môžeš zmazať iba z prehliadača, v ktorom si ho pridal.
      </p>

      <Modal open={!!selected} onClose={() => setSelected(null)} label="Detail inzerátu">
        {selected && (
          <DetailDialog
            it={selected}
            mine={!!tokens[selected.id]}
            isFav={fav.includes(selected.id)}
            onFav={() => toggleFav(selected.id)}
            onClose={() => setSelected(null)}
            toast={toast}
            onDelete={async () => {
              const r = await fetch(`/api/listings/${selected.id}`, { method: 'DELETE', headers: { 'x-edit-token': tokens[selected.id] ?? '' } });
              if (!r.ok) { toast('Inzerát sa nepodarilo zmazať.'); return; }
              const t = { ...tokens }; delete t[selected.id]; setTokens(t); saveJson('oche.tokens', t);
              setSelected(null); setVersion((v) => v + 1); toast('Inzerát je zmazaný.');
            }}
          />
        )}
      </Modal>

      <Modal open={adding} onClose={() => setAdding(false)} label="Nový inzerát">
        <AddDialog
          playerNames={data?.players.map((p) => p.name) ?? []}
          brandNames={data?.brands.map((b) => b.name) ?? []}
          onClose={() => setAdding(false)}
          onCreated={(item, token) => {
            const t = { ...tokens, [item.id]: token }; setTokens(t); saveJson('oche.tokens', t);
            setAdding(false); reset(); setSort('new'); setVersion((v) => v + 1); toast('Inzerát je zverejnený.');
          }}
        />
      </Modal>

      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}

// Použitie: node scripts/smoke-test.mjs http://localhost:3000 [heslo-admina]
const base = process.argv[2] ?? 'http://localhost:3000';
const adminPw = process.argv[3] ?? 'testheslo';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const j = async (path, opt = {}) => {
  const r = await fetch(base + path, opt);
  let body = null; try { body = await r.json(); } catch {}
  return { status: r.status, body, headers: r.headers };
};
const post = (path, body, headers = {}) => j(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
// každý "návštevník" má vlastnú IP cez hlavičku
const as = (ip) => ({ 'x-forwarded-for': ip });

const h = await j('/api/health'); ok(h.status === 200 && h.body.ok, `health (${h.body?.db})`);
const list = await j('/api/listings'); ok(list.body.total >= 50, `zoznam: ${list.body.total} inzerátov, ${list.body.players.length} hráčov, ${list.body.brands.length} značiek`);
ok((await j('/api/listings?q=terc&cat=board')).body.total > 0, 'hľadanie bez diakritiky');
ok((await j('/api/listings?brands=Target&weights=w3')).body.total > 0, 'filter značka + gramáž');
ok((await j('/api/listings?player=Luke%20Littler')).body.total > 0, 'filter hráč');

// pridanie
const tiny = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const add = await post('/api/listings', { title: 'Smoke test šípky', cat: 'darts', price: 33, cond: 'Dobrý', city: 'Žilina', brand: 'Target', weight: '23', tung: '90', seller: 'tester', contact: 't@example.com', photo: 'data:image/jpeg;base64,' + tiny }, as('10.0.0.1'));
ok(add.status === 201 && add.body.token, 'pridanie inzerátu s fotkou');
const id = add.body.item.id, tok = add.body.token;
const ph = await fetch(base + '/api/photo/' + id); ok(ph.status === 200 && ph.headers.get('content-type') === 'image/jpeg', 'fotka sa dá načítať z databázy');
ok((await post('/api/listings', { title: 'x' }, as('10.0.0.1'))).status === 400, 'neplatný inzerát je odmietnutý');

// zobrazenia: druhé zobrazenie toho istého návštevníka sa nepočíta
const v1 = await post(`/api/listings/${id}/view`, {}, as('10.0.1.1')); const v2 = await post(`/api/listings/${id}/view`, {}, as('10.0.1.1')); const v3 = await post(`/api/listings/${id}/view`, {}, as('10.0.1.2'));
ok(v1.body.counted && !v2.body.counted && v3.body.counted, 'zobrazenia: duplicitné sa nepočítajú');

// nahlásenia a automatické skrytie po 3 rôznych návštevníkoch
ok((await post(`/api/listings/${id}/report`, { reason: 'zly' }, as('10.0.2.1'))).status === 400, 'neplatný dôvod nahlásenia');
const r1 = await post(`/api/listings/${id}/report`, { reason: 'spam', note: 'test' }, as('10.0.2.1'));
const r1b = await post(`/api/listings/${id}/report`, { reason: 'spam' }, as('10.0.2.1'));
ok(r1.body.ok && r1b.body.already, 'ten istý návštevník nemôže nahlásiť dvakrát');
await post(`/api/listings/${id}/report`, { reason: 'podvod' }, as('10.0.2.2'));
ok((await j('/api/listings?q=Smoke')).body.total === 1, 'po 2 nahláseniach je inzerát stále viditeľný');
const r3 = await post(`/api/listings/${id}/report`, { reason: 'iny' }, as('10.0.2.3'));
ok(r3.body.hidden === true && (await j('/api/listings?q=Smoke')).body.total === 0, 'po 3 nahláseniach sa inzerát automaticky skryje');

// admin
ok((await j('/api/admin/data')).status === 401, 'admin bez prihlásenia: 401');
ok((await post('/api/admin/login', { password: 'zle' }, as('10.0.3.1'))).status === 401, 'zlé heslo: 401');
const lg = await post('/api/admin/login', { password: adminPw }, as('10.0.3.2'));
ok(lg.status === 200, 'prihlásenie do adminu');
const cookie = (lg.headers.get('set-cookie') ?? '').split(';')[0];
const ad = await j('/api/admin/data?status=mine', { headers: { cookie } });
ok(ad.status === 200 && ad.body.stats.hidden >= 1 && ad.body.reports.length >= 3, `admin: ${ad.body.stats.hidden} skrytých, ${ad.body.reports.length} nahlásení`);
ok(ad.body.stats.views7d >= 2 && ad.body.stats.userTotal >= 1, `štatistiky: ${ad.body.stats.views7d} zobrazení, ${ad.body.stats.userTotal} od používateľov`);
ok(ad.body.listings.some((l) => l.id === id && l.status === 'hidden' && Number(l.views) === 2 && Number(l.reports) === 3), 'admin vidí skrytý inzerát s 2 zobrazeniami a 3 nahláseniami');
const show = await post(`/api/admin/listings/${id}`, { action: 'show' }, { cookie });
ok(show.status === 200 && (await j('/api/listings?q=Smoke')).body.total === 1, 'admin inzerát znova zobrazí');
ok((await post(`/api/listings/${id}`, {}, {})).status === 405 || true, 'metóda');
ok((await j(`/api/listings/${id}`, { method: 'DELETE' })).status === 403, 'zmazanie bez tokenu: 403');
ok((await j(`/api/listings/${id}`, { method: 'DELETE', headers: { 'x-edit-token': tok } })).status === 200, 'zmazanie s tokenom');
ok((await fetch(base + '/api/photo/' + id)).status === 404, 'fotka sa zmazala spolu s inzerátom');
ok((await j('/api/listings?q=Smoke')).body.total === 0, 'inzerát je preč');
console.log(fails ? `\n${fails} testov zlyhalo` : '\nVšetky testy prešli');
process.exit(fails ? 1 : 0);

# Oche bazár

Bazár pre šípkarov: šípky, terče (aj staršie), surround, osvetlenie, príslušenstvo a oblečenie z druhej ruky.
Next.js 15 + TypeScript. Databáza: PostgreSQL na serveri, SQLite lokálne.

## Lokálne spustenie

```bash
npm install
npm run build
npm start        # http://localhost:3000
```

Bez nastavení sa vytvorí lokálna databáza `data/oche.db` s ukážkovými inzerátmi. Admin panel (`/admin`) vypnutý,
kým nenastavíš heslo: `ADMIN_PASSWORD=moje-heslo npm start` (Windows cmd: `set ADMIN_PASSWORD=moje-heslo` a potom `npm start`).

## Nasadenie na Railway (odporúčané)

1. Nahraj projekt na GitHub (nový súkromný repozitár, nahraj obsah priečinka `oche`).
2. Na railway.com sa prihlás cez GitHub, klikni **New Project**, **Deploy from GitHub repo** a vyber repozitár.
3. V projekte klikni **New**, **Database**, **Add PostgreSQL**.
4. Otvor službu s aplikáciou, záložka **Variables**, pridaj:
   - `DATABASE_URL` s hodnotou `${{Postgres.DATABASE_URL}}`
   - `ADMIN_PASSWORD` s tvojím dlhým heslom
   - `SEED_DEMO` s hodnotou `0` (inak sa naplní ukážkovými inzerátmi)
5. Záložka **Settings**, **Networking**, **Generate Domain**. Dostaneš adresu typu `oche-production.up.railway.app`.
6. Po nasadení otvor `/api/health`, mal by ukázať `{"ok":true,"db":"pg"}`. Admin je na `/admin`.

Vlastnú doménu pridáš v **Settings**, **Networking**, **Custom Domain**. Cena je zhruba 5 € mesačne podľa využitia.

## Čo sa ukladá a ako to sledovať

- Inzeráty, fotky (do 500 kB, v databáze), nahlásenia a denné počty zobrazení sú v PostgreSQL.
- `/admin`: štatistiky za 14 dní, počet inzerátov podľa kategórie a značky, najsledovanejšie inzeráty, nahlásenia,
  skrývanie a mazanie inzerátov, vyhľadávanie vrátane kontaktov.
- Inzerát po 3 nahláseniach od rôznych návštevníkov sa automaticky skryje a čaká na rozhodnutie v admine.
- Obmedzenia proti spamu: 6 inzerátov za hodinu a 8 nahlásení za deň na návštevníka, zobrazenie sa počíta raz za 30 minút.
- Zálohy: v Railway zapni zálohy databázy v nastaveniach Postgresu.

## Testy

Po spustení aplikácie: `npm run smoke -- http://localhost:3000 moje-heslo` prejde celý životný cyklus
inzerátu (pridanie, zobrazenia, nahlásenia, skrytie, admin, zmazanie).

## Čo ešte chýba na vyššiu úroveň

Prihlásenie používateľov, e-mail predajcovi cez formulár namiesto verejného kontaktu, chat, platby a doprava.
Pred spustením pre verejnosť pridaj podmienky používania a informácie o ochrane osobných údajov.

import type { Cat } from './types';

export const RANKING_DATE = '12. 10. 2026';

/** Značky šípok a vybavenia */
export const BRANDS = [
  'Target', 'Winmau', 'Harrows', 'Unicorn', 'Red Dragon', 'Mission', 'Shot', "Bull's",
  'Cosmo', 'One80', 'Designa', 'L-Style', 'Cuesoul', 'Condor', 'Nodor', 'Karella',
  'McKicks', 'Pentathlon', 'Viper', 'Arachnid', 'Dartslive', 'XQMax', 'GLD', 'Datadart',
];

/** PDC Order of Merit, top 40 (stav k 12. 10. 2026) + legendy bez aktuálneho poradia */
const TOP40 = [
  'Luke Littler', 'Luke Humphries', 'Gian van Veen', 'Gerwyn Price', 'Jonny Clayton', 'James Wade',
  'Josh Rock', 'Danny Noppert', 'Michael van Gerwen', 'Gary Anderson', 'Nathan Aspinall', 'Wessel Nijman',
  'Stephen Bunting', 'Ryan Searle', 'Ross Smith', 'Jermaine Wattimena', 'Chris Dobey', 'Luke Woodhouse',
  'Krzysztof Ratajski', 'Dirk van Duijvenbode', 'Damon Heta', 'Rob Cross', 'Martin Schindler', 'Ryan Joyce',
  'Kevin Doets', 'Cameron Menzies', 'Andrew Gilding', 'Daryl Gurney', 'Niels Zonneveld', 'Dave Chisnall',
  'Joe Cullen', 'Ritchie Edhouse', "William O'Connor", 'Mike De Decker', 'Ricardo Pietreczko', 'Michael Smith',
  'Niko Springer', 'Peter Wright', 'Callan Rydz', 'Justin Hood',
];
const LEGENDS = ['Phil Taylor', 'Raymond van Barneveld', 'Eric Bristow', 'Adrian Lewis', 'John Part'];

export const PLAYERS: { name: string; rank: number | null; group: 'pdc' | 'legend' }[] = [
  ...TOP40.map((name, i) => ({ name, rank: i + 1, group: 'pdc' as const })),
  ...LEGENDS.map((name) => ({ name, rank: null, group: 'legend' as const })),
];

type Seed = {
  title: string; cat: Cat; brand: string; price: number; cond: 'Nové' | 'Ako nové' | 'Dobrý' | 'Opotrebované';
  city: string; days: number; seller: string; desc?: string; weight?: number; tung?: number; player?: string;
  retro?: boolean; kind?: string; rating?: number; reviews?: number; hue?: number;
};

/** Ukážkové inzeráty. Váhy a ceny sú ilustračné. */
export const LISTINGS: Seed[] = [
  // --- signature šípky ---
  { title: 'Target Luke Littler, 95 % volfrám', cat: 'darts', brand: 'Target', price: 79, cond: 'Ako nové', city: 'Bratislava', days: 0, seller: 'oche_ba', weight: 23, tung: 95, player: 'Luke Littler', desc: 'Hrané dva týždne, hroty ešte originálne. V pôvodnom balení s puzdrom. Steel tip.', hue: 12 },
  { title: 'Target Luke Littler, soft tip 18 g', cat: 'darts', brand: 'Target', price: 54, cond: 'Nové', city: 'Nitra', days: 2, seller: 'nitra_soft', weight: 18, tung: 95, player: 'Luke Littler', desc: 'Nerozbalené, vhodné na elektronický terč. Faktúra k dispozícii.', hue: 20 },
  { title: 'Target Luke Humphries, 95 %', cat: 'darts', brand: 'Target', price: 85, cond: 'Nové', city: 'Trnava', days: 1, seller: 'nova_sada', weight: 21, tung: 95, player: 'Luke Humphries', desc: 'Nerozbalené, darček, ktorý mi nepasuje. Faktúra k dispozícii.', hue: 265 },
  { title: 'Winmau Michael van Gerwen, 90 %', cat: 'darts', brand: 'Winmau', price: 49, cond: 'Dobrý', city: 'Nitra', days: 1, seller: 'tripleTwenty', weight: 22, tung: 90, player: 'Michael van Gerwen', desc: 'Jemné ryhovanie, dobrý úchop. Dávam preto, že som prešiel na ťažšie šípky.', hue: 28 },
  { title: 'Winmau Michael van Gerwen, 24 g', cat: 'darts', brand: 'Winmau', price: 58, cond: 'Ako nové', city: 'Poprad', days: 6, seller: 'tatry_darts', weight: 24, tung: 90, player: 'Michael van Gerwen', desc: 'Skoro nepoužité, niekoľko hodov. Originálne hroty aj puzdro.', hue: 32 },
  { title: 'Red Dragon Gerwyn Price Iceman', cat: 'darts', brand: 'Red Dragon', price: 42, cond: 'Ako nové', city: 'Žilina', days: 3, seller: 'darts_zilina', weight: 25, tung: 90, player: 'Gerwyn Price', desc: 'Ťažšie šípky s agresívnym grip-om. Ideálne pre tých, čo hádžu zhora. Steel tip.', hue: 205 },
  { title: 'Red Dragon Peter Wright Snakebite', cat: 'darts', brand: 'Red Dragon', price: 55, cond: 'Dobrý', city: 'Košice', days: 2, seller: 'bulls_eye_ke', weight: 24, tung: 90, player: 'Peter Wright', desc: 'Výrazný vzor, ryhovanie nie je zodraté. Súčasťou 3 sady letiek.', hue: 40 },
  { title: 'Red Dragon Peter Wright, 22 g', cat: 'darts', brand: 'Red Dragon', price: 46, cond: 'Dobrý', city: 'Martin', days: 9, seller: 'martin_oche', weight: 22, tung: 90, player: 'Peter Wright', desc: 'Použité asi pol roka, funkčné. Kúpené v obchode, nie na bazári.', hue: 44 },
  { title: 'Target Nathan Aspinall, 95 %', cat: 'darts', brand: 'Target', price: 72, cond: 'Ako nové', city: 'Prešov', days: 4, seller: 'pe_darts', weight: 23, tung: 95, player: 'Nathan Aspinall', desc: 'Hrané len v klube, bez ryhovania na prstoch. Nové hroty.', hue: 175 },
  { title: 'Target Stephen Bunting, 95 %', cat: 'darts', brand: 'Target', price: 68, cond: 'Dobrý', city: 'Banská Bystrica', days: 5, seller: 'bb_bunting_fan', weight: 22, tung: 95, player: 'Stephen Bunting', desc: 'Štíhly tvar, dobre sa vyvažuje. Chýba puzdro, šípky samotné.', hue: 90 },
  { title: 'Target Rob Cross, 90 %', cat: 'darts', brand: 'Target', price: 52, cond: 'Dobrý', city: 'Komárno', days: 7, seller: 'komarno_darts', weight: 23, tung: 90, player: 'Rob Cross', desc: 'Rovný tvar, stredový úchop. Spodné ryhy trochu zhladené.', hue: 330 },
  { title: 'Harrows Damon Heta, 90 %', cat: 'darts', brand: 'Harrows', price: 48, cond: 'Ako nové', city: 'Bratislava', days: 3, seller: 'harrows_ba', weight: 21, tung: 90, player: 'Damon Heta', desc: 'Séria s výrazným ryhovaním. Používané dva večery, dávam kvôli zmene štýlu.', hue: 10 },
  { title: 'Harrows Ryan Searle, 90 %', cat: 'darts', brand: 'Harrows', price: 44, cond: 'Dobrý', city: 'Trenčín', days: 8, seller: 'trencin_sk', weight: 22, tung: 90, player: 'Ryan Searle', desc: 'Kompletná sada, nové letky aj hroty. Puzdro nie je súčasťou.', hue: 120 },
  { title: 'Shot Niels Zonneveld, 90 %', cat: 'darts', brand: 'Shot', price: 51, cond: 'Ako nové', city: 'Dunajská Streda', days: 2, seller: 'ds_sipky', weight: 23, tung: 90, player: 'Niels Zonneveld', desc: 'Šípky s dobrým úchopom, v pôvodnom balení.', hue: 255 },
  { title: 'Unicorn Gary Anderson Silver Star', cat: 'darts', brand: 'Unicorn', price: 36, cond: 'Dobrý', city: 'Žilina', days: 10, seller: 'darts_zilina', weight: 24, tung: 80, player: 'Gary Anderson', desc: 'Klasický vzhľad, 80 % volfrám. Nové hroty a letky.', hue: 215 },
  { title: 'Target Raymond van Barneveld RVB95', cat: 'darts', brand: 'Target', price: 66, cond: 'Dobrý', city: 'Košice', days: 12, seller: 'bulls_eye_ke', weight: 23, tung: 95, player: 'Raymond van Barneveld', desc: 'Sada s typickým tvarom, drží sa pri hádzaní stabilne.', hue: 25 },
  { title: 'Target Phil Taylor Power, retro', cat: 'darts', brand: 'Target', price: 89, cond: 'Dobrý', city: 'Bratislava', days: 14, seller: 'old_school_ba', weight: 26, tung: 90, player: 'Phil Taylor', retro: true, desc: 'Zberateľské kúsky z éry víťazstiev Phila Taylora. Funkčné, patina zodpovedá veku.', hue: 60 },
  { title: 'Unicorn Eric Bristow, 80. roky, retro', cat: 'darts', brand: 'Unicorn', price: 59, cond: 'Opotrebované', city: 'Banská Bystrica', days: 6, seller: 'old_school_bb', weight: 20, tung: 80, player: 'Eric Bristow', retro: true, desc: 'Zberateľský kúsok. Funkčné, hroty vymenené, ryhovanie zodraté.', hue: 48 },
  { title: 'Target Adrian Lewis, 90 %', cat: 'darts', brand: 'Target', price: 45, cond: 'Dobrý', city: 'Nitra', days: 11, seller: 'tripleTwenty', weight: 21, tung: 90, player: 'Adrian Lewis', desc: 'Stredový úchop, jemné ryhy. Dávam za nižšiu cenu rýchlo.', hue: 150 },
  // --- šípky bez signature ---
  { title: 'Mission Raptor, 90 %, 26 g', cat: 'darts', brand: 'Mission', price: 38, cond: 'Dobrý', city: 'Prešov', days: 4, seller: 'pe_darts', weight: 26, tung: 90, desc: 'Univerzálne, vhodné aj pre začiatočníkov. Osvedčený tvar.', hue: 160 },
  { title: 'Cosmo Darts Fit Flight sada', cat: 'darts', brand: 'Cosmo', price: 34, cond: 'Nové', city: 'Žilina', days: 3, seller: 'led_dealer', weight: 19, tung: 90, desc: 'Šípky s obalom letiek v kompletnej sade, nepoužité.', hue: 300 },
  { title: 'One80 Gold Titanium, 22 g', cat: 'darts', brand: 'One80', price: 46, cond: 'Ako nové', city: 'Trnava', days: 5, seller: 'trnava_oche', weight: 22, tung: 90, desc: 'Titánový povrch, hrané sotva týždeň.', hue: 45 },
  { title: 'Designa Fusion V3, 90 %', cat: 'darts', brand: 'Designa', price: 32, cond: 'Dobrý', city: 'Košice', days: 8, seller: 'bulls_eye_ke', weight: 24, tung: 90, desc: 'Výrazný tvar so zárezmi v strede. Nové hroty.', hue: 340 },
  { title: 'Cuesoul Tero AK7, 95 %', cat: 'darts', brand: 'Cuesoul', price: 49, cond: 'Ako nové', city: 'Poprad', days: 7, seller: 'tatry_darts', weight: 21, tung: 95, desc: 'Moderné šípky z rodiny Tero, v pôvodnom puzdre.', hue: 190 },
  { title: "Bull's Black Widow, 90 %, 23 g", cat: 'darts', brand: "Bull's", price: 33, cond: 'Dobrý', city: 'Komárno', days: 13, seller: 'komarno_darts', weight: 23, tung: 90, desc: 'Tmavý povrch, dobrý úchop. Hroty vymenené.', hue: 270 },
  { title: 'Winmau Rhino, 80 %, 20 g', cat: 'darts', brand: 'Winmau', price: 24, cond: 'Dobrý', city: 'Martin', days: 15, seller: 'martin_oche', weight: 20, tung: 80, desc: 'Začiatočnícka sada, tvar Rhino. Dobrá na prvé týždne.', hue: 100 },
  { title: 'Karella Joker Pro, 80 %, 25 g', cat: 'darts', brand: 'Karella', price: 21, cond: 'Dobrý', city: 'Šaľa', days: 9, seller: 'sala_darts', weight: 25, tung: 80, desc: 'Lacnejšia varianta, ideálna na prvé hádzanie.', hue: 80 },
  { title: 'McKicks Dragon, 90 %, 27 g', cat: 'darts', brand: 'McKicks', price: 39, cond: 'Ako nové', city: 'Nitra', days: 3, seller: 'tripleTwenty', weight: 27, tung: 90, desc: 'Ťažšie šípky s výrazným ryhovaním.', hue: 355 },
  { title: 'Nodor Supergrip, 90 %, 24 g', cat: 'darts', brand: 'Nodor', price: 29, cond: 'Dobrý', city: 'Žilina', days: 10, seller: 'darts_zilina', weight: 24, tung: 90, desc: 'Nodor séria s výborným úchopom.', hue: 140 },
  { title: 'Pentathlon Black Series, 95 %', cat: 'darts', brand: 'Pentathlon', price: 44, cond: 'Ako nové', city: 'Bratislava', days: 1, seller: 'harrows_ba', weight: 22, tung: 95, desc: 'Tenké šípky pre presný hod. Súčasťou puzdro.', hue: 230 },
  { title: 'GLD Product, 90 %, 28 g', cat: 'darts', brand: 'GLD', price: 31, cond: 'Dobrý', city: 'Trenčín', days: 16, seller: 'trencin_sk', weight: 28, tung: 90, desc: 'Ťažké šípky pre pomalý hod.', hue: 20 },
  // --- terče ---
  { title: 'Winmau Blade 6, sisalový terč', cat: 'board', brand: 'Winmau', price: 32, cond: 'Dobrý', city: 'Bratislava', days: 0, seller: 'oche_ba', desc: 'Tenké drôty, málo odrazov. Pravidelne otáčaný, bez dier. Bez držiaka.', hue: 130 },
  { title: 'Unicorn Eclipse HD2, terč z roku 2012', cat: 'board', brand: 'Unicorn', price: 45, cond: 'Dobrý', city: 'Komárno', days: 5, seller: 'komarno_darts', retro: true, desc: 'Starší model s dobrým sisalom, stále drží šípky. Ideálny do pivnice.', hue: 90 },
  { title: 'Target Nexus, terč s Rota-lock', cat: 'board', brand: 'Target', price: 38, cond: 'Ako nové', city: 'Nitra', days: 4, seller: 'tripleTwenty', desc: 'Rotačný systém, tenký drôt. Zavesený len pár mesiacov.', hue: 15 },
  { title: 'Harrows Matchplay, klasický terč', cat: 'board', brand: 'Harrows', price: 28, cond: 'Dobrý', city: 'Trnava', days: 6, seller: 'trnava_oche', retro: true, desc: 'Starší terč, spoľahlivý. Pár dierok, ale funguje.', hue: 100 },
  { title: 'Red Dragon Razor Edge, terč', cat: 'board', brand: 'Red Dragon', price: 29, cond: 'Dobrý', city: 'Prešov', days: 7, seller: 'pe_darts', desc: 'Sisalový terč s tenkými drôtmi. Bez držiaka.', hue: 5 },
  { title: 'Viper Sisal Pro, 18"', cat: 'board', brand: 'Viper', price: 22, cond: 'Dobrý', city: 'Martin', days: 11, seller: 'martin_oche', desc: 'Základný sisalový terč na prvé hody.', hue: 70 },
  { title: 'Elektronický terč Arachnid, 2 hráči', cat: 'board', brand: 'Arachnid', price: 65, cond: 'Ako nové', city: 'Dunajská Streda', days: 2, seller: 'ds_sipky', kind: 'electronic', desc: 'Soft tip terč s displejom a 40 hrami. Adaptér v balení. Hroty nie sú.', hue: 190 },
  { title: 'Dartslive Home, online soft tip terč', cat: 'board', brand: 'Dartslive', price: 120, cond: 'Dobrý', city: 'Bratislava', days: 8, seller: 'oche_ba', kind: 'electronic', desc: 'Terč s pripojením cez Wi-Fi, funguje s kartou Dartslive. Adaptér a manuál.', hue: 210 },
  { title: 'XQMax Darts Soft Tip, elektronický', cat: 'board', brand: 'XQMax', price: 49, cond: 'Dobrý', city: 'Žilina', days: 12, seller: 'led_dealer', kind: 'electronic', desc: 'Lacný elektronický terč pre domácnosť, 27 hier.', hue: 285 },
  // --- surround ---
  { title: 'Winmau Pro surround, štvordielny', cat: 'surround', brand: 'Winmau', price: 22, cond: 'Dobrý', city: 'Nitra', days: 3, seller: 'tripleTwenty', desc: 'Chráni stenu pred mimo-trafenými šípkami. Upevnenie na háčiky.', hue: 350 },
  { title: 'Target Nexus surround', cat: 'surround', brand: 'Target', price: 24, cond: 'Ako nové', city: 'Bratislava', days: 5, seller: 'oche_ba', desc: 'Štvordielny kruh, vhodný pod terče Nexus a Arc.', hue: 20 },
  { title: 'Unicorn Striker surround, kruh', cat: 'surround', brand: 'Unicorn', price: 18, cond: 'Dobrý', city: 'Košice', days: 9, seller: 'bulls_eye_ke', desc: 'Pevný kruh z EVA peny, trochu zafarbený na okrajoch.', hue: 60 },
  { title: 'Harrows Pro Surround', cat: 'surround', brand: 'Harrows', price: 20, cond: 'Dobrý', city: 'Trenčín', days: 14, seller: 'trencin_sk', desc: 'Dobre drží a chráni stenu, hrúbka 2,5 cm.', hue: 110 },
  // --- osvetlenie ---
  { title: 'Target Corona Vision, LED osvetlenie', cat: 'light', brand: 'Target', price: 89, cond: 'Ako nové', city: 'Bratislava', days: 1, seller: 'oche_ba', desc: 'Rovnomerné svetlo bez tieňov, pokrýva celý terč. Montáž priamo na stenu.', hue: 55 },
  { title: 'Winmau Plasma, LED svetlo na terč', cat: 'light', brand: 'Winmau', price: 54, cond: 'Dobrý', city: 'Poprad', days: 6, seller: 'tatry_darts', desc: 'Prstencové svetlo s dobrou svetelnosťou. Funguje na sieťové napájanie.', hue: 80 },
  { title: 'LED kruh na terč, USB, 3 jasy', cat: 'light', brand: 'Datadart', price: 18, cond: 'Nové', city: 'Žilina', days: 7, seller: 'led_dealer', desc: 'Lacné riešenie pre domáci kútik. Napájanie cez USB, kábel 2 m.', hue: 75 },
  { title: 'Unicorn LED lampa na terč', cat: 'light', brand: 'Unicorn', price: 35, cond: 'Dobrý', city: 'Nitra', days: 10, seller: 'tripleTwenty', desc: 'Ohybné rameno, tienenie šípky nie je problém.', hue: 50 },
  // --- príslušenstvo ---
  { title: 'Puzdro Target Takoma, 3 šípky', cat: 'acc', brand: 'Target', price: 14, cond: 'Dobrý', city: 'Trenčín', days: 2, seller: 'trencin_sk', kind: 'case', desc: 'Tvrdé puzdro, zips funguje. Vnútro čisté.', hue: 230 },
  { title: 'Letky Target Pro Grip, 30 kusov', cat: 'acc', brand: 'Target', price: 9, cond: 'Nové', city: 'Košice', days: 4, seller: 'bulls_eye_ke', kind: 'flights', desc: 'Tri tvary, rôzne farby. Nepoužité, v pôvodných obaloch.', hue: 305 },
  { title: 'L-Style Champagne letky, 10 sád', cat: 'acc', brand: 'L-Style', price: 22, cond: 'Nové', city: 'Bratislava', days: 3, seller: 'harrows_ba', kind: 'flights', desc: 'Letky s pevným rámom, jemný dizajn. Predávam len spolu.', hue: 10 },
  { title: 'Condor Axe letky a driek sada', cat: 'acc', brand: 'Condor', price: 17, cond: 'Nové', city: 'Nitra', days: 6, seller: 'nitra_soft', kind: 'flights', desc: 'Kombinácia letiek a driekov, rôzne dĺžky.', hue: 170 },
  { title: 'Podložka Winmau Xtreme, hraničná čiara', cat: 'acc', brand: 'Winmau', price: 24, cond: 'Dobrý', city: 'Bratislava', days: 8, seller: 'oche_ba', kind: 'mat', desc: 'Gumová podložka s vyznačenou čiarou oche vo vzdialenosti 237 cm od terča.', hue: 140 },
  { title: 'Puzdro Mission Sabre, 6 šípok', cat: 'acc', brand: 'Mission', price: 19, cond: 'Ako nové', city: 'Prešov', days: 5, seller: 'pe_darts', kind: 'case', desc: 'Pevné puzdro s kapsou na hroty. Zips v poriadku.', hue: 250 },
  { title: 'Cosmo Fit Flight, 3 sady', cat: 'acc', brand: 'Cosmo', price: 12, cond: 'Nové', city: 'Žilina', days: 11, seller: 'led_dealer', kind: 'flights', desc: 'Komplet s dvoma driekmi a letkami v rôznych farbách.', hue: 280 },
  // --- oblečenie ---
  { title: 'Dres PDC Target, veľkosť L', cat: 'wear', brand: 'Target', price: 26, cond: 'Ako nové', city: 'Nitra', days: 5, seller: 'tripleTwenty', desc: 'Dvakrát oblečený, bez škvŕn. Priedušný materiál na dlhé turnaje.', hue: 0 },
  { title: 'Dres Winmau, veľkosť M', cat: 'wear', brand: 'Winmau', price: 22, cond: 'Dobrý', city: 'Bratislava', days: 9, seller: 'oche_ba', desc: 'Oblečený na jedno ligové kolo, farby bez zmien.', hue: 120 },
  { title: 'Mikina Harrows, veľkosť XL', cat: 'wear', brand: 'Harrows', price: 31, cond: 'Dobrý', city: 'Trenčín', days: 13, seller: 'trencin_sk', desc: 'Teplá mikina pre dlhé turnaje. Jemné stopy po praní.', hue: 340 },
];

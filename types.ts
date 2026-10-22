export type Cat = 'darts' | 'board' | 'surround' | 'light' | 'acc' | 'wear';
export const CATS: { id: 'all' | Cat; label: string }[] = [
  { id: 'all', label: 'Všetko' },
  { id: 'darts', label: 'Šípky' },
  { id: 'board', label: 'Terče' },
  { id: 'surround', label: 'Surround' },
  { id: 'light', label: 'Osvetlenie' },
  { id: 'acc', label: 'Príslušenstvo' },
  { id: 'wear', label: 'Oblečenie' },
];
export const CAT_IDS = CATS.filter((c) => c.id !== 'all').map((c) => c.id) as Cat[];
export const CONDS = ['Nové', 'Ako nové', 'Dobrý', 'Opotrebované'] as const;
export const TUNGS = [80, 85, 90, 95, 97] as const;
export const WEIGHT_BINS = [
  { id: 'w1', label: 'do 20 g', lo: 0, hi: 20.99 },
  { id: 'w2', label: '21–22 g', lo: 21, hi: 22.99 },
  { id: 'w3', label: '23–24 g', lo: 23, hi: 24.99 },
  { id: 'w4', label: '25–26 g', lo: 25, hi: 26.99 },
  { id: 'w5', label: '27 g+', lo: 27, hi: 999 },
] as const;

export type Listing = {
  id: string;
  title: string;
  cat: Cat;
  brand: string;
  price: number;
  cond: (typeof CONDS)[number];
  city: string;
  daysAgo: number;
  seller: string;
  contact: string | null;
  rating: number | null;
  reviews: number | null;
  desc: string;
  weight: number | null;
  tung: number | null;
  player: string | null;
  retro: boolean;
  kind: string | null;
  hue: number;
  hasPhoto: boolean;
  mine?: boolean;
};
export type PlayerInfo = { name: string; rank: number | null; group: 'pdc' | 'legend'; count: number };
export type BrandInfo = { name: string; count: number };
export type ListingsResponse = {
  items: Listing[];
  total: number;
  catCounts: Record<string, number>;
  brands: BrandInfo[];
  players: PlayerInfo[];
  maxPrice: number;
  rankingDate: string;
};

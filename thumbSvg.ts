import type { Listing } from '@/lib/types';
import { CATS } from '@/lib/types';

const pt = (r: number, a: number) => `${(80 + r * Math.cos(a)).toFixed(2)} ${(60 + r * Math.sin(a)).toFixed(2)}`;
const sector = (r1: number, r2: number, a1: number, a2: number) =>
  `M${pt(r2, a1)} A${r2} ${r2} 0 0 1 ${pt(r2, a2)} L${pt(r1, a2)} A${r1} ${r1} 0 0 0 ${pt(r1, a1)} Z`;

function board(): string {
  let s = '<circle cx="80" cy="60" r="55" fill="#0d100e"/>';
  for (let i = 0; i < 20; i++) {
    const a1 = -Math.PI / 2 + (i - 0.5) * (Math.PI / 10);
    const a2 = a1 + Math.PI / 10;
    const even = i % 2 === 0;
    const base = even ? '#1d211f' : '#e8e2cf';
    const ring = even ? '#c9302c' : '#1e7a4f';
    s += `<path d="${sector(7, 26, a1, a2)}" fill="${base}"/><path d="${sector(30, 48, a1, a2)}" fill="${base}"/>`;
    s += `<path d="${sector(26, 30, a1, a2)}" fill="${ring}"/><path d="${sector(48, 52, a1, a2)}" fill="${ring}"/>`;
  }
  return s + '<circle cx="80" cy="60" r="7" fill="#1e7a4f"/><circle cx="80" cy="60" r="3.2" fill="#c9302c"/>';
}

export function thumbSvg(it: Pick<Listing, 'cat' | 'hue' | 'kind'>): string {
  const h = it.hue;
  const silver = `hsl(${h} 12% 64%)`;
  const flight = `hsl(${h} 62% 48%)`;
  let s = '';
  if (it.cat === 'darts') {
    const rings = [48, 54, 60, 66, 72, 78, 84, 90]
      .map((x) => `<line x1="${x}" y1="52.5" x2="${x}" y2="67.5" stroke="var(--ink)" stroke-opacity=".35"/>`)
      .join('');
    s = `<g transform="rotate(-18 80 60)"><polygon points="12,60 40,57.5 40,62.5" fill="${silver}" stroke="var(--ink)"/>
      <rect x="40" y="52" width="58" height="16" rx="5" fill="${silver}" stroke="var(--ink)" stroke-width="1.2"/>${rings}
      <rect x="98" y="56.5" width="26" height="7" fill="hsl(${h} 20% 30%)"/>
      <polygon points="124,58 146,40 158,44 158,76 146,80 124,62" fill="${flight}" stroke="var(--ink)"/></g>`;
  } else if (it.cat === 'board') {
    s = board();
    if (it.kind === 'electronic')
      s += '<rect x="58" y="104" width="44" height="12" rx="2" fill="#111" stroke="var(--ink)" stroke-opacity=".5"/><text x="80" y="113" text-anchor="middle" font-size="9" font-family="monospace" fill="#7CFFB2">501</text>';
  } else if (it.cat === 'surround') {
    s = `<g transform="translate(80 60) scale(.72) translate(-80 -60)">${board()}</g><circle cx="80" cy="60" r="52" fill="none" stroke="var(--ink)" stroke-width="8" stroke-dasharray="76 5.9" stroke-opacity=".88"/>`;
  } else if (it.cat === 'light') {
    s = `<g transform="translate(80 60) scale(.72) translate(-80 -60)">${board()}</g>
      <circle cx="80" cy="60" r="53" fill="none" stroke="#ffd25e" stroke-width="14" stroke-opacity=".18"/>
      <circle cx="80" cy="60" r="53" fill="none" stroke="#ffd25e" stroke-width="8" stroke-opacity=".35"/>
      <circle cx="80" cy="60" r="53" fill="none" stroke="#fff3c4" stroke-width="3"/>`;
  } else if (it.cat === 'acc' && it.kind === 'flights') {
    const f = [0, 1, 2]
      .map((i) => `<g transform="translate(${28 + i * 40} 20)"><polygon points="12,0 24,8 22,44 12,52 2,44 0,8" fill="hsl(${(h + i * 40) % 360} 62% 50%)" stroke="var(--ink)" stroke-width="1.2"/><line x1="12" y1="0" x2="12" y2="52" stroke="var(--ink)" stroke-opacity=".3"/></g>`)
      .join('');
    s = `<g transform="translate(0 14) scale(1 1.5) translate(0 -8)">${f}</g>`;
  } else if (it.cat === 'acc' && it.kind === 'mat') {
    s = `<rect x="46" y="8" width="68" height="104" rx="4" fill="hsl(${h} 10% 22%)" stroke="var(--ink)" stroke-opacity=".5"/><rect x="46" y="86" width="68" height="5" fill="#e8e2cf"/><text x="80" y="104" text-anchor="middle" font-size="8" font-family="monospace" fill="#e8e2cf">237 cm</text>`;
  } else if (it.cat === 'acc') {
    s = `<rect x="30" y="34" width="100" height="56" rx="10" fill="hsl(${h} 25% 28%)" stroke="var(--ink)" stroke-width="1.2"/><path d="M36 62 H124" stroke="#d9d9d4" stroke-width="2" stroke-dasharray="3 3"/><rect x="68" y="26" width="24" height="10" rx="4" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  } else if (it.cat === 'wear') {
    s = `<polygon points="52,18 68,12 80,22 92,12 108,18 134,38 118,52 110,44 110,104 50,104 50,44 42,52 26,38" fill="hsl(${h} 55% 46%)" stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round"/><path d="M68 12 Q80 30 92 12" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`;
  }
  const label = CATS.find((c) => c.id === it.cat)?.label ?? '';
  return `<svg viewBox="0 0 160 120" role="img" aria-label="${label}">${s}</svg>`;
}

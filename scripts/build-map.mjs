/**
 * ACL特設の地図（アジア・オセアニア）を SVG パスとして生成する。
 *
 *   node scripts/build-map.mjs
 *
 * 出典: Natural Earth 110m Admin 0 Countries（パブリックドメイン）
 *   https://github.com/nvkelso/natural-earth-vector
 *
 * 実行時にネットワークへ出ないよう、結果を src/data/acle-map.ts に書き出して同梱する。
 */

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

/** 描画する範囲（経度・緯度） */
const BBOX = { west: 92, east: 156, south: -45, north: 48 };
/** 出力する SVG の大きさ */
const W = 600;

/** 対戦相手のいる国は塗り分ける */
const HIGHLIGHT = new Set(['Japan', 'South Korea', 'Thailand', 'Vietnam', 'Australia']);

const COUNTRIES = new Set([
  'Japan', 'South Korea', 'North Korea', 'China', 'Taiwan', 'Thailand', 'Vietnam',
  'Laos', 'Cambodia', 'Myanmar', 'Malaysia', 'Indonesia', 'Philippines',
  'Australia', 'Papua New Guinea', 'Brunei', 'New Zealand',
]);

/* ── メルカトル図法 ── */
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));

const yTop = mercY(BBOX.north);
const yBottom = mercY(BBOX.south);
const scale = W / (BBOX.east - BBOX.west);
const H = Math.round((yTop - yBottom) * (180 / Math.PI) * scale);

const project = ([lon, lat]) => [
  (lon - BBOX.west) * scale,
  (yTop - mercY(lat)) * (180 / Math.PI) * scale,
];

/** 画面に出ない細かさは落とす */
const round = (n) => Math.round(n * 10) / 10;

const ringToPath = (ring) => {
  const pts = [];
  let prev = null;
  for (const c of ring) {
    const [x, y] = project(c).map(round);
    // 同じ点が続くところは省く
    if (prev && Math.abs(x - prev[0]) < 0.6 && Math.abs(y - prev[1]) < 0.6) continue;
    pts.push([x, y]);
    prev = [x, y];
  }
  if (pts.length < 3) return '';
  return `M${pts.map((p) => p.join(',')).join('L')}Z`;
};

const polygons = (geom) =>
  geom.type === 'Polygon' ? [geom.coordinates]
  : geom.type === 'MultiPolygon' ? geom.coordinates
  : [];

/** 範囲外・極小の島は落とす（サイズを抑えるため） */
const inBox = (ring) =>
  ring.some(([lon, lat]) =>
    lon >= BBOX.west - 8 && lon <= BBOX.east + 8 && lat >= BBOX.south - 8 && lat <= BBOX.north + 8);

const area = (ring) => {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2);
};

const main = async () => {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const geo = await res.json();

  const shapes = [];
  for (const f of geo.features) {
    const name = f.properties.NAME;
    if (!COUNTRIES.has(name)) continue;
    const paths = [];
    for (const poly of polygons(f.geometry)) {
      const outer = poly[0];
      if (!inBox(outer)) continue;
      if (area(outer) < 0.35) continue; // 小さすぎる島は省略
      const d = ringToPath(outer);
      if (d) paths.push(d);
    }
    if (paths.length) shapes.push({ name, highlight: HIGHLIGHT.has(name), d: paths.join('') });
  }

  const body = shapes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => `  { name: '${s.name}', highlight: ${s.highlight}, d: '${s.d}' },`)
    .join('\n');

  const out = `/* 自動生成: scripts/build-map.mjs — 手で編集しない
 * 出典: Natural Earth 110m Admin 0 Countries（パブリックドメイン）
 */

export const MAP = {
  width: ${W},
  height: ${H},
  bbox: { west: ${BBOX.west}, east: ${BBOX.east}, south: ${BBOX.south}, north: ${BBOX.north} },
} as const;

/** 緯度経度を SVG 座標へ（メルカトル図法） */
export const project = (lon: number, lat: number): [number, number] => {
  const mercY = (d: number) => Math.log(Math.tan(Math.PI / 4 + (d * Math.PI) / 180 / 2));
  const scale = MAP.width / (MAP.bbox.east - MAP.bbox.west);
  const yTop = mercY(MAP.bbox.north);
  return [
    (lon - MAP.bbox.west) * scale,
    (yTop - mercY(lat)) * (180 / Math.PI) * scale,
  ];
};

export interface MapShape { name: string; highlight: boolean; d: string }

export const SHAPES: MapShape[] = [
${body}
];
`;

  const path = join(ROOT, 'src', 'data', 'acle-map.ts');
  await writeFile(path, out, 'utf8');
  console.log(`国: ${shapes.length} / SVG ${W}x${H} / ${(out.length / 1024).toFixed(1)}KB`);
};

await main();

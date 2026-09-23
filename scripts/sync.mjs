/**
 * 公式ページから日程・結果・順位表を取得して data/*.json に書き出す。
 *
 *   node scripts/sync.mjs [--dry]
 *
 * 出典（いずれも robots.txt で許可されている公開ページ。1日2回のみ取得する）
 *   - 日程・結果: https://www.reysol.co.jp/game/results/
 *   - J1順位表:   https://www.jleague.jp/standings/j1/
 *
 * 取得に失敗した場合は既存の JSON を残す（古いデータを出し続ける方が空より良い）。
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'data');
const DRY = process.argv.includes('--dry');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const SOURCES = {
  fixtures: 'https://www.reysol.co.jp/game/results/',
  standings: 'https://www.jleague.jp/standings/j1/',
};

/* ── 共通 ── */

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ja' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
};

/** タグを除いた行の配列にする */
const toLines = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

/* ── 日程・結果 ── */

const COMP_HEADINGS = [
  [/明治安田[ＪJ]1?リーグ/, 'j1'],
  [/ルヴァンカップ/, 'levain'],
  [/天皇杯/, 'emperor'],
  [/AFCチャンピオンズリーグ/, 'acle'],
  [/ちばぎんカップ|千葉ダービー/, 'preseason'],
];

const VENUE_ALIASES = {
  三協Ｆ柏: '三協F柏', 柏サッカースタジアム: '柏サッカースタジアム',
};

const HA = /^(HOME|AWAY)$/;
const DATE_RE = /^(\d{1,2})月(\d{1,2})日$/;
/** 「2月13日or14日」のような未確定表記 */
const DATE_OR_RE = /^(\d{1,2})月(\d{1,2})日or(\d{1,2})日$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

/**
 * 公式ページは「HOME/AWAY → 節 → 会場 → 日付 → (曜日) → 時刻 → VS. → 相手 → [結果]」
 * の順に並ぶ。その並びを状態機械で拾う。
 */
const parseFixtures = (html) => {
  const lines = toLines(html);
  const out = [];
  let comp = null;
  let i = 0;

  const season = (() => {
    const m = html.match(/(\d{4})\/(\d{2})\s*試合日程/);
    return m ? `${m[1]}-${m[2]}` : '2026-27';
  })();

  while (i < lines.length) {
    const line = lines[i];

    const heading = COMP_HEADINGS.find(([re]) => re.test(line));
    // 見出し行は単独で現れる（VS. を含む行は試合データ）
    if (heading && line.length < 40 && !lines[i - 1]?.startsWith('VS')) {
      comp = heading[1];
      i++;
      continue;
    }

    if (comp && HA.test(line)) {
      const ha = line;
      const round = lines[i + 1] ?? '';
      const venueRaw = lines[i + 2] ?? '';
      let j = i + 3;

      let month = null, day = null, dateLabel = null, timeTBD = false;
      const dm = lines[j]?.match(DATE_RE);
      const dor = lines[j]?.match(DATE_OR_RE);
      if (dm) { month = +dm[1]; day = +dm[2]; j++; }
      else if (dor) { month = +dor[1]; day = +dor[2]; dateLabel = lines[j]; timeTBD = true; j++; }
      else { i++; continue; }

      // 曜日「(土)」「(土or日)」「(水･祝)」など
      if (lines[j]?.startsWith('(') || lines[j]?.startsWith('（')) {
        if (dateLabel) dateLabel += ` ${lines[j]}`;
        j++;
      }
      // 注記「※1」
      while (lines[j]?.startsWith('※')) j++;

      let hh = null, mm = null;
      const tm = lines[j]?.match(TIME_RE);
      if (tm) { hh = +tm[1]; mm = +tm[2]; j++; }
      else if (lines[j] === '時刻未定') { timeTBD = true; j++; }
      // 「現地19:15／日本21:15」— 日本時間を採用
      else {
        const local = lines[j]?.match(/日本(\d{1,2}):(\d{2})/);
        if (local) { hh = +local[1]; mm = +local[2]; j++; }
      }

      if (lines[j] !== 'VS.') { i++; continue; }
      j++;
      const opponent = lines[j++] ?? '';
      // 海外クラブは次行に「（韓国）」等
      let country = null;
      const cm = lines[j]?.match(/^（(.+)）$/);
      if (cm) { country = cm[1]; j++; }

      // 結果（〇/●/△ のあと スコア - スコア）
      let score = null;
      if (/^[〇○●△]$/.test(lines[j] ?? '')) {
        const a = Number(lines[j + 1]); const b = Number(lines[j + 3]);
        // 公式ページは H/A に関わらず「柏のスコア」が先に並ぶ
        if (Number.isFinite(a) && Number.isFinite(b)) { score = { reysol: a, opponent: b }; j += 4; }
        const pk = lines[j]?.match(/^（PK\s*(\d+)-(\d+)）$/);
        if (pk) { score.note = `PK ${pk[1]}-${pk[2]}`; j++; }
      }

      // シーズンをまたぐので、1〜6月は翌年
      const year = month <= 6 ? Number(season.slice(0, 4)) + 1 : Number(season.slice(0, 4));
      const pad = (n) => String(n).padStart(2, '0');
      const date = `${year}-${pad(month)}-${pad(day)}`;

      out.push({
        competition: comp,
        round,
        home: ha === 'HOME',
        opponent,
        country,
        venue: VENUE_ALIASES[venueRaw] ?? venueRaw,
        date,
        kickoffAt: timeTBD || hh === null ? date : `${date}T${pad(hh)}:${pad(mm)}:00+09:00`,
        timeTBD: timeTBD || hh === null,
        dateLabel,
        status: score ? 'ft' : 'scheduled',
        score,
      });
      i = j;
      continue;
    }
    i++;
  }
  return { season, fixtures: out };
};

/* ── 順位表 ── */

const parseStandings = (html) => {
  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => m[0]);
  const out = [];
  for (const tr of rows) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (cells.length < 10) continue;
    const rank = Number(cells[0]);
    if (!Number.isFinite(rank)) continue;
    // 「ヴィッセル神戸 神戸」のように正式名＋略称が入る
    const name = cells[1].split(' ')[0];
    const n = (i) => Number(cells[i]);
    out.push({
      rank,
      name,
      points: n(2), played: n(3), won: n(4), drawn: n(5), lost: n(6),
      gf: n(7), ga: n(8), gd: n(9),
      form: (cells[10] ?? '').replace(/\s/g, '') || undefined,
    });
  }
  return out;
};

/* ── main ── */

const readJson = async (path) => {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return null; }
};

const writeJson = async (name, value) => {
  const path = join(OUT_DIR, name);
  const text = `${JSON.stringify(value, null, 2)}\n`;
  const prev = existsSync(path) ? await readFile(path, 'utf8') : null;
  if (prev === text) return false;
  if (!DRY) await writeFile(path, text, 'utf8');
  return true;
};

const main = async () => {
  if (!DRY) await mkdir(OUT_DIR, { recursive: true });
  const changed = [];
  const errors = [];

  try {
    const html = await fetchText(SOURCES.fixtures);
    const { season, fixtures } = parseFixtures(html);
    if (fixtures.length < 20) throw new Error(`解析結果が少なすぎます (${fixtures.length}件)`);
    console.log(`日程: ${fixtures.length}件 (season ${season})`);
    if (await writeJson('fixtures.json', { season, source: SOURCES.fixtures, fixtures })) changed.push('fixtures.json');
  } catch (e) {
    errors.push(`日程: ${e.message}`);
  }

  try {
    const html = await fetchText(SOURCES.standings);
    const table = parseStandings(html);
    if (table.length < 18) throw new Error(`解析結果が少なすぎます (${table.length}行)`);
    // ページに「第N節終了時点」の表記がないので、最も多いクラブの消化数を採る
    const counts = new Map();
    for (const r of table) counts.set(r.played, (counts.get(r.played) ?? 0) + 1);
    const played = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
    console.log(`順位表: ${table.length}クラブ（第${played}節終了時点）`);
    if (await writeJson('standings-j1.json', { source: SOURCES.standings, asOf: `第${played}節終了時点`, table })) changed.push('standings-j1.json');
  } catch (e) {
    errors.push(`順位表: ${e.message}`);
  }

  if (errors.length) {
    console.error('取得できなかったもの:');
    for (const e of errors) console.error(' -', e);
  }

  // 片方でも取れていれば取得時刻を更新する
  if (errors.length < 2) {
    const prev = await readJson(join(OUT_DIR, 'meta.json'));
    await writeJson('meta.json', {
      updatedAt: new Date().toISOString(),
      fixturesOk: !errors.some((e) => e.startsWith('日程')),
      standingsOk: !errors.some((e) => e.startsWith('順位表')),
      previousUpdatedAt: prev?.updatedAt ?? null,
    });
  }

  console.log(changed.length ? `更新: ${changed.join(', ')}` : '変更なし');
  if (errors.length === 2) process.exit(1); // 両方失敗したときだけ異常終了
};

await main();

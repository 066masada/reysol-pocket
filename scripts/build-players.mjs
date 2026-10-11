/**
 * 公式の選手プロフィールから経歴を取り出し、data/players.json に書き出す。
 * 移籍期間（夏・冬）にだけ手で実行する想定。
 *
 *   node scripts/build-players.mjs [--cache <dir>]
 *
 * 出典: 柏レイソル公式「選手一覧」https://www.reysol.co.jp/team/players/
 *   各選手ページの「経歴」（第3種〜第1種）を読む。
 *   今季ページがまだ無い選手は前シーズンのページで代用する。
 *
 * 期間はすべて "YYYY-MM"。高校・大学・ジュニアユースは公式に年が無いので、
 * 生年月日から卒業年を推定する（早生まれを考慮）。
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'players.json');
const SITE = 'https://www.reysol.co.jp';
const SEASON = '202627';
const FALLBACK_SEASONS = ['2026', '2025'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const cacheIdx = process.argv.indexOf('--cache');
const CACHE = cacheIdx > 0 ? process.argv[cacheIdx + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ja' } });
  if (!res.ok) return null;
  const text = await res.text();
  // 公式は 404 でも 200 で「File not found.」を返すことがある
  return text.includes('File not found.') ? null : text;
};

/** キャッシュ（--cache）があれば使い、無ければ1秒空けて取りにいく */
const getPage = async (name, url) => {
  const file = CACHE && join(CACHE, name);
  if (file && existsSync(file)) {
    const text = await readFile(file, 'utf8');
    if (!text.includes('File not found.')) return text;
  }
  await sleep(1000);
  const text = await fetchText(url);
  if (text && file) {
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, text);
  }
  return text;
};

const toLines = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

/* ── クラブ名 → ID ──
 * 上から順に当てる（「ソレッソ熊本」を「熊本」より先に、など）。
 * ID は src/data/clubs.ts / careerClubs.ts と揃える。
 */
const ORGS = [
  [/ソレッソ熊本/, null],
  [/グランパスみよし/, null],
  [/柏レイソル/, 'kashiwa'],
  [/鹿島アントラーズ/, 'kashima'],
  [/浦和レッズ/, 'urawa'],
  [/FC東京/, 'fctokyo'],
  [/東京ヴェルディ/, 'verdy'],
  [/町田ゼルビア/, 'machida'],
  [/川崎フロンターレ/, 'kawasaki'],
  [/マリノス/, 'yokohamafm'],
  [/横浜FC/, 'yokohamafc'],
  [/清水エスパルス/, 'shimizu'],
  [/名古屋グランパス/, 'nagoya'],
  [/京都サンガ/, 'kyoto'],
  [/ガンバ大阪/, 'gamba'],
  [/セレッソ大阪/, 'cerezo'],
  [/ヴィッセル神戸/, 'kobe'],
  [/サンフレッチェ広島/, 'hiroshima'],
  [/ファジアーノ岡山/, 'okayama'],
  [/アビスパ福岡/, 'fukuoka'],
  [/水戸ホーリーホック/, 'mito'],
  [/ファーレン長崎/, 'nagasaki'],
  [/ジェフユナイテッド千葉/, 'chiba'],
  [/FC今治/, 'imabari'],
  [/ロアッソ熊本/, 'kumamoto'],
  [/カマタマーレ讃岐/, 'sanuki'],
  [/松本山雅/, 'matsumoto'],
  [/カターレ富山/, 'toyama'],
  [/徳島ヴォルティス/, 'tokushima'],
  [/ギラヴァンツ北九州/, 'kitakyushu'],
  [/モンテディオ山形/, 'yamagata'],
  [/ザスパ/, 'gunma'],
  [/大宮アルディージャ/, 'omiya'],
  [/湘南ベルマーレ/, 'shonan'],
  [/アルビレックス新潟/, 'niigata'],
  [/FC琉球/, 'ryukyu'],
  [/サガン鳥栖/, 'tosu'],
  [/愛媛FC/, 'ehime'],
  [/大分トリニータ/, 'oita'],
  [/ツエーゲン金沢/, 'kanazawa'],
  [/栃木SC/, 'tochigi'],
  [/鹿児島ユナイテッド/, 'kagoshima'],
  [/藤枝MYFC/, 'fujieda'],
  [/ベガルタ仙台/, 'sendai'],
  [/コンサドーレ札幌/, 'sapporo'],
  [/Honda FC/, 'honda'],
  [/ウニオン/, 'unionberlin'],
  [/ブラウンシュバイク/, 'braunschweig'],
  [/ボアヴィスタ/, 'boavista'],
  [/オネハンガ/, 'onehunga'],
  [/JFAアカデミー福島/, 'jfaacademy'],
  [/三菱養和/, 'yowa'],
];

const orgOf = (name) => {
  for (const [re, id] of ORGS) if (re.test(name)) return id;
  return null;
};

/** アカデミーの区分（U-18 / ユース / Jrユース など）を短く */
const academySuffix = (name) => {
  const m = name.match(/(U-\d+[^（]*|Jrユース|ジュニアユース|ユース|プライマリー|A\.A\.TOR'82)$/);
  if (!m) return '';
  return m[1].replace('ジュニアユース', 'Jrユース');
};

/** 学校名を短く（県立など） */
const SCHOOL_ALIASES = { 船橋市立船橋高: '市立船橋高', 柏日体高: '日本体育大柏高' };
const shortSchool = (name) => SCHOOL_ALIASES[name] ?? name.replace(/^.+?[都道府県]立/, '');

/* ── 期間 ── */

const ym = (y, m) => `${y}-${String(m).padStart(2, '0')}`;

/** 高校を卒業する年（3月）。4〜12月生まれは 生年+19、1〜3月生まれは +18 */
const gradYear = (born) => {
  const [y, m] = born.split('-').map(Number);
  return y + (m >= 4 ? 19 : 18);
};

/** 「（…）」の外側と内側に分ける。内側にさらに括弧があっても最後の「）」まで */
const splitNote = (s) => {
  const i = s.indexOf('（');
  if (i < 0) return { name: s.trim(), note: null };
  const j = s.lastIndexOf('）');
  return { name: s.slice(0, i).trim(), note: s.slice(i + 1, j > i ? j : undefined).trim() };
};

/** 'YY[/M|/YY][-YY] の頭を読む。'26/27 のような秋春シーズンは7月始まりとみなす */
const parseProHead = (tok) => {
  const m = tok.match(/^'(\d{2})(?:\/(\d{1,2}))?(?:-(\d{2}))?(.*)$/);
  if (!m) return null;
  const year = 2000 + Number(m[1]);
  const mm = m[2] ? Number(m[2]) : null;
  const month = mm === null ? 1 : mm > 12 ? 7 : mm;
  return { from: ym(year, month), rest: m[4] };
};

const COUNTRY = /(ドイツ|ポルトガル|ニュージーランド|スペイン|ベルギー|オランダ|タイ|韓国)/;

const isSecondReg = (note) => /第2種登録/.test(note ?? '');

/** 1種の1トークン → 在籍 */
const parseFirstCategory = (tok, born) => {
  const head = parseProHead(tok);
  if (head) {
    const { name, note } = splitNote(head.rest);
    return {
      org: orgOf(name), label: name, kind: 'pro', from: head.from,
      // 後から完全移籍したものは期限付き扱いにしない
      ...(note && /期限付き/.test(note) && !/完全移籍/.test(note) ? { loan: true } : {}),
      ...(note && COUNTRY.test(note) ? { country: note.match(COUNTRY)[1] } : {}),
      ...(note ? { note } : {}),
      secondReg: isSecondReg(note),
    };
  }
  // 大学（年が書かれていない）
  const { name, note } = splitNote(tok);
  return {
    org: null, label: name, kind: 'univ', from: ym(gradYear(born), 4),
    ...(note ? { note } : {}),
    secondReg: false,
  };
};

/**
 * 公式の経歴に柏への加入がまだ書かれていない選手の補い（背番号 → 1種に足すトークン）。
 * 年度別成績から推定したもの。公式が直ったら消す。
 */
const PATCH = {
  // 2026/27 は町田で2試合出場後に加入
  15: "'26/8柏レイソル",
};

const parseCareer = (lines, born, no) => {
  const i = lines.indexOf('経歴');
  const j = lines.indexOf('CAREER');
  const text = lines.slice(i + 1, j).join(' ');
  const part = (n) => {
    const m = text.match(new RegExp(`（第${n}種）\\s*(.*?)(?=\\s*（第\\d種）|$)`));
    return m ? m[1].trim() : '';
  };
  const raw = { jy: part(3), youth: part(2), pro: part(1) };
  const g = gradYear(born);
  const stints = [];

  // 第3種: 複数あれば最後（いちばん上のカテゴリ）を採る
  if (raw.jy) {
    const last = raw.jy.split('－').pop();
    const { name } = splitNote(last);
    const org = orgOf(name);
    stints.push({
      org, label: org ? name : shortSchool(name), kind: 'jy',
      from: ym(g - 6, 4), fixedTo: ym(g - 3, 4),
    });
  }

  // 第2種: 先頭がユース／高校。後ろに続く「第2種登録」は捨てる
  if (raw.youth) {
    const [first] = raw.youth.split('－');
    const { name, note } = splitNote(first);
    const org = orgOf(name);
    stints.push({
      org, label: org ? name : shortSchool(name), kind: org ? 'youth' : 'school',
      from: ym(g - 3, 4), fixedTo: ym(g, 4),
      ...(note ? { note: shortSchool(note) } : {}),
    });
  }

  // 第1種
  const proText = [raw.pro, PATCH[no]].filter(Boolean).join('－');
  const pros = proText ? proText.split('－').map((t) => parseFirstCategory(t.trim(), born)) : [];
  // 第2種登録はユース在籍中のこと。トップ昇格後の在籍があれば捨て、無ければ「登録中」の印だけ残す
  const regs = pros.filter((p) => p.secondReg);
  for (const p of pros) {
    if (p.secondReg) continue;
    // 期限付き → 同じクラブへ完全移籍 は1つにまとめる
    const prev = stints[stints.length - 1];
    if (prev && prev.kind === 'pro' && prev.org && prev.org === p.org) {
      prev.note = [prev.note, p.note].filter(Boolean).join('、') || undefined;
      continue;
    }
    stints.push(p);
  }

  // 終わり = 次の在籍の始まり（ユース等は推定の卒業時期と早い方）
  for (let k = 0; k < stints.length; k++) {
    const next = stints[k + 1]?.from ?? null;
    const fixed = stints[k].fixedTo ?? null;
    let to = next && fixed ? (next < fixed ? next : fixed) : next ?? fixed;
    // 卒業が未来なら在籍中
    if (to && to > NOW) to = null;
    stints[k].to = to;
    delete stints[k].fixedTo;
    delete stints[k].secondReg;
  }

  // 特別指定（大学在籍のまま柏に登録）
  const lastStint = stints[stints.length - 1];
  const designated = lastStint?.kind === 'univ' && lastStint.to === null && /柏レイソル.*特別指定/.test(lastStint.note ?? '');
  const secondReg = regs.some((r) => r.org === 'kashiwa') && lastStint?.kind === 'youth' && lastStint.to === null;

  // 2種登録・特別指定の選手は、その登録時期を柏への加入とする
  const designatedAt = designated ? lastStint.note.match(/'(\d{2})(?:-\d{2})?(?:\/(\d{1,2}))?柏レイソル/) : null;
  const joined = secondReg ? regs.find((r) => r.org === 'kashiwa').from
    : designatedAt ? ym(2000 + Number(designatedAt[1]), Number(designatedAt[2] ?? 1)) : null;

  return { raw, stints, joined, status: designated ? 'designated' : secondReg ? 'secondReg' : 'pro' };
};

const NOW = ym(new Date().getFullYear(), new Date().getMonth() + 1);

/** 年度によって「ミッドフィールダー」と書かれることもある */
const toPos = (s) => /ゴール/.test(s) ? 'GK' : /ディフェン/.test(s) ? 'DF' : /ミッド/.test(s) ? 'MF' : /フォワード/.test(s) ? 'FW' : s;

const parseBorn = (s) => {
  const m = s?.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null;
};

/** 柏に（今回）加入した時期。最後の柏の在籍の始まり */
const joinedAt = (p) => {
  for (let k = p.stints.length - 1; k >= 0; k--) {
    const s = p.stints[k];
    if (s.org === 'kashiwa' && (s.kind === 'pro' || s.kind === 'youth')) return s.from;
    if (s.org !== 'kashiwa') break;
  }
  const last = p.stints[p.stints.length - 1];
  return last?.from ?? null;
};

const main = async () => {
  const listHtml = await getPage('players.html', `${SITE}/team/players/`);
  if (!listHtml) throw new Error('選手一覧を取得できませんでした');
  const nums = [...new Set([...listHtml.matchAll(new RegExp(`/team/players/${SEASON}/(\\d+)\\.php`, 'g'))].map((m) => m[1]))];

  const players = [];
  for (const n of nums) {
    let html = await getPage(`p${n}.html`, `${SITE}/team/players/${SEASON}/${n}.php`);
    let source = `${SITE}/team/players/${SEASON}/${n}.php`;
    for (const s of FALLBACK_SEASONS) {
      if (html) break;
      source = `${SITE}/team/players/${s}/${n}.php`;
      html = await fetchText(source);
      await sleep(1000);
    }
    if (!html) { console.warn(`#${n}: プロフィールが見つかりません`); continue; }

    const lines = toLines(html);
    const val = (k) => lines[lines.indexOf(k) + 1];
    const born = parseBorn(val('生年月日'));
    if (!born) { console.warn(`#${n}: 生年月日を読めません`); continue; }
    const { raw, stints, joined, status } = parseCareer(lines, born, Number(n));
    const player = {
      no: Number(n),
      name: val('名前'),
      pos: toPos(val('ポジション')),
      born,
      hometown: val('出身地'),
      status,
      stints,
      raw,
      source,
    };
    player.joined = joined ?? joinedAt(player);
    players.push(player);
    console.log(`#${n} ${player.name}: ${stints.map((s) => `${s.label}${s.to ? '' : '…'}`).join(' → ')}`);
  }

  players.sort((a, b) => a.no - b.no);
  const out = { season: '2026-27', source: `${SITE}/team/players/`, generatedAt: new Date().toISOString(), players };
  await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`\n${players.length}人 → data/players.json`);
};

main().catch((e) => { console.error(e); process.exit(1); });

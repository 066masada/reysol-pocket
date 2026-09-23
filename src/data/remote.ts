import type { CompetitionId, Fixture, StandingRow, StandingsSnapshot, StandingsTable } from '../types';
import { CLUB_LIST, KASHIWA_ID } from './clubs';
import { STADIUMS } from './stadiums';
import { FIXTURES } from './schedule';
import { J1_STANDINGS } from './standings';

/**
 * GitHub Actions が1日2回、公式ページから取得して data/*.json に書き出したものを読む。
 * 取得できないときは同梱データ（schedule.ts / standings.ts）のまま動く。
 */
const BASE =
  (import.meta.env.VITE_DATA_BASE as string | undefined)?.replace(/\/$/, '') ??
  'https://raw.githubusercontent.com/066masada/reysol-pocket/main/data';

export interface RemoteFixture {
  competition: CompetitionId;
  round: string;
  home: boolean;
  opponent: string;
  country: string | null;
  venue: string;
  date: string;
  kickoffAt: string;
  timeTBD: boolean;
  dateLabel: string | null;
  status: 'scheduled' | 'ft';
  /** 公式ページの並びに合わせ、柏のスコアが reysol */
  score: { reysol: number; opponent: number; note?: string } | null;
}

interface RemoteStandings {
  asOf: string;
  source: string;
  table: (Omit<StandingRow, 'clubId'> & { name: string; gd: number; form?: string })[];
}

export interface RemoteData {
  fixtures: Fixture[];
  standings: StandingsTable | null;
  history: StandingsSnapshot[];
  updatedAt: string | null;
}

/* ── クラブ名・会場名 → ID ── */

const CLUB_BY_NAME = new Map<string, string>();
for (const c of CLUB_LIST) {
  CLUB_BY_NAME.set(normalize(c.name), c.id);
  CLUB_BY_NAME.set(normalize(c.short), c.id);
}
/** 公式ページ・Jリーグ公式での表記ゆれ */
for (const [alias, id] of [
  ['V・ファーレン長崎', 'nagasaki'], ['Vファーレン長崎', 'nagasaki'],
  ['横浜F・マリノス', 'yokohamafm'], ['横浜Fマリノス', 'yokohamafm'],
  ['京都サンガF.C.', 'kyoto'], ['京都サンガFC', 'kyoto'],
  ['大田ハナ・シチズン', 'daejeon'], ['ニューカッスル・ジェッツ', 'newcastle'],
  ['コンアン・ハノイ', 'conganhanoi'], ['ブリーラム・ユナイテッド', 'buriram'],
  ['ジェフユナイテッド千葉', 'chiba'], ['ジェフユナイテッド市原・千葉', 'chiba'],
] as const) CLUB_BY_NAME.set(normalize(alias), id);

const STADIUM_BY_NAME = new Map<string, string>();
for (const s of Object.values(STADIUMS)) {
  STADIUM_BY_NAME.set(normalize(s.name), s.id);
  STADIUM_BY_NAME.set(normalize(s.short), s.id);
}
for (const [alias, id] of [
  ['柏サッカースタジアム', 'sankyo'], ['三協F柏', 'sankyo'], ['三協フロンテア柏', 'sankyo'],
  ['MUFG国立', 'kokuritsu'], ['国立', 'kokuritsu'],
  ['Gスタ', 'machida'], ['メルスタ', 'kashima'], ['アイスタ', 'iai'],
  ['ハナサカ', 'yanmar'], ['サンガS', 'sanga'], ['味スタ', 'ajinomoto'],
  ['パナスタ', 'panasonic'], ['ノエスタ', 'noevir'], ['Eピース', 'edion'],
  ['JFEス', 'jfe'], ['ベススタ', 'best'], ['水戸信ス', 'mito'], ['ピースタ', 'peace'],
  ['U等々力', 'todoroki'], ['日産ス', 'nissan'], ['埼玉', 'saitama'], ['フクアリ', 'fukuari'],
  ['全州ワールドカップスタジアム', 'jeonju'], ['ラーチャブリースタジアム', 'ratchaburi'],
  ['セントラルコーストスタジアム', 'centralcoast'], ['浦項スティールヤード', 'pohang'],
] as const) STADIUM_BY_NAME.set(normalize(alias), id);

/** 中黒・全角英数・空白などの揺れを吸収する */
function normalize(s: string): string {
  return s
    .replace(/[・･·]/g, '')
    .replace(/[．.]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s/g, '')
    .toUpperCase();
}

const clubId = (name: string) => CLUB_BY_NAME.get(normalize(name)) ?? name;
const stadiumId = (venue: string) => STADIUM_BY_NAME.get(normalize(venue));

/* ── マージ ── */

/** 大会 + 節 は1シーズン内で一意 */
const keyOf = (competition: string, round: string) => `${competition}|${normalize(round)}`;

/**
 * 同梱データを土台に、取得したデータで「日時・会場・結果」を上書きする。
 * チケット販売日・スタメンURL・注記など公式ページにない情報は同梱データを残す。
 */
export const mergeFixtures = (remote: RemoteFixture[], bundled: Fixture[] = FIXTURES): Fixture[] => {
  const byKey = new Map(bundled.map((f) => [keyOf(f.competition, f.round), f]));
  // 節の表記ゆれ（「第31回」と「第31回 ちばぎんカップ」など）に備えた日付での照合
  const byDate = new Map(bundled.map((f) => [`${f.competition}|${f.kickoffAt.slice(0, 10)}`, f]));
  const used = new Set<string>();
  const merged: Fixture[] = [];

  for (const r of remote) {
    const key = keyOf(r.competition, r.round);
    const base = byKey.get(key) ?? byDate.get(`${r.competition}|${r.date}`);
    if (base) used.add(keyOf(base.competition, base.round));

    const opp = clubId(r.opponent);
    const st = stadiumId(r.venue) ?? base?.stadiumId;
    const score = r.score
      ? {
          home: r.home ? r.score.reysol : r.score.opponent,
          away: r.home ? r.score.opponent : r.score.reysol,
          ...(r.score.note ? { note: r.score.note } : {}),
        }
      : undefined;

    merged.push({
      // 同梱データの手入力分（チケット・スタメンURL・注記）を引き継ぐ
      ...base,
      id: base?.id ?? `${r.date}-${r.competition}-${normalize(r.round)}`,
      competition: r.competition,
      round: r.round,
      kickoffAt: r.kickoffAt,
      timeTBD: r.timeTBD,
      dateLabel: r.dateLabel ?? undefined,
      home: r.home ? KASHIWA_ID : opp,
      away: r.home ? opp : KASHIWA_ID,
      stadiumId: st,
      status: r.status,
      score,
    });
  }

  // 公式ページから消えた試合（中止・表示外）も同梱データにあれば残す
  for (const f of bundled) {
    if (!used.has(keyOf(f.competition, f.round))) merged.push(f);
  }
  return merged;
};

export const mergeStandings = (remote: RemoteStandings): StandingsTable => ({
  ...J1_STANDINGS,
  asOf: remote.asOf,
  updatedAt: new Date().toISOString().slice(0, 10),
  sourceUrl: remote.source,
  rows: remote.table.map((r) => ({
    rank: r.rank,
    clubId: clubId(r.name),
    played: r.played, won: r.won, drawn: r.drawn, lost: r.lost,
    gf: r.gf, ga: r.ga, points: r.points,
  })),
});

/* ── 取得 ── */

const getJson = async <T>(name: string, signal: AbortSignal): Promise<T | null> => {
  try {
    const res = await fetch(`${BASE}/${name}`, { signal, cache: 'no-cache' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

export const fetchRemoteData = async (signal: AbortSignal): Promise<RemoteData> => {
  const [fx, std, hist, meta] = await Promise.all([
    getJson<{ fixtures: RemoteFixture[] }>('fixtures.json', signal),
    getJson<RemoteStandings>('standings-j1.json', signal),
    getJson<{ snapshots: StandingsSnapshot[] }>('standings-history.json', signal),
    getJson<{ updatedAt: string }>('meta.json', signal),
  ]);
  return {
    fixtures: fx?.fixtures?.length ? mergeFixtures(fx.fixtures) : FIXTURES,
    standings: std?.table?.length ? mergeStandings(std) : null,
    history: hist?.snapshots ?? [],
    updatedAt: meta?.updatedAt ?? null,
  };
};

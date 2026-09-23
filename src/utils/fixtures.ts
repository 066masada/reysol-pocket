import type { Fixture, TicketSale, TicketSaleType } from '../types';
import { KASHIWA_ID } from '../data/clubs';
import { getFixtures } from '../data/store';
import { isSameDay, MATCH_WINDOW_MS, parseKickoff } from '../utils/date';

export type HomeAway = 'H' | 'A';

export const isHome = (f: Fixture) => f.home === KASHIWA_ID;
export const homeAway = (f: Fixture): HomeAway => (isHome(f) ? 'H' : 'A');
export const opponentId = (f: Fixture) => (isHome(f) ? f.away : f.home);

export type Outcome = 'W' | 'D' | 'L';

export const outcome = (f: Fixture): Outcome | null => {
  if (!f.score) return null;
  const us = isHome(f) ? f.score.home : f.score.away;
  const them = isHome(f) ? f.score.away : f.score.home;
  if (us > them) return 'W';
  if (us < them) return 'L';
  return 'D';
};

/** 柏視点のスコア文字列 "2-1"（柏のスコアを先に） */
export const scoreForKashiwa = (f: Fixture) => {
  if (!f.score) return '';
  const us = isHome(f) ? f.score.home : f.score.away;
  const them = isHome(f) ? f.score.away : f.score.home;
  return `${us}-${them}`;
};

export const kickoffDate = (f: Fixture) => parseKickoff(f.kickoffAt);

export const sortedFixtures = (): Fixture[] =>
  [...getFixtures()].sort((a, b) => kickoffDate(a).getTime() - kickoffDate(b).getTime());

/** 現在時刻を基準に「試合中」かどうか（Phase 1 は時刻ベースの推定） */
export const isInMatchWindow = (f: Fixture, now: Date) => {
  if (f.timeTBD || f.status === 'ft' || f.status === 'postponed') return false;
  const t = kickoffDate(f).getTime();
  return now.getTime() >= t && now.getTime() <= t + MATCH_WINDOW_MS;
};

/** 次の試合（試合中を含む） */
export const nextFixture = (now: Date = new Date()): Fixture | undefined => {
  const list = sortedFixtures();
  const live = list.find((f) => isInMatchWindow(f, now));
  if (live) return live;
  return list.find((f) => {
    if (f.status === 'ft') return false;
    const t = kickoffDate(f).getTime();
    // 日付のみの試合は当日の終わりまで「次」とみなす
    const end = f.timeTBD ? t + 24 * 60 * 60 * 1000 : t + MATCH_WINDOW_MS;
    return end >= now.getTime();
  });
};

export const recentResults = (n: number): Fixture[] =>
  sortedFixtures().filter((f) => f.status === 'ft').slice(-n).reverse();

/** J1 の通算成績（勝・分・敗・得点・失点） */
export const j1Record = () => recordFor('j1').total;

export type TicketState = 'onsale' | 'presale' | 'lottery' | 'upcoming' | 'none';

export const SALE_LABEL: Record<TicketSaleType, string> = {
  lottery: 'プレリク先行（抽選）',
  first: '一次販売',
  second: '二次販売',
  third: '三次販売（一般）',
};

export const SALE_SHORT: Record<TicketSaleType, string> = {
  lottery: '抽選', first: '一次', second: '二次', third: '一般',
};

export const SALE_COLOR: Record<TicketSaleType, string> = {
  lottery: '#7A6CA8', first: '#1B4F9C', second: '#3E8FD0', third: '#E5C700',
};

const saleTime = (s: TicketSale) => new Date(s.at).getTime();

/** すでに始まっている販売のうち、いちばん後の段階 */
export const currentSale = (f: Fixture, now: Date = new Date()): TicketSale | undefined => {
  if (!f.ticketSales?.length) return undefined;
  const started = f.ticketSales.filter((s) => saleTime(s) <= now.getTime());
  return started.length ? started[started.length - 1] : undefined;
};

/** 次に始まる販売 */
export const nextSale = (f: Fixture, now: Date = new Date()): TicketSale | undefined =>
  f.ticketSales?.find((s) => saleTime(s) > now.getTime());

export const ticketState = (f: Fixture, now: Date = new Date()): TicketState => {
  if (!f.ticketUrl || f.status === 'ft') return 'none';
  const cur = currentSale(f, now);
  if (cur) {
    if (cur.type === 'third') return 'onsale';
    if (cur.type === 'lottery') return 'lottery';
    return 'presale';
  }
  if (f.ticketSales?.length) return 'upcoming';
  return 'onsale'; // 販売日程が未発表のホーム戦はリンクのみ
};

export const TICKET_STATE_LABEL: Record<Exclude<TicketState, 'none'>, string> = {
  onsale: '発売中',
  presale: '先行発売中',
  lottery: '抽選受付中',
  upcoming: '発売前',
};

/* ── 販売スケジュール（カレンダー・一覧用） ── */
export interface SaleEvent { fixture: Fixture; sale: TicketSale; at: Date; id: string }

export const saleEvents = (): SaleEvent[] =>
  sortedFixtures()
    .filter((f) => f.ticketSales?.length)
    .flatMap((f) => f.ticketSales!.map((sale) => ({
      fixture: f, sale, at: new Date(sale.at), id: `${f.id}-${sale.type}`,
    })))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

/** これから始まる販売（近い順） */
export const upcomingSales = (now: Date = new Date()) =>
  saleEvents().filter((e) => e.at.getTime() > now.getTime() && e.fixture.status !== 'ft');

/** 販売日程がまだ出ていないホーム戦 */
export const salesUnannounced = (now: Date = new Date()) =>
  sortedFixtures().filter((f) =>
    f.ticketUrl && !f.ticketSales?.length && f.status !== 'ft' && kickoffDate(f).getTime() > now.getTime());

/* ── 大会別の成績 ── */
export interface TeamRecord {
  played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number;
}

const emptyRecord = (): TeamRecord => ({ played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 });

const addToRecord = (rec: TeamRecord, f: Fixture) => {
  if (!f.score) return;
  const us = isHome(f) ? f.score.home : f.score.away;
  const them = isHome(f) ? f.score.away : f.score.home;
  rec.played++; rec.gf += us; rec.ga += them;
  if (us > them) { rec.won++; rec.points += 3; }
  else if (us < them) rec.lost++;
  else { rec.drawn++; rec.points += 1; }
};

export const recordFor = (competition: Fixture['competition']) => {
  const total = emptyRecord(); const home = emptyRecord(); const away = emptyRecord();
  for (const f of sortedFixtures()) {
    if (f.competition !== competition || f.status !== 'ft') continue;
    addToRecord(total, f);
    addToRecord(isHome(f) ? home : away, f);
  }
  return { total, home, away };
};

/** 直近 n 試合のフォーム（古い→新しい） */
export const formFor = (competition: Fixture['competition'], n = 5): { f: Fixture; o: Outcome }[] =>
  sortedFixtures()
    .filter((f) => f.competition === competition && f.status === 'ft')
    .slice(-n)
    .map((f) => ({ f, o: outcome(f)! }));

export const fixturesFor = (competition: Fixture['competition']) =>
  sortedFixtures().filter((f) => f.competition === competition);

/* ── 試合当日モード ── */
export type MatchPhase = 'none' | 'today' | 'soon' | 'live' | 'justFinished';

const HOURS = 60 * 60 * 1000;

/**
 * 直近の試合が今どの局面かを返す。
 * today: 当日（キックオフ3時間以上前） / soon: 3時間前〜 / live: 試合中 / justFinished: 終了後3時間
 */
export const matchPhase = (f: Fixture | undefined, now: Date): MatchPhase => {
  if (!f || f.timeTBD) return 'none';
  const t = kickoffDate(f).getTime();
  const n = now.getTime();
  if (n < t) return isSameDay(kickoffDate(f), now) ? (t - n <= 3 * HOURS ? 'soon' : 'today') : 'none';
  if (n <= t + MATCH_WINDOW_MS) return 'live';
  if (n <= t + MATCH_WINDOW_MS + 3 * HOURS) return 'justFinished';
  return 'none';
};

/** 当日モードの対象となる試合（直前の試合 or 次の試合） */
export const focusFixture = (now: Date): Fixture | undefined => {
  const list = sortedFixtures();
  const recent = [...list].reverse().find((f) => {
    if (f.timeTBD) return false;
    const t = kickoffDate(f).getTime();
    return t <= now.getTime() && now.getTime() <= t + MATCH_WINDOW_MS + 3 * HOURS;
  });
  return recent ?? nextFixture(now);
};

/* ── 連勝・連敗などの記録 ── */
export interface Streak {
  /** 現在の連続記録 */
  kind: Outcome | null;
  count: number;
  /** 無敗（勝ち＋引き分け）の連続 */
  unbeaten: number;
  /** ホーム戦の連勝 */
  homeWins: number;
  /** 連続無失点 */
  cleanSheets: number;
}

/** 大会をまたいだ直近からの連続記録（新しい順に遡る） */
export const currentStreak = (): Streak => {
  const done = sortedFixtures().filter((f) => f.status === 'ft').reverse();
  const res = done.map((f) => ({ f, o: outcome(f) }));
  const first = res[0]?.o ?? null;

  let count = 0;
  for (const r of res) { if (r.o !== first) break; count++; }

  let unbeaten = 0;
  for (const r of res) { if (r.o === 'L') break; unbeaten++; }

  let homeWins = 0;
  for (const r of res.filter((x) => isHome(x.f))) { if (x_isWin(r.o)) homeWins++; else break; }

  let cleanSheets = 0;
  for (const r of res) {
    const conceded = r.f.score ? (isHome(r.f) ? r.f.score.away : r.f.score.home) : 1;
    if (conceded > 0) break;
    cleanSheets++;
  }

  return { kind: first, count, unbeaten, homeWins, cleanSheets };
};

const x_isWin = (o: Outcome | null) => o === 'W';

/** 試合後に出す一言（連勝・勝ち上がりなど） */
export const postMatchNotes = (f: Fixture): string[] => {
  const notes: string[] = [];
  const o = outcome(f);
  if (!o) return notes;

  const s = currentStreak();
  if (o === 'W') {
    if (f.competition === 'emperor' || f.competition === 'levain') notes.push(`${f.round}突破`);
    if (s.kind === 'W' && s.count >= 2) notes.push(`${s.count}連勝`);
    if (isHome(f) && s.homeWins >= 2) notes.push(`ホーム${s.homeWins}連勝`);
  } else if (o === 'L') {
    if (s.kind === 'L' && s.count >= 2) notes.push(`${s.count}連敗`);
  } else if (s.unbeaten >= 3) {
    notes.push(`${s.unbeaten}試合無敗`);
  }
  if (s.cleanSheets >= 2) notes.push(`${s.cleanSheets}試合連続無失点`);
  if (o !== 'L' && s.unbeaten >= 4 && !notes.some((n) => n.includes('無敗'))) {
    notes.push(`${s.unbeaten}試合無敗`);
  }
  return notes.slice(0, 3);
};

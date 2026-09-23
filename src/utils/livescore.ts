/**
 * 試合中のスコアを取得する。
 *
 * 出典: TheSportsDB のライブスコア（無料・キー不要・CORS許可）
 *   https://www.thesportsdb.com/api/v1/json/3/livescore.php?s=Soccer
 *
 * 進行中の試合だけが返るので、柏が含まれる1件を拾う。
 * 取得できないときは null を返し、画面は通常表示のままにする。
 */

const URL = 'https://www.thesportsdb.com/api/v1/json/3/livescore.php?s=Soccer';

/** 相手の英語表記が分からなくても拾えるよう、柏の名前で照合する */
const KASHIWA = /kashiwa/i;

export type LiveStatus = '1H' | 'HT' | '2H' | 'ET' | 'PEN' | 'FT' | 'NS' | 'OTHER';

export interface LiveScore {
  /** 柏の得点 */
  reysol: number;
  /** 相手の得点 */
  opponent: number;
  /** 柏がホームか */
  home: boolean;
  /** 経過（分）。取得できなければ null */
  minute: number | null;
  status: LiveStatus;
  /** 相手の英語表記（照合の確認用） */
  opponentName: string;
  /** 取得した時刻 */
  fetchedAt: number;
}

interface RawEvent {
  strHomeTeam?: string; strAwayTeam?: string;
  intHomeScore?: string | number | null; intAwayScore?: string | number | null;
  strStatus?: string; strProgress?: string | number | null;
}

const toStatus = (s: string | undefined): LiveStatus => {
  const v = (s ?? '').toUpperCase();
  if (v === '1H' || v === '2H' || v === 'HT' || v === 'ET' || v === 'PEN' || v === 'FT' || v === 'NS') return v;
  return 'OTHER';
};

const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const STATUS_LABEL: Record<LiveStatus, string> = {
  '1H': '前半', HT: 'ハーフタイム', '2H': '後半', ET: '延長', PEN: 'PK戦',
  FT: '試合終了', NS: 'まもなく', OTHER: '進行中',
};

export const fetchLiveScore = async (signal?: AbortSignal): Promise<LiveScore | null> => {
  try {
    const res = await fetch(URL, { signal, cache: 'no-store' });
    if (!res.ok) return null;
    const json = (await res.json()) as { livescore?: RawEvent[] | null };
    const events = json.livescore ?? [];

    const e = events.find((x) => KASHIWA.test(x.strHomeTeam ?? '') || KASHIWA.test(x.strAwayTeam ?? ''));
    if (!e) return null;

    const home = KASHIWA.test(e.strHomeTeam ?? '');
    const h = num(e.intHomeScore) ?? 0;
    const a = num(e.intAwayScore) ?? 0;

    return {
      reysol: home ? h : a,
      opponent: home ? a : h,
      home,
      minute: num(e.strProgress),
      status: toStatus(e.strStatus),
      opponentName: (home ? e.strAwayTeam : e.strHomeTeam) ?? '',
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
};

/* ── 大会 ── */
export type CompetitionId = 'j1' | 'levain' | 'emperor' | 'acle' | 'preseason';

export interface Competition {
  id: CompetitionId;
  name: string;        // 明治安田J1リーグ
  short: string;       // J1
  color: string;       // チップ・ストライプ色
  textOnColor: string; // チップ文字色
  broadcast: BroadcastId[];
}

/* ── 配信 ── */
export type BroadcastId = 'dazn' | 'abema';

export interface Broadcast {
  id: BroadcastId;
  name: string;
  url: string;
}

/* ── クラブ ── */
export type Division = 'j1' | 'j2' | 'j3' | 'other';

export interface Club {
  id: string;
  name: string;      // 正式名
  short: string;     // 略称（3〜5文字）
  color: string;     // クラブカラー
  textOnColor?: string;
  division: Division;
  stadiumId?: string;
  boardSlug?: string; // bm.best-hit.tv/{slug}/
  country?: string;   // 海外クラブ
}

/* ── スタジアム ── */
export interface Stadium {
  id: string;
  name: string;      // 正式名
  short: string;     // 略称（三協F柏）
  address: string;
  lat: number;
  lng: number;
  access?: string;   // 最寄駅・アクセス
  note?: string;
}

/* ── 試合 ── */
export type MatchStatus = 'scheduled' | 'live' | 'ft' | 'postponed';

export interface Score { home: number; away: number; note?: string }

export interface Fixture {
  id: string;
  competition: CompetitionId;
  round: string;               // 第1節 / 1stラウンド4回戦 / LS-MD1
  /** ISO 8601 (JST)。時刻未定は日付のみ ('2027-02-13') */
  kickoffAt: string;
  /** 「2/13 or 14」など日程未確定の表示用 */
  dateLabel?: string;
  timeTBD?: boolean;
  home: string;                // clubId
  away: string;                // clubId
  stadiumId?: string;
  status: MatchStatus;
  score?: Score;
  ticketUrl?: string;
  /** 販売スケジュール（公式の発表どおり、開始が早い順） */
  ticketSales?: TicketSale[];
  note?: string;
  officialUrl?: string;
  /** スポーツナビの試合ページ（スタメン・スタッツ）。未設定ならチームページへ */
  lineupUrl?: string;
}

/* ── チケット販売 ── */
export type TicketSaleType = 'lottery' | 'first' | 'second' | 'third';

export interface TicketSale {
  type: TicketSaleType;
  /** 受付・販売の開始 ISO datetime */
  at: string;
  /** 抽選受付の締切など */
  until?: string;
  note?: string;
}

/** 順位表のスナップショット（順位推移用） */
export interface StandingsSnapshot {
  asOf: string;
  date: string;
  table: { rank: number; name: string; points: number; played: number }[];
}

export interface Board {
  slug: string;
  name: string;      // クラブ名 / 総合名
  clubId?: string;
  division: Division | 'japan' | 'general';
}

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  description?: string;
  group: 'official' | 'ticket' | 'stream' | 'board' | 'sns';
}

/* ── 順位表（Phase 1 は手動更新のスナップショット） ── */
export interface StandingRow {
  rank: number;
  clubId: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number;
}

export interface StandingsTable {
  competition: CompetitionId;
  title: string;        // 明治安田J1リーグ / ACLE 東地区
  asOf: string;         // 第8節終了時点
  updatedAt: string;    // ISO date
  sourceUrl: string;
  /** この順位以上が次ラウンド進出（区切り線を引く） */
  qualifyRank?: number;
  /** この順位以下が降格（区切り線を引く） */
  relegateRank?: number;
  rows: StandingRow[];
}

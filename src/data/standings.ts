import type { StandingRow, StandingsTable } from '../types';

/**
 * 順位表スナップショット（Phase 1 は手動更新。Phase 2 で API から自動同期予定）
 */

const row = (
  rank: number, clubId: string, played: number, won: number, drawn: number, lost: number, gf: number, ga: number,
): StandingRow => ({ rank, clubId, played, won, drawn, lost, gf, ga, points: won * 3 + drawn });

/** 出典: Jリーグ公式 https://www.jleague.jp/standings/j1/ （2026-09-20 第8節終了時点） */
export const J1_STANDINGS: StandingsTable = {
  competition: 'j1',
  title: '明治安田J1リーグ',
  asOf: '第8節終了時点',
  updatedAt: '2026-09-20',
  sourceUrl: 'https://www.jleague.jp/standings/j1/',
  relegateRank: 18,
  rows: [
    row(1,  'kobe',       8, 6, 1, 1, 12, 5),
    row(2,  'kashiwa',    8, 6, 0, 2, 17, 12),
    row(3,  'hiroshima',  8, 5, 2, 1, 20, 6),
    row(4,  'machida',    8, 5, 2, 1, 21, 10),
    row(5,  'fctokyo',    8, 5, 2, 1, 14, 8),
    row(6,  'yokohamafm', 8, 4, 2, 2, 13, 9),
    row(7,  'kawasaki',   8, 3, 4, 1, 16, 12),
    row(8,  'kashima',    8, 4, 1, 3, 17, 16),
    row(9,  'okayama',    8, 4, 1, 3, 11, 10),
    row(10, 'urawa',      8, 4, 0, 4, 16, 18),
    row(11, 'cerezo',     8, 3, 2, 3, 7, 12),
    row(12, 'shimizu',    8, 3, 1, 4, 6, 8),
    row(13, 'mito',       8, 2, 3, 3, 11, 11),
    row(14, 'kyoto',      8, 2, 2, 4, 11, 15),
    row(15, 'nagasaki',   8, 2, 2, 4, 10, 15),
    row(16, 'gamba',      8, 1, 3, 4, 8, 14),
    row(17, 'nagoya',     8, 2, 0, 6, 7, 14),
    row(18, 'fukuoka',    8, 1, 1, 6, 9, 12),
    row(19, 'verdy',      8, 0, 4, 4, 4, 12),
    row(20, 'chiba',      8, 1, 1, 6, 7, 18),
  ],
};

/**
 * ACLE 2026/27 リーグステージ 東地区（16クラブ）
 * 出典: スポーツナビ 第1節 結果 https://soccer.yahoo.co.jp/jleague/category/acle/ （2026-09-16 MD1 終了時点、結果から集計）
 * 同勝点・同得失点差・同得点は暫定順
 */
export const ACLE_STANDINGS: StandingsTable = {
  competition: 'acle',
  title: 'ACLE リーグステージ 東地区',
  asOf: 'MD1 終了時点',
  updatedAt: '2026-09-16',
  sourceUrl: 'https://soccer.yahoo.co.jp/jleague/category/acle/',
  qualifyRank: 8,
  rows: [
    row(1,  'kashima',      1, 1, 0, 0, 7, 1),
    row(2,  'gamba',        1, 1, 0, 0, 4, 1),
    row(3,  'shanghaiport', 1, 1, 0, 0, 6, 4),
    row(4,  'beijing',      1, 1, 0, 0, 3, 1),
    row(5,  'kobe',         1, 1, 0, 0, 2, 1),
    row(6,  'jeonbuk',      1, 1, 0, 0, 2, 1),
    row(7,  'daejeon',      1, 1, 0, 0, 1, 0),
    row(8,  'jdt',          1, 0, 1, 0, 1, 1),
    row(9,  'buriram',      1, 0, 1, 0, 1, 1),
    row(10, 'kashiwa',      1, 0, 0, 1, 1, 2),
    row(11, 'port',         1, 0, 0, 1, 1, 2),
    row(12, 'kyoto',        1, 0, 0, 1, 0, 1),
    row(13, 'pohang',       1, 0, 0, 1, 1, 3),
    row(14, 'ratchaburi',   1, 0, 0, 1, 4, 6),
    row(15, 'conganhanoi',  1, 0, 0, 1, 1, 4),
    row(16, 'newcastle',    1, 0, 0, 1, 1, 7),
  ],
};

export const STANDINGS: StandingsTable[] = [J1_STANDINGS, ACLE_STANDINGS];

export const findStandings = (competition: StandingsTable['competition']) =>
  STANDINGS.find((s) => s.competition === competition);

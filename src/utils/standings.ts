import type { StandingsSnapshot, StandingsTable } from '../types';
import { KASHIWA_ID, getClub } from '../data/clubs';

/** 表記ゆれを吸収してクラブを照合する */
const matches = (name: string, clubId: string) => {
  const c = getClub(clubId);
  const n = name.replace(/[・･\s]/g, '');
  return n.includes(c.short.replace(/[・･\s]/g, '')) || c.name.replace(/[・･\s]/g, '') === n;
};

export interface RankMove {
  rank: number;
  /** 前回スナップショットからの変化（＋が上昇） */
  delta: number | null;
  points: number;
  /** 首位との勝点差（首位なら0） */
  gapToTop: number;
  /** ひとつ上との勝点差。首位なら null */
  gapToAbove: number | null;
  /** ひとつ下との勝点差。最下位なら null */
  gapToBelow: number | null;
}

export const rankMove = (
  table: StandingsTable,
  history: StandingsSnapshot[],
  clubId: string = KASHIWA_ID,
): RankMove | null => {
  const rows = table.rows;
  const i = rows.findIndex((r) => r.clubId === clubId);
  if (i < 0) return null;
  const me = rows[i]!;

  // 直近で「節が変わった」スナップショットを前回とみなす
  const prevSnap = [...history].reverse().find((s) => s.asOf !== table.asOf);
  const prevRank = prevSnap?.table.find((r) => matches(r.name, clubId))?.rank ?? null;

  return {
    rank: me.rank,
    delta: prevRank === null ? null : prevRank - me.rank,
    points: me.points,
    gapToTop: (rows[0]?.points ?? me.points) - me.points,
    gapToAbove: i > 0 ? (rows[i - 1]!.points - me.points) : null,
    gapToBelow: i < rows.length - 1 ? (me.points - rows[i + 1]!.points) : null,
  };
};

/** 順位推移（古い順）。データが溜まるまでは空を返す */
export const rankSeries = (history: StandingsSnapshot[], clubId: string = KASHIWA_ID) =>
  history
    .map((s) => {
      const row = s.table.find((r) => matches(r.name, clubId));
      return row ? { asOf: s.asOf, rank: row.rank, points: row.points, played: row.played } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

import type { StandingsSnapshot } from '../../types';
import { rankSeries } from '../../utils/standings';

/**
 * 柏の順位推移。縦軸は順位（1位が上）。
 * スナップショットが3件たまるまでは描かない。
 */
export const RankChart = ({ history, clubs = 20 }: { history: StandingsSnapshot[]; clubs?: number }) => {
  const series = rankSeries(history);
  if (series.length < 3) return null;

  const W = 320;
  const H = 108;
  const PAD = { top: 12, right: 26, bottom: 18, left: 22 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // 縦軸は「動いた範囲」に合わせる（1〜20位固定だと動きが潰れて見えない）
  const ranks = series.map((p) => p.rank);
  const lo = Math.max(1, Math.min(...ranks) - 1);
  const hi = Math.min(clubs, Math.max(Math.max(...ranks) + 1, lo + 3));

  const x = (i: number) => PAD.left + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const y = (rank: number) => PAD.top + ((rank - lo) / (hi - lo)) * plotH;

  const line = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.rank).toFixed(1)}`).join(' ');
  const last = series[series.length - 1]!;
  const best = Math.min(...series.map((p) => p.rank));
  const worst = Math.max(...series.map((p) => p.rank));

  return (
    <figure className="rank-chart">
      <figcaption>
        順位推移 <span className="note">最高{best}位 · 最低{worst}位</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`順位推移。現在${last.rank}位、最高${best}位、最低${worst}位`}>
        {/* 目安線: 1位・ACL出場圏(3位)・降格圏(18位) */}
        {[lo, hi, ...[3, 18].filter((r) => r > lo && r < hi)].map((r) => (
          <g key={r}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(r)} y2={y(r)} className="rc-grid" />
            <text x={PAD.left - 5} y={y(r)} className="rc-tick" textAnchor="end" dominantBaseline="middle">{r}</text>
          </g>
        ))}
        <path d={line} className="rc-line" fill="none" />
        {series.map((p, i) => (
          <circle key={p.asOf} cx={x(i)} cy={y(p.rank)} r={i === series.length - 1 ? 5 : 3.5} className={i === series.length - 1 ? 'rc-dot rc-dot-now' : 'rc-dot'}>
            <title>{`${p.asOf} ${p.rank}位 勝点${p.points}`}</title>
          </circle>
        ))}
        <text x={x(series.length - 1) + 7} y={y(last.rank)} className="rc-label" dominantBaseline="middle">{last.rank}位</text>
      </svg>
    </figure>
  );
};

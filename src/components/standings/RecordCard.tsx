import type { CompetitionId } from '../../types';
import { getClub } from '../../data/clubs';
import { formFor, opponentId, recordFor, scoreForKashiwa, type TeamRecord } from '../../utils/fixtures';

const Line = ({ label, r }: { label: string; r: TeamRecord }) => {
  const gd = r.gf - r.ga;
  return (
    <div className="rec-line">
      <span className="rec-label">{label}</span>
      <span className="num rec-wdl">{r.won}<small>勝</small>{r.drawn}<small>分</small>{r.lost}<small>敗</small></span>
      <span className="num rec-goals">{r.gf}<small>得</small>{r.ga}<small>失</small></span>
      <span className={`num rec-gd${gd > 0 ? ' pos' : gd < 0 ? ' neg' : ''}`}>{gd > 0 ? `+${gd}` : gd}</span>
    </div>
  );
};

/** 大会別の柏の成績（通算・ホーム・アウェイ・直近フォーム） */
export const RecordCard = ({ competition, onOpen }: { competition: CompetitionId; onOpen: (id: string) => void }) => {
  const { total, home, away } = recordFor(competition);
  const form = formFor(competition, 5);
  const showPoints = competition === 'j1' || competition === 'acle';

  if (total.played === 0) {
    return <div className="card"><p className="empty">まだ試合がありません</p></div>;
  }

  return (
    <div className="card">
      <div className="stat-grid">
        <div className="stat"><div className="n">{total.played}</div><div className="l">試合</div></div>
        {showPoints
          ? <div className="stat"><div className="n">{total.points}</div><div className="l">勝点</div></div>
          : <div className="stat"><div className="n">{total.won}</div><div className="l">勝利</div></div>}
        <div className="stat"><div className="n">{total.played ? Math.round((total.won / total.played) * 100) : 0}<small style={{ fontSize: 12 }}>%</small></div><div className="l">勝率</div></div>
        <div className="stat"><div className="n">{(total.gf / total.played).toFixed(1)}</div><div className="l">平均得点</div></div>
      </div>
      <div className="rec-lines">
        <Line label="通算" r={total} />
        <Line label="ホーム" r={home} />
        <Line label="アウェイ" r={away} />
      </div>
      <div className="form">
        <span className="eyebrow">Form</span>
        <div className="form-dots">
          {form.map(({ f, o }) => (
            <button type="button" key={f.id} className={`form-dot dot dot-${o}`} onClick={() => onOpen(f.id)}
              title={`${getClub(opponentId(f)).short} ${scoreForKashiwa(f)}`} aria-label={`${getClub(opponentId(f)).name} ${scoreForKashiwa(f)}`}>
              {o}
            </button>
          ))}
        </div>
        <span className="note">古い ← → 新しい</span>
      </div>
    </div>
  );
};

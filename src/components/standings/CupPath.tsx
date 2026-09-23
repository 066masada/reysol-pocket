import type { CompetitionId } from '../../types';
import { getClub } from '../../data/clubs';
import { STADIUMS } from '../../data/stadiums';
import { fixturesFor, isHome, kickoffDate, opponentId, outcome, scoreForKashiwa } from '../../utils/fixtures';
import { fmtDateJa, fmtTime } from '../../utils/date';

/**
 * カップ戦（ルヴァン・天皇杯）の勝ち上がり。
 * 終了したラウンドは結果、次のラウンドは日程、それ以降は未定として縦に並べる。
 */
export const CupPath = ({ competition, onOpen }: { competition: CompetitionId; onOpen: (id: string) => void }) => {
  const list = fixturesFor(competition);
  const eliminated = list.some((f) => f.status === 'ft' && outcome(f) === 'L');
  const next = list.find((f) => f.status !== 'ft');
  const wins = list.filter((f) => f.status === 'ft' && outcome(f) === 'W').length;

  return (
    <div className="card">
      <div className="cup-status">
        <span className="eyebrow">Status</span>
        <b>{eliminated ? '敗退' : next ? `勝ち残り · 次は${next.round}` : '勝ち残り · 次ラウンド未定'}</b>
        <span className="note">{wins}勝で勝ち進み中</span>
      </div>
      <ol className="cup-path">
        {list.map((f, i) => {
          const opp = getClub(opponentId(f));
          const o = outcome(f);
          const d = kickoffDate(f);
          const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
          const state = f.status === 'ft' ? (o === 'W' ? 'won' : o === 'L' ? 'lost' : 'drawn') : f === next ? 'next' : 'future';
          return (
            <li key={f.id} className={`cup-step ${state}`}>
              <span className="cup-node">{f.status === 'ft' ? o : i + 1}</span>
              <button type="button" className="cup-body" onClick={() => onOpen(f.id)}>
                <span className="cup-round">{f.round}</span>
                <span className="cup-opp">vs {opp.name} <span className={`ha${isHome(f) ? '' : ' ha-a'}`}>{isHome(f) ? 'H' : 'A'}</span></span>
                <span className="cup-meta">
                  {f.status === 'ft'
                    ? <><b className="num">{scoreForKashiwa(f)}</b>{f.score?.note ? ` ${f.score.note}` : ''} · {fmtDateJa(d)}</>
                    : <>{f.timeTBD && f.dateLabel ? f.dateLabel : `${fmtDateJa(d)} ${fmtTime(d)}`}{st ? ` · ${st.short}` : ''}</>}
                </span>
              </button>
            </li>
          );
        })}
        {!eliminated && (
          <li className="cup-step future">
            <span className="cup-node">?</span>
            <div className="cup-body static">
              <span className="cup-round">次のラウンド</span>
              <span className="cup-meta">組み合わせ決定後に追加</span>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
};

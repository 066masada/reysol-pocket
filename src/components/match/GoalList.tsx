import type { Fixture } from '../../types';
import { getClub } from '../../data/clubs';
import { isHome, opponentId } from '../../utils/fixtures';

/**
 * 得点者。柏の得点を左、相手を右に並べる（H/Aに関わらず柏が左）。
 * 出典は公式の試合結果ページ。
 */
export const GoalList = ({ f, onDark }: { f: Fixture; onDark?: boolean }) => {
  const g = f.goals;
  if (!g || (g.reysol.length === 0 && g.opponent.length === 0)) return null;

  const opp = getClub(opponentId(f));
  const rows = Math.max(g.reysol.length, g.opponent.length);

  return (
    <div className={`goals${onDark ? ' goals-dark' : ''}`}>
      <div className="goals-head">
        <span>柏レイソル</span>
        <span className="goals-ha">{isHome(f) ? 'H' : 'A'}</span>
        <span>{opp.short}</span>
      </div>
      {Array.from({ length: rows }, (_, i) => {
        const a = g.reysol[i];
        const b = g.opponent[i];
        return (
          <div className="goals-row" key={i}>
            <span className="goals-l">{a && <><b>{a.player}</b><i className="num">{a.minute}′</i></>}</span>
            <span className="goals-ball" aria-hidden>{a || b ? '●' : ''}</span>
            <span className="goals-r">{b && <><i className="num">{b.minute}′</i><b>{b.player}</b></>}</span>
          </div>
        );
      })}
    </div>
  );
};

import type { Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { BOARD_BY_CLUB, boardUrl } from '../../data/boards';
import { useData } from '../../data/store';
import { isHome, nextFixture, opponentId, outcome, postMatchNotes, scoreForKashiwa, kickoffDate } from '../../utils/fixtures';
import { rankMove } from '../../utils/standings';
import { fmtMonthDay, weekdayJa } from '../../utils/date';
import { openExternal } from '../../utils/external';
import { IconBoard, IconExternal, IconPlay } from '../ui/Icons';

const HIGHLIGHT_YT = 'https://www.youtube.com/@kashiwareysol/videos';
const DAZN = 'https://www.dazn.com/ja-JP/home';
const X_SEARCH = 'https://x.com/search?q=%23%E6%9F%8F%E3%83%AC%E3%82%A4%E3%82%BD%E3%83%AB&f=live';

const DELTA = (d: number | null) => (d === null ? '' : d > 0 ? `↑${d}` : d < 0 ? `↓${-d}` : '±0');

/**
 * 試合終了後に出すまとめ。
 * 結果・連勝などの記録・順位の動き・次の試合・試合後に見たいものへの導線。
 */
export const PostMatchSummary = ({ f, now, onOpen }: { f: Fixture; now: Date; onOpen: (id: string) => void }) => {
  const { standings, history } = useData();
  const comp = COMPETITIONS[f.competition];
  const opp = getClub(opponentId(f));
  const o = outcome(f);
  const notes = postMatchNotes(f);
  const move = f.competition === 'j1' ? rankMove(standings, history) : null;
  const next = nextFixture(now);
  const board = BOARD_BY_CLUB[opp.id];
  const won = o === 'W';

  return (
    <section className={`pms${won ? ' pms-win' : o === 'L' ? ' pms-loss' : ''}`} aria-label="試合結果">
      {won && <div className="pms-rays" aria-hidden />}

      <div className="pms-head">
        <span className="pms-verdict">{o === 'W' ? 'WIN' : o === 'L' ? 'LOSE' : 'DRAW'}</span>
        <span className="pms-meta">{comp.short} {f.round} · {fmtMonthDay(kickoffDate(f))}</span>
      </div>

      <button type="button" className="pms-score" onClick={() => onOpen(f.id)}>
        <span className="pms-nums num">{f.score ? scoreForKashiwa(f) : '–'}</span>
        <span className="pms-opp">{isHome(f) ? 'vs' : '@'} {opp.name}</span>
      </button>

      {notes.length > 0 && (
        <ul className="pms-notes">
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}

      {move && (
        <div className="pms-rank">
          <span className="pms-rank-now num">{move.rank}<small>位</small></span>
          {move.delta !== null && move.delta !== 0 && (
            <span className={`pms-delta${move.delta > 0 ? ' up' : ' down'}`}>{DELTA(move.delta)}</span>
          )}
          <span className="pms-rank-gap">
            勝点{move.points}
            {move.gapToAbove !== null && ` · ${move.rank - 1}位と${move.gapToAbove}差`}
            {move.rank === 1 ? ' · 首位' : move.rank > 2 && move.gapToTop > 0 ? ` · 首位と${move.gapToTop}差` : ''}
          </span>
        </div>
      )}

      <div className="pms-actions">
        <button type="button" className="btn btn-sun btn-block" onClick={() => openExternal(boardUrl('reysol'))}>
          <IconBoard />掲示板で感想を見る
        </button>
        <div className="pms-grid">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openExternal(HIGHLIGHT_YT)}>
            <IconPlay />ハイライト
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openExternal(f.lineupUrl ?? DAZN)}>
            <IconExternal />{f.lineupUrl ? 'スタッツ' : 'DAZN'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openExternal(X_SEARCH)}>
            <IconExternal />X の反応
          </button>
        </div>
        {board && (
          <button type="button" className="btn btn-ghost btn-block btn-sm" onClick={() => openExternal(boardUrl(board.slug))}>
            <IconBoard />{opp.short}サポの掲示板
          </button>
        )}
      </div>

      {next && next.id !== f.id && (
        <button type="button" className="pms-next" onClick={() => onOpen(next.id)}>
          次は {fmtMonthDay(kickoffDate(next))}({weekdayJa(kickoffDate(next))}) {COMPETITIONS[next.competition].short} ·{' '}
          {getClub(opponentId(next)).name} →
        </button>
      )}
    </section>
  );
};

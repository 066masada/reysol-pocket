import { useState } from 'react';
import type { CompetitionId } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { findStandings } from '../../data/standings';
import { useData } from '../../data/store';
import { CompetitionChip } from '../match/Parts';
import { StandingsTable } from './StandingsTable';
import { RecordCard } from './RecordCard';
import { CupPath } from './CupPath';
import { RankChart } from './RankChart';
import { useNavigation } from '../../contexts/NavigationContext';
import { rankMove } from '../../utils/standings';

const CATS: CompetitionId[] = ['j1', 'acle', 'levain', 'emperor'];

/** 順位・成績（カテゴリ別） */
export const StandingsView = ({ initial = 'j1', onOpen }: { initial?: CompetitionId; onOpen: (id: string) => void }) => {
  const [cat, setCat] = useState<CompetitionId>(initial);
  const { standings, acleStandings, history } = useData();
  const { navigate } = useNavigation();
  const table = cat === 'j1' ? standings : cat === 'acle' ? acleStandings : findStandings(cat);
  const comp = COMPETITIONS[cat];
  const move = cat === 'j1' ? rankMove(standings, history) : null;

  return (
    <>
      <div className="filters" role="tablist" aria-label="大会">
        {CATS.map((id) => (
          <CompetitionChip key={id} id={id} off={cat !== id} onClick={() => setCat(id)} />
        ))}
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <span className="eyebrow">{comp.short} · 柏の成績</span>
        <RecordCard competition={cat} onOpen={onOpen} />
      </section>

      {table ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <span className="eyebrow">順位表</span>
          {cat === 'acle' && (
            <button type="button" className="btn btn-line btn-block btn-sm" onClick={() => navigate('more', 'acle')}>
              ACL特設ページを見る →
            </button>
          )}
          {cat === 'j1' && move && (
            <div className="card rank-move">
              <div className="rm-now">
                <span className="num rm-rank">{move.rank}<small>位</small></span>
                {move.delta !== null && move.delta !== 0 && (
                  <span className={`pms-delta${move.delta > 0 ? ' up' : ' down'}`}>{move.delta > 0 ? `↑${move.delta}` : `↓${-move.delta}`}</span>
                )}
                <span className="num rm-pts">勝点{move.points}</span>
              </div>
              <div className="rm-gaps">
                {move.gapToAbove !== null && <span>{move.rank - 1}位と <b className="num">{move.gapToAbove}</b> 差</span>}
                {move.gapToBelow !== null && <span>{move.rank + 1}位と <b className="num">{move.gapToBelow}</b> 差</span>}
                {move.rank > 2 && move.gapToTop > 0 && <span>首位と <b className="num">{move.gapToTop}</b> 差</span>}
              </div>
              <RankChart history={history} clubs={table.rows.length} />
            </div>
          )}
          <StandingsTable table={table} />
        </section>
      ) : (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <span className="eyebrow">勝ち上がり</span>
          <CupPath competition={cat} onOpen={onOpen} />
        </section>
      )}
    </>
  );
};

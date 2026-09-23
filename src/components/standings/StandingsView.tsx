import { useState } from 'react';
import type { CompetitionId } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { findStandings } from '../../data/standings';
import { CompetitionChip } from '../match/Parts';
import { StandingsTable } from './StandingsTable';
import { RecordCard } from './RecordCard';
import { CupPath } from './CupPath';

const CATS: CompetitionId[] = ['j1', 'acle', 'levain', 'emperor'];

/** 順位・成績（カテゴリ別） */
export const StandingsView = ({ initial = 'j1', onOpen }: { initial?: CompetitionId; onOpen: (id: string) => void }) => {
  const [cat, setCat] = useState<CompetitionId>(initial);
  const table = findStandings(cat);
  const comp = COMPETITIONS[cat];

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

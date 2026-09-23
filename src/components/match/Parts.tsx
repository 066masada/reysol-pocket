import type { CSSProperties } from 'react';
import type { Club, CompetitionId, Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { nextSale, outcome, ticketState } from '../../utils/fixtures';
import { fmtMonthDay } from '../../utils/date';

/** 大会チップ */
export const CompetitionChip = ({ id, label, off, onClick }: {
  id: CompetitionId; label?: string; off?: boolean; onClick?: () => void;
}) => {
  const c = COMPETITIONS[id];
  const style: CSSProperties = { background: c.color, color: c.textOnColor };
  const cls = `chip${onClick ? ' filter-chip' : ''}${off ? ' off' : ''}`;
  if (onClick) {
    return (
      <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={!off}>
        {label ?? c.short}
      </button>
    );
  }
  return <span className={cls} style={style}>{label ?? c.short}</span>;
};

/** 円形エンブレム代替（クラブカラー＋略称） */
const crestLabel = (short: string, size: 'sm' | 'md') => {
  const ascii = /^[ -~]+$/.test(short);
  const max = size === 'sm' ? (ascii ? 3 : 2) : (ascii ? 5 : 3);
  return short.length > max ? short.slice(0, max) : short;
};

export const Crest = ({ club, size = 'md' }: { club: Club; size?: 'sm' | 'md' }) => {
  const style: CSSProperties = { background: club.color, color: club.textOnColor ?? '#fff' };
  return (
    <span className={`crest${size === 'sm' ? ' crest-sm' : ''}`} style={style} aria-hidden>
      {crestLabel(club.short, size)}
    </span>
  );
};

/** 勝敗ドット */
export const ResultDot = ({ f }: { f: Fixture }) => {
  const o = outcome(f);
  if (!o) return null;
  return <span className={`dot dot-${o}`}>{o}</span>;
};

/** H / A バッジ */
export const HABadge = ({ home }: { home: boolean }) => (
  <span className={`ha${home ? '' : ' ha-a'}`}>{home ? 'HOME' : 'AWAY'}</span>
);

/** チケット状態バッジ */
export const TicketBadge = ({ f, now }: { f: Fixture; now: Date }) => {
  const st = ticketState(f, now);
  if (st === 'none') return null;
  if (st === 'onsale') return <span className="tk">発売中</span>;
  if (st === 'presale') return <span className="tk">先行発売中</span>;
  if (st === 'lottery') return <span className="tk tk-lot">抽選受付中</span>;
  const next = nextSale(f, now);
  return <span className="tk tk-pre">{next ? `${fmtMonthDay(new Date(next.at))} 発売` : '発売前'}</span>;
};

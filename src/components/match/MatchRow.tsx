import type { Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { STADIUMS } from '../../data/stadiums';
import { isHome, opponentId, outcome, scoreForKashiwa, kickoffDate } from '../../utils/fixtures';
import { fmtTime, isSameDay, weekdayEn } from '../../utils/date';
import { HABadge, TicketBadge } from './Parts';

interface Props {
  f: Fixture;
  now: Date;
  onOpen: (id: string) => void;
}

export const MatchRow = ({ f, now, onOpen }: Props) => {
  const comp = COMPETITIONS[f.competition];
  const d = kickoffDate(f);
  const opp = getClub(opponentId(f));
  const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
  const home = isHome(f);
  const o = outcome(f);
  const wd = weekdayEn(d);
  const wdClass = d.getDay() === 0 ? ' sun' : d.getDay() === 6 ? ' sat' : '';
  const today = isSameDay(d, now);

  return (
    <button type="button" className={`match-row${today ? ' today' : ''}`} onClick={() => onOpen(f.id)}>
      <div className="date">
        <b>{d.getDate()}</b>
        <span className={wdClass}>{f.dateLabel && f.timeTBD ? 'TBD' : wd}</span>
      </div>
      <div className="stripe" style={{ background: comp.color }} />
      <div className="info">
        <div className="top">
          <HABadge home={home} />
          <span>{comp.short} {f.round}</span>
        </div>
        <div className="opp">{opp.name}{opp.country ? `（${opp.country}）` : ''}</div>
        <div className="vn">{f.timeTBD && f.dateLabel ? `${f.dateLabel} · ` : ''}{st?.name ?? '会場未定'}</div>
      </div>
      <div className="right">
        {f.status === 'ft' && f.score ? (
          <span className={`res res-${o ?? 'D'}`}>{scoreForKashiwa(f)}</span>
        ) : f.timeTBD ? (
          <span className="ko tbd">時刻未定</span>
        ) : (
          <span className="ko">{fmtTime(d)}</span>
        )}
        {f.status !== 'ft' && <TicketBadge f={f} now={now} />}
      </div>
    </button>
  );
};

import { useMemo } from 'react';
import type { Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { STADIUMS } from '../../data/stadiums';
import { isHome, kickoffDate, opponentId, outcome, scoreForKashiwa } from '../../utils/fixtures';
import { fmtTime, pad2, WEEK } from '../../utils/date';
import { CalendarGrid, type CalendarItem } from './CalendarGrid';
import { TicketBadge } from './Parts';

interface Props {
  /** 表示する月 'YYYY-MM' */
  month: string;
  fixtures: Fixture[];
  now: Date;
  onOpen: (id: string) => void;
}

const LEGEND = [
  { label: 'J1', color: COMPETITIONS.j1.color },
  { label: 'ルヴァン', color: COMPETITIONS.levain.color },
  { label: '天皇杯', color: COMPETITIONS.emperor.color },
  { label: 'ACLE', color: COMPETITIONS.acle.color },
  { label: 'ホーム', accent: true },
];

/** 試合カレンダー。ホーム開催日を塗り、大会色のドットで種別を示す */
export const MatchCalendar = ({ month, fixtures, now, onOpen }: Props) => {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7));

  const monthFixtures = useMemo(
    () => fixtures
      .filter((f) => { const d = kickoffDate(f); return d.getFullYear() === y && d.getMonth() === m - 1; })
      .sort((a, b) => kickoffDate(a).getTime() - kickoffDate(b).getTime()),
    [fixtures, y, m],
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();
    for (const f of monthFixtures) {
      const day = kickoffDate(f).getDate();
      const o = outcome(f);
      const list = map.get(day) ?? [];
      list.push({
        key: f.id,
        label: getClub(opponentId(f)).short,
        color: COMPETITIONS[f.competition].color,
        accent: isHome(f),
        badge: o ?? undefined,
        badgeClass: o ? `res-${o}` : undefined,
        onClick: () => onOpen(f.id),
      });
      map.set(day, list);
    }
    return map;
  }, [monthFixtures, onOpen]);

  return (
    <>
      <CalendarGrid year={y} month={m} now={now} itemsByDay={itemsByDay} legend={LEGEND} />

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <span className="eyebrow">{m}月の試合 · {monthFixtures.length}試合</span>
        <div className="card">
          {monthFixtures.length === 0 && <p className="empty">この月に試合はありません</p>}
          {monthFixtures.map((f) => {
            const d = kickoffDate(f);
            const opp = getClub(opponentId(f));
            const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
            const o = outcome(f);
            return (
              <button type="button" key={f.id} className="cal-row" onClick={() => onOpen(f.id)}>
                <span className="cal-row-date num">
                  {m}/{pad2(d.getDate())}<small>{WEEK[d.getDay()]}</small>
                </span>
                <span className="stripe" style={{ background: COMPETITIONS[f.competition].color }} />
                <span className="cal-row-main">
                  <span className="cal-row-top">
                    <span className={`ha${isHome(f) ? '' : ' ha-a'}`}>{isHome(f) ? 'H' : 'A'}</span>
                    {COMPETITIONS[f.competition].short} {f.round}
                  </span>
                  <span className="cal-row-opp">{opp.name}</span>
                  <span className="cal-row-venue">{st?.short ?? '会場未定'}</span>
                </span>
                <span className="cal-row-right num">
                  {f.status === 'ft' && f.score
                    ? <b className={`res-${o ?? 'D'}`}>{scoreForKashiwa(f)}</b>
                    : f.timeTBD ? <span className="tbd">時刻未定</span> : fmtTime(d)}
                  {f.status !== 'ft' && <TicketBadge f={f} now={now} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
};

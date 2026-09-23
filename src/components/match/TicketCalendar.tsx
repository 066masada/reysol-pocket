import { useMemo } from 'react';
import type { CompetitionId, Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import {
  SALE_COLOR, SALE_LABEL, SALE_SHORT, kickoffDate, opponentId,
  saleEvents, salesUnannounced, upcomingSales, type SaleEvent,
} from '../../utils/fixtures';
import { countdownTo, fmtMonthDay, fmtTime, pad2, WEEK } from '../../utils/date';
import { downloadSaleIcs } from '../../utils/ics';
import { openExternal } from '../../utils/external';
import { CalendarGrid, type CalendarItem } from './CalendarGrid';
import { IconCalendarAdd, IconTicket } from '../ui/Icons';

interface Props {
  month: string;
  /** 大会フィルタ後の試合 */
  fixtures: Fixture[];
  now: Date;
  onOpen: (id: string) => void;
}

const LEGEND = [
  { label: '抽選', color: SALE_COLOR.lottery },
  { label: '一次', color: SALE_COLOR.first },
  { label: '二次', color: SALE_COLOR.second },
  { label: '一般発売', accent: true },
];

/**
 * チケット販売カレンダー。試合日ではなく「販売が始まる日」を並べる。
 * 一般発売（三次）の日はセルを塗って目立たせる。
 */
export const TicketCalendar = ({ month, fixtures, now, onOpen }: Props) => {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7));
  const allowed = useMemo(() => new Set(fixtures.map((f) => f.id)), [fixtures]);

  const events = useMemo(
    () => saleEvents().filter((e) =>
      allowed.has(e.fixture.id) && e.at.getFullYear() === y && e.at.getMonth() === m - 1),
    [allowed, y, m],
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();
    for (const e of events) {
      const day = e.at.getDate();
      const list = map.get(day) ?? [];
      list.push({
        key: e.id,
        label: getClub(opponentId(e.fixture)).short,
        color: SALE_COLOR[e.sale.type],
        accent: e.sale.type === 'third',
        badge: SALE_SHORT[e.sale.type],
        badgeClass: 'cal-sale-badge',
        onClick: () => onOpen(e.fixture.id),
      });
      map.set(day, list);
    }
    return map;
  }, [events, onOpen]);

  const nextUp = upcomingSales(now).filter((e) => allowed.has(e.fixture.id))[0];
  const cd = nextUp ? countdownTo(nextUp.at, now) : null;
  const unannounced = salesUnannounced(now).filter((f) => allowed.has(f.id));

  return (
    <>
      {nextUp && cd && (
        <section className="next-sale">
          <div className="next-sale-head">
            <span className="eyebrow">次の発売</span>
            <span className="num next-sale-cd">
              {cd.days > 0 ? `あと${cd.days}日 ` : ''}{pad2(cd.hours)}:{pad2(cd.minutes)}:{pad2(cd.seconds)}
            </span>
          </div>
          <b className="next-sale-title">
            {SALE_LABEL[nextUp.sale.type]} · {getClub(opponentId(nextUp.fixture)).name}戦
          </b>
          <span className="next-sale-sub">
            {fmtMonthDay(nextUp.at)}({WEEK[nextUp.at.getDay()]}) {fmtTime(nextUp.at)}〜 ·
            試合は {fmtMonthDay(kickoffDate(nextUp.fixture))}
          </span>
          <div className="next-sale-actions">
            <button type="button" className="btn btn-sun btn-sm" onClick={() => downloadSaleIcs(nextUp.fixture, nextUp.sale)}>
              <IconCalendarAdd />発売日を登録
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openExternal(nextUp.fixture.ticketUrl!)}>
              <IconTicket />チケット情報
            </button>
          </div>
        </section>
      )}

      <CalendarGrid year={y} month={m} now={now} itemsByDay={itemsByDay} legend={LEGEND} />

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <span className="eyebrow">{m}月の販売 · {events.length}件</span>
        <div className="card">
          {events.length === 0 && <p className="empty">この月に販売開始はありません</p>}
          {events.map((e) => <SaleRow key={e.id} e={e} now={now} onOpen={onOpen} />)}
        </div>
      </section>

      {unannounced.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <span className="eyebrow">販売日程 未発表</span>
          <div className="card">
            {unannounced.map((f) => (
              <button type="button" key={f.id} className="link-row" onClick={() => onOpen(f.id)}>
                <span className="link-ico" style={{ background: COMPETITIONS[f.competition].color, color: COMPETITIONS[f.competition].textOnColor }}>
                  {COMPETITIONS[f.competition].short.slice(0, 2)}
                </span>
                <span className="lbl">
                  <b>{getClub(opponentId(f)).name}戦</b>
                  <small>{fmtMonthDay(kickoffDate(f))} · {COMPETITIONS[f.competition].short} {f.round}</small>
                </span>
                <span className="arrow">未定</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="note">
        アソシエイツ（ファンクラブ）会員先行は試合前日まで受付。出典: 柏レイソル公式「販売日程」（2026-09-22 時点）
      </p>
    </>
  );
};

const SaleRow = ({ e, now, onOpen }: { e: SaleEvent; now: Date; onOpen: (id: string) => void }) => {
  const opp = getClub(opponentId(e.fixture));
  const comp = COMPETITIONS[e.fixture.competition as CompetitionId];
  const started = e.at.getTime() <= now.getTime();
  return (
    <div className="sale-row">
      <button type="button" className="sale-main" onClick={() => onOpen(e.fixture.id)}>
        <span className="sale-date num">
          {e.at.getMonth() + 1}/{pad2(e.at.getDate())}<small>{WEEK[e.at.getDay()]}</small>
        </span>
        <span className="stripe" style={{ background: SALE_COLOR[e.sale.type] }} />
        <span className="sale-body">
          <span className="sale-top">
            <span className="sale-type" style={{ background: SALE_COLOR[e.sale.type], color: e.sale.type === 'third' ? '#111' : '#fff' }}>
              {SALE_LABEL[e.sale.type]}
            </span>
            {started && <span className="sale-live">受付中</span>}
          </span>
          <span className="sale-opp">{opp.name}戦</span>
          <span className="sale-sub">
            {comp.short} {e.fixture.round} · 試合 {fmtMonthDay(kickoffDate(e.fixture))}
          </span>
        </span>
        <span className="sale-time num">{fmtTime(e.at)}〜</span>
      </button>
      <div className="sale-actions">
        {!started && (
          <button type="button" className="btn btn-line btn-sm" onClick={() => downloadSaleIcs(e.fixture, e.sale)}>
            <IconCalendarAdd />登録
          </button>
        )}
        <button type="button" className={`btn btn-sm ${started ? 'btn-sun' : 'btn-line'}`} onClick={() => openExternal(e.fixture.ticketUrl!)}>
          <IconTicket />{started ? '買う' : '情報'}
        </button>
      </div>
    </div>
  );
};

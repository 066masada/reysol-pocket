import { useMemo } from 'react';
import type { Fixture } from '../../types';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import {
  SALE_COLOR, SALE_LABEL, TICKET_STATE_LABEL, currentSale, kickoffDate,
  nextSale, opponentId, ticketState,
} from '../../utils/fixtures';
import { fmtDateJa, fmtMonthDay, fmtTime } from '../../utils/date';
import { downloadSaleIcs } from '../../utils/ics';
import { openExternal } from '../../utils/external';
import { IconCalendarAdd, IconTicket } from '../ui/Icons';

interface Props {
  fixtures: Fixture[];
  /** 'YYYY-MM' で絞る。null なら全期間 */
  month: string | null;
  now: Date;
  onOpen: (id: string) => void;
}

/**
 * 試合ごとにまとめた販売スケジュール。
 * カレンダーが「いつ発売か」なのに対し、こちらは「どの試合が今どの状態か」を見る。
 */
export const TicketList = ({ fixtures, month, now, onOpen }: Props) => {
  const list = useMemo(() => {
    const y = month ? Number(month.slice(0, 4)) : null;
    const m = month ? Number(month.slice(5, 7)) : null;
    return fixtures
      .filter((f) => f.ticketUrl && f.status !== 'ft')
      .filter((f) => {
        if (y === null || m === null) return true;
        const d = kickoffDate(f);
        // その月に試合があるか、その月に販売開始があるもの
        if (d.getFullYear() === y && d.getMonth() === m - 1) return true;
        return (f.ticketSales ?? []).some((s) => {
          const sd = new Date(s.at);
          return sd.getFullYear() === y && sd.getMonth() === m - 1;
        });
      })
      .sort((a, b) => kickoffDate(a).getTime() - kickoffDate(b).getTime());
  }, [fixtures, month]);

  if (list.length === 0) {
    return <div className="card"><p className="empty">対象のホーム戦がありません</p></div>;
  }

  return (
    <>
      <div className="tl">
        {list.map((f) => {
          const st = ticketState(f, now);
          const cur = currentSale(f, now);
          const next = nextSale(f, now);
          const opp = getClub(opponentId(f));
          const comp = COMPETITIONS[f.competition];
          return (
            <article key={f.id} className="card tl-card">
              <button type="button" className="tl-head" onClick={() => onOpen(f.id)}>
                <span className="stripe" style={{ background: comp.color }} />
                <span className="tl-head-main">
                  <span className="tl-match">{opp.name}戦</span>
                  <span className="tl-when">{fmtDateJa(kickoffDate(f))} {fmtTime(kickoffDate(f))} · {comp.short} {f.round}</span>
                </span>
                {st !== 'none' && (
                  <span className={`tk${st === 'upcoming' ? ' tk-pre' : st === 'lottery' ? ' tk-lot' : ''}`}>
                    {TICKET_STATE_LABEL[st]}
                  </span>
                )}
              </button>

              {f.ticketSales?.length ? (
                <ol className="tl-phases">
                  {f.ticketSales.map((s) => {
                    const at = new Date(s.at);
                    const started = at.getTime() <= now.getTime();
                    const isCurrent = cur?.type === s.type;
                    const isNext = next?.type === s.type;
                    return (
                      <li key={s.type} className={`tl-phase${started ? ' started' : ''}${isCurrent ? ' current' : ''}`}>
                        <span className="tl-dot" style={{ background: started ? SALE_COLOR[s.type] : 'transparent', borderColor: SALE_COLOR[s.type] }} />
                        <span className="tl-phase-label">{SALE_LABEL[s.type]}</span>
                        <span className="num tl-phase-at">{fmtMonthDay(at)} {fmtTime(at)}〜</span>
                        {isNext && (
                          <button type="button" className="tl-add" onClick={() => downloadSaleIcs(f, s)} aria-label="発売日をカレンダーに追加">
                            <IconCalendarAdd />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="note tl-none">販売日程は未発表です</p>
              )}

              <div className="tl-foot">
                <button type="button" className={`btn btn-sm btn-block ${st === 'onsale' || st === 'presale' || st === 'lottery' ? 'btn-sun' : 'btn-line'}`}
                  onClick={() => openExternal(f.ticketUrl!)}>
                  <IconTicket />{st === 'upcoming' ? 'チケット情報' : st === 'lottery' ? '抽選に申し込む' : 'チケットを買う'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="note">
        アソシエイツ（ファンクラブ）会員先行は試合前日まで受付。出典: 柏レイソル公式「販売日程」（2026-09-22 時点）
      </p>
    </>
  );
};

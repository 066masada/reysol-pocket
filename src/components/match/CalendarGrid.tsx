import { useRef, useState } from 'react';
import { isSameDay, WEEK } from '../../utils/date';
import { useMonthSwipe } from '../../hooks/useMonthSwipe';

export interface CalendarItem {
  key: string;
  /** セルに出す短いラベル（対戦相手の略称など） */
  label: string;
  /** 下に出すドットの色 */
  color: string;
  /** セルを強調する（ホーム開催・一般発売など） */
  accent?: boolean;
  /** 右上の小さなバッジ */
  badge?: string;
  badgeClass?: string;
  onClick?: () => void;
}

interface Props {
  year: number;
  /** 1-12 */
  month: number;
  now: Date;
  itemsByDay: Map<number, CalendarItem[]>;
  legend: { label: string; color?: string; accent?: boolean }[];
  /** 横スワイプで前／次の月へ（その方向に月がなければ省略） */
  onPrev?: () => void;
  onNext?: () => void;
}

/** 月カレンダーの枠。中身（試合／チケット）は itemsByDay で差し替える */
export const CalendarGrid = ({ year, month, now, itemsByDay, legend, onPrev, onNext }: Props) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  useMonthSwipe(bodyRef, { onPrev, onNext });

  // 月が変わった向きに合わせて、新しい月を左右からスライドインさせる
  const monthIndex = year * 12 + month;
  const [shown, setShown] = useState(monthIndex);
  const [dir, setDir] = useState<'next' | 'prev' | null>(null);
  if (shown !== monthIndex) {
    setDir(monthIndex > shown ? 'next' : 'prev');
    setShown(monthIndex);
  }

  const leading = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card cal">
      <div className="cal-body" ref={bodyRef} data-own-swipe>
      <div key={monthIndex} className={`cal-slide${dir ? ` from-${dir}` : ''}`}>
      <div className="cal-week">
        {WEEK.map((w, i) => (
          <span key={w} className={`cal-wd${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}>{w}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="cal-cell empty" />;
          const items = itemsByDay.get(day) ?? [];
          const main = items[0];
          const date = new Date(year, month - 1, day);
          const dow = date.getDay();
          const today = isSameDay(date, now);
          return (
            <button
              type="button"
              key={day}
              className={`cal-cell${items.length ? ' has' : ''}${main?.accent ? ' accent' : ''}${today ? ' today' : ''}`}
              onClick={main?.onClick}
              disabled={!main?.onClick}
              aria-label={main ? `${month}月${day}日 ${main.label}` : `${month}月${day}日`}
            >
              <span className={`cal-day${dow === 0 ? ' sun' : dow === 6 ? ' sat' : ''}`}>{day}</span>
              {main && (
                <>
                  <span className="cal-opp">{main.label}{items.length > 1 ? ` 他${items.length - 1}` : ''}</span>
                  <span className="cal-dots">
                    {items.map((it) => <i key={it.key} style={{ background: it.color }} />)}
                  </span>
                  {main.badge && <span className={`cal-res ${main.badgeClass ?? ''}`}>{main.badge}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
      </div>
      </div>
      <div className="cal-legend">
        {legend.map((l) => (
          <span key={l.label} className={l.accent ? 'cal-legend-home' : undefined}>
            <i style={l.color ? { background: l.color } : undefined} />{l.label}
          </span>
        ))}
      </div>
    </div>
  );
};

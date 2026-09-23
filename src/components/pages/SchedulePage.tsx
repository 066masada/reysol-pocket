import { useEffect, useMemo, useRef, useState } from 'react';
import type { CompetitionId } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { COMPETITION_ORDER } from '../../data/competitions';
import { kickoffDate, sortedFixtures, nextFixture } from '../../utils/fixtures';
import { monthKey, monthLabel } from '../../utils/date';
import { MatchRow } from '../match/MatchRow';
import { MatchCalendar } from '../match/MatchCalendar';
import { TicketCalendar } from '../match/TicketCalendar';
import { TicketList } from '../match/TicketList';
import { CompetitionChip } from '../match/Parts';

const ALL_KEY = 'all';
type Mode = 'calendar' | 'list';
type Content = 'match' | 'ticket';
const MODE_KEY = 'reysol-pocket:scheduleMode';
const CONTENT_KEY = 'reysol-pocket:scheduleContent';

const load = <T extends string>(key: string, fallback: T): T => {
  try { return (localStorage.getItem(key) as T) ?? fallback; } catch { return fallback; }
};

const CONTENTS: { id: Content; label: string }[] = [
  { id: 'match', label: '試合日程' },
  { id: 'ticket', label: 'チケット販売' },
];

export const SchedulePage = () => {
  const now = useNow(60_000);
  const { openMatch } = useNavigation();
  const fixtures = useMemo(() => sortedFixtures(), []);
  const months = useMemo(() => Array.from(new Set(fixtures.map((f) => monthKey(kickoffDate(f))))), [fixtures]);

  const next = nextFixture(now);
  const [mode, setMode] = useState<Mode>(() => load<Mode>(MODE_KEY, 'calendar'));
  const [content, setContent] = useState<Content>(() => load<Content>(CONTENT_KEY, 'match'));
  const [month, setMonth] = useState<string>(() => (next ? monthKey(kickoffDate(next)) : months[0]!));
  const [comps, setComps] = useState<Set<CompetitionId>>(() => new Set(COMPETITION_ORDER));
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  useEffect(() => {
    try { localStorage.setItem(CONTENT_KEY, content); } catch { /* ignore */ }
  }, [content]);

  // 選択中の月ボタンを見える位置へ
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>('.month-btn.active');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [month, mode]);

  // カレンダーは「全期間」を持たないので、ALL のまま切り替えたら次の試合の月に寄せる
  const changeMode = (m: Mode) => {
    if (m === 'calendar' && month === ALL_KEY) setMonth(next ? monthKey(kickoffDate(next)) : months[0]!);
    setMode(m);
  };

  const toggleComp = (id: CompetitionId) => {
    setComps((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(id)) {
        if (nextSet.size === 1) return new Set(COMPETITION_ORDER); // 最後の1つを外したら全選択に戻す
        nextSet.delete(id);
      } else nextSet.add(id);
      return nextSet;
    });
  };

  const filtered = fixtures.filter((f) => comps.has(f.competition));
  const list = filtered.filter((f) => month === ALL_KEY || monthKey(kickoffDate(f)) === month);

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">{content === 'ticket' ? 'チケット販売' : '日程・結果'}</h1>
        <div className="seg seg-sm" role="tablist" aria-label="表示切替">
          <button type="button" role="tab" aria-selected={mode === 'calendar'} className={mode === 'calendar' ? 'active' : ''} onClick={() => changeMode('calendar')}>カレンダー</button>
          <button type="button" role="tab" aria-selected={mode === 'list'} className={mode === 'list' ? 'active' : ''} onClick={() => changeMode('list')}>リスト</button>
        </div>
      </div>

      <div className="seg" role="tablist" aria-label="表示する内容">
        {CONTENTS.map((c) => (
          <button type="button" key={c.id} role="tab" aria-selected={content === c.id}
            className={content === c.id ? 'active' : ''} onClick={() => setContent(c.id)}>{c.label}</button>
        ))}
      </div>

      <div className="months" ref={stripRef} role="tablist" aria-label="月">
        {mode === 'list' && (
          <button type="button" role="tab" className={`month-btn${month === ALL_KEY ? ' active' : ''}`} aria-selected={month === ALL_KEY} onClick={() => setMonth(ALL_KEY)}>ALL</button>
        )}
        {months.map((mk) => {
          const { year, month: label } = monthLabel(mk);
          return (
            <button type="button" role="tab" key={mk} className={`month-btn${month === mk ? ' active' : ''}`} aria-selected={month === mk} onClick={() => setMonth(mk)}>
              <small>{year}</small>{label}
            </button>
          );
        })}
      </div>

      <div className="filters" aria-label="大会フィルタ">
        {COMPETITION_ORDER.map((id) => (
          <CompetitionChip key={id} id={id} off={!comps.has(id)} onClick={() => toggleComp(id)} />
        ))}
      </div>

      {content === 'ticket' ? (
        mode === 'calendar' && month !== ALL_KEY ? (
          <TicketCalendar month={month} fixtures={filtered} now={now} onOpen={openMatch} />
        ) : (
          <TicketList fixtures={filtered} month={month === ALL_KEY ? null : month} now={now} onOpen={openMatch} />
        )
      ) : mode === 'calendar' && month !== ALL_KEY ? (
        <MatchCalendar month={month} fixtures={filtered} now={now} onOpen={openMatch} />
      ) : (
        <>
          <div className="card">
            {list.length === 0 && <p className="empty">該当する試合がありません</p>}
            {list.map((f) => <MatchRow key={f.id} f={f} now={now} onOpen={openMatch} />)}
          </div>
          <p className="note">※ 2027年開催分の詳細（日付・時刻）は12月上旬に発表予定。出典: 柏レイソル公式サイト（2026-09-22 時点）</p>
        </>
      )}
    </div>
  );
};

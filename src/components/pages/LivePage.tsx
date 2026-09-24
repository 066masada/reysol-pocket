import { useNavigation, type LiveView } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { useData } from '../../data/store';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { BOARD_BY_CLUB, boardUrl } from '../../data/boards';
import { STADIUMS } from '../../data/stadiums';
import {
  isInMatchWindow, kickoffDate, nextFixture, opponentId, outcome,
  scoreForKashiwa, sortedFixtures, withLiveScore,
} from '../../utils/fixtures';
import { fmtDateJa, fmtTime, isSameDay } from '../../utils/date';
import { openExternal } from '../../utils/external';
import { MatchHero } from '../match/MatchHero';
import { StandingsView } from '../standings/StandingsView';
import { IconExternal, IconPlay } from '../ui/Icons';

const JLEAGUE_LIVE = 'https://www.jleague.jp/match/';
const DAZN = 'https://www.dazn.com/ja-JP/home';

const VIEWS: { id: LiveView; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'standings', label: '順位・成績' },
];

/** 他会場・配信への導線 */
const AllVenues = ({ note }: { note?: string }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
    <span className="eyebrow">All venues</span>
    <div className="card">
      <button type="button" className="link-row" onClick={() => openExternal(JLEAGUE_LIVE)}>
        <span className="link-ico" style={{ background: 'var(--night)', color: 'var(--sun)' }}>J</span>
        <span className="lbl"><b>Jリーグ公式 試合速報</b><small>全会場のスコア・経過をリアルタイムで</small></span>
        <span className="arrow"><IconExternal /></span>
      </button>
      <button type="button" className="link-row" onClick={() => openExternal(DAZN)}>
        <span className="link-ico" style={{ background: '#0C161C', color: '#F8F8F8' }}><IconPlay /></span>
        <span className="lbl"><b>DAZN</b><small>ライブ配信・見逃し</small></span>
        <span className="arrow"><IconExternal /></span>
      </button>
    </div>
    {note && <p className="note">{note}</p>}
  </section>
);

/**
 * 試合中はスコアを大きく出す。
 * それ以外は「試合中ではない」ことが分かれば十分で、試合前後の詳しい情報はホームが受け持つ。
 */
export const LivePage = () => {
  const now = useNow(1000);
  const { openMatch, navigate, view } = useNavigation();
  useData();
  const current: LiveView = view ?? 'today';

  const todays = sortedFixtures().filter((f) => isSameDay(kickoffDate(f), now)).map(withLiveScore);
  const live = todays.find((f) => isInMatchWindow(f, now));
  const next = nextFixture(now);

  const todayUpcoming = todays.find((f) => kickoffDate(f).getTime() > now.getTime());
  // すでにキックオフを過ぎた今日の試合（スコアが未取得でも「次の試合」には飛ばさない）
  const todayPast = [...todays].reverse().find((f) => kickoffDate(f).getTime() <= now.getTime());

  const opp = live ? getClub(opponentId(live)) : null;
  const oppBoard = opp ? BOARD_BY_CLUB[opp.id] : undefined;
  const kashiwa = getClub('kashiwa');

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">{current === 'today' ? 'LIVE' : '順位・成績'}</h1>
        <span className="eyebrow">{fmtDateJa(now)}</span>
      </div>

      <div className="seg" role="tablist">
        {VIEWS.map((v) => (
          <button type="button" key={v.id} role="tab" aria-selected={current === v.id} className={current === v.id ? 'active' : ''} onClick={() => navigate('live', v.id)}>{v.label}</button>
        ))}
      </div>

      {current === 'standings' ? (
        <StandingsView onOpen={openMatch} />
      ) : live ? (
        <>
          <MatchHero f={live} now={now} onOpen={openMatch} />

          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">実況を見る</span>
            <div className="bb-pair">
              <button type="button" className="bb-btn" style={{ borderTopColor: kashiwa.color }}
                onClick={() => openExternal(boardUrl('reysol'))}>
                <span className="bb-dot" style={{ background: kashiwa.color, color: kashiwa.textOnColor ?? '#fff' }}>柏</span>
                <span className="bb-name">柏レイソル</span>
                <span className="bb-sub">超柏レイソル掲示板</span>
              </button>
              {oppBoard && opp ? (
                <button type="button" className="bb-btn" style={{ borderTopColor: opp.color }}
                  onClick={() => openExternal(boardUrl(oppBoard.slug))}>
                  <span className="bb-dot" style={{ background: opp.color, color: opp.textOnColor ?? '#fff' }}>
                    {opp.short.slice(0, 2)}
                  </span>
                  <span className="bb-name">{opp.short}</span>
                  <span className="bb-sub">相手サポの掲示板</span>
                </button>
              ) : (
                <button type="button" className="bb-btn" style={{ borderTopColor: 'var(--night)' }}
                  onClick={() => openExternal(boardUrl('j1'))}>
                  <span className="bb-dot" style={{ background: 'var(--night)', color: 'var(--sun)' }}>J1</span>
                  <span className="bb-name">J1総合</span>
                  <span className="bb-sub">リーグ全体の話題</span>
                </button>
              )}
            </div>
          </section>

          <AllVenues />
        </>
      ) : (
        <>
          <section className="nolive">
            <span className="nolive-mark" aria-hidden />
            <b className="nolive-title">いまは試合中ではありません</b>

            {todayPast ? (
              <button type="button" className="nolive-line" onClick={() => openMatch(todayPast.id)}>
                本日の試合は終了{' '}
                {todayPast.score
                  ? <b className={`num res-${outcome(todayPast) ?? 'D'}`}>{scoreForKashiwa(todayPast)}</b>
                  : <b>結果を確認</b>}
                <span> vs {getClub(opponentId(todayPast)).name}</span>
              </button>
            ) : todayUpcoming ? (
              <button type="button" className="nolive-line" onClick={() => openMatch(todayUpcoming.id)}>
                本日 <b className="num">{fmtTime(kickoffDate(todayUpcoming))}</b> キックオフ
                <span> · {getClub(opponentId(todayUpcoming)).name}</span>
              </button>
            ) : next ? (
              <button type="button" className="nolive-line" onClick={() => openMatch(next.id)}>
                次の試合は{' '}
                <b>
                  {next.timeTBD && next.dateLabel
                    ? next.dateLabel
                    : `${fmtDateJa(kickoffDate(next))} ${fmtTime(kickoffDate(next))}`}
                </b>
                <span>
                  {' '}· {COMPETITIONS[next.competition].short} {next.round} · {getClub(opponentId(next)).name}
                  {next.stadiumId ? ` · ${STADIUMS[next.stadiumId]?.short ?? ''}` : ''}
                </span>
              </button>
            ) : (
              <span className="nolive-line static">今シーズンの試合はすべて終了しました</span>
            )}

            <button type="button" className="btn btn-line btn-sm nolive-btn" onClick={() => navigate('home')}>
              ホームで詳しく見る →
            </button>
          </section>

          <AllVenues note="柏の試合がなくても、他会場は試合をしているかもしれません。" />
        </>
      )}
    </div>
  );
};

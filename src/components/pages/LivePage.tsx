import { useNavigation, type LiveView } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { useData } from '../../data/store';
import { COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { BOARD_BY_CLUB, boardUrl } from '../../data/boards';
import { isInMatchWindow, kickoffDate, nextFixture, opponentId, sortedFixtures, isHome, outcome, scoreForKashiwa, withLiveScore } from '../../utils/fixtures';
import { countdownTo, fmtDateJa, fmtTime, isSameDay } from '../../utils/date';
import { openExternal } from '../../utils/external';
import { MatchHero } from '../match/MatchHero';
import { CompetitionChip } from '../match/Parts';
import { StandingsView } from '../standings/StandingsView';
import { IconExternal, IconPlay } from '../ui/Icons';

const JLEAGUE_LIVE = 'https://www.jleague.jp/match/';
const DAZN = 'https://www.dazn.com/ja-JP/home';

const VIEWS: { id: LiveView; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'standings', label: '順位・成績' },
];

/**
 * Phase 1: ライブデータ取得は未実装。
 * 「今日の柏の試合」を時刻ベースで判定し、公式速報・配信への導線を出す。
 * Phase 2 で RTDB /live を購読して全会場スコアに置き換える。
 */
export const LivePage = () => {
  const now = useNow(1000);
  const { openMatch, navigate, view } = useNavigation();
  useData();
  const current: LiveView = view ?? 'today';
  const next = nextFixture(now);
  const todays = sortedFixtures().filter((f) => isSameDay(kickoffDate(f), now)).map(withLiveScore);
  const live = todays.find((f) => isInMatchWindow(f, now));
  const cd = next ? countdownTo(kickoffDate(next), now) : null;

  // 掲示板の導線は「試合中 → 今日の試合 → 次の試合」の順に対象を選ぶ
  const focus = live ?? todays[0] ?? next;
  const opp = focus ? getClub(opponentId(focus)) : null;
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
      ) : (
        <>
          {live ? (
            <MatchHero f={live} now={now} onOpen={openMatch} />
          ) : todays.length > 0 ? (
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <span className="eyebrow">Today</span>
              {todays.map((f) => {
                const opp = getClub(opponentId(f));
                return (
                  <button type="button" key={f.id} className="row" onClick={() => openMatch(f.id)} style={{ padding: '8px 0' }}>
                    <CompetitionChip id={f.competition} />
                    <div className="m">{opp.name}<small>{COMPETITIONS[f.competition].short} {f.round} · {isHome(f) ? 'H' : 'A'}</small></div>
                    <span className={`sc${f.score ? ` res-${outcome(f) ?? 'D'}` : ''}`}>
                      {f.score ? scoreForKashiwa(f) : f.timeTBD ? '--:--' : fmtTime(kickoffDate(f))}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="card live-empty">
              <span className="eyebrow">Next kickoff</span>
              {next && cd ? (
                <>
                  <div className="big num">{cd.days}<span style={{ fontSize: 16, marginLeft: 4 }}>日</span> {String(cd.hours).padStart(2, '0')}:{String(cd.minutes).padStart(2, '0')}</div>
                  <div style={{ fontSize: 13 }}>
                    {COMPETITIONS[next.competition].short} {next.round} · {getClub(opponentId(next)).name}
                  </div>
                  <button type="button" className="btn btn-night btn-sm" onClick={() => openMatch(next.id)}>試合詳細</button>
                </>
              ) : (
                <p className="empty">今シーズンの試合はすべて終了しました</p>
              )}
            </div>
          )}

          {focus && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <span className="eyebrow">{live ? '実況を見る' : '掲示板'}</span>
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
                    <span className="bb-sub">{opp?.country ? '相手の掲示板はなし' : 'リーグ全体の話題'}</span>
                  </button>
                )}
              </div>
              <p className="note">
                {live
                  ? `${opp?.name ?? ''}戦の実況。ゴールの瞬間は掲示板がいちばん速いことも。`
                  : `${opp?.name ?? ''}戦に向けた話題を見る。`}
              </p>
            </section>
          )}

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
            <p className="note">全会場スコアのアプリ内リアルタイム表示は Phase 2（API-Football + Cloud Functions）で対応予定です。</p>
          </section>
        </>
      )}
    </div>
  );
};

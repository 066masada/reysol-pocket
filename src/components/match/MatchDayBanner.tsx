import type { Fixture } from '../../types';
import type { MatchPhase } from '../../utils/fixtures';
import { BROADCASTS, COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { BOARD_BY_CLUB, boardUrl } from '../../data/boards';
import { STADIUMS } from '../../data/stadiums';
import { isHome, kickoffDate, opponentId, outcome, scoreForKashiwa, ticketState } from '../../utils/fixtures';
import { countdownTo, fmtTime, pad2 } from '../../utils/date';
import { mapsDirectionsUrl, openExternal } from '../../utils/external';
import { useWeather } from '../../hooks/useWeather';
import { useData } from '../../data/store';
import { STATUS_LABEL } from '../../utils/livescore';
import { WeatherLine } from './WeatherLine';
import { weatherTip } from '../../utils/weather';
import { IconBoard, IconExternal, IconMap, IconPlay, IconTicket } from '../ui/Icons';

const JLEAGUE_LIVE = 'https://www.jleague.jp/match/';

const HEAD: Record<Exclude<MatchPhase, 'none'>, string> = {
  today: '今日は試合',
  soon: 'まもなくキックオフ',
  live: '試合中',
  justFinished: '試合終了',
};

/**
 * 試合当日だけホーム最上段に出る帯。
 * 局面（当日 / 直前 / 試合中 / 終了直後）で中身とボタンが変わる。
 * 終了直後は掲示板ボタンを最上段に置く（試合後に一番押されるため）。
 */
export const MatchDayBanner = ({ f, phase, now, onOpen }: {
  f: Fixture; phase: Exclude<MatchPhase, 'none'>; now: Date; onOpen: (id: string) => void;
}) => {
  const comp = COMPETITIONS[f.competition];
  const opp = getClub(opponentId(f));
  const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
  const d = kickoffDate(f);
  const home = isHome(f);
  const cd = countdownTo(d, now);
  const elapsed = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60000));
  const w = useWeather(f, now);
  const tip = w ? weatherTip(w) : null;
  const board = BOARD_BY_CLUB[opp.id];
  const bc = comp.broadcast[0] ? BROADCASTS[comp.broadcast[0]] : undefined;
  const tk = ticketState(f, now);
  const o = outcome(f);
  const { live: ls } = useData();
  const score = ls && ls.fixtureId === f.id ? ls : null;

  return (
    <section className={`mdb mdb-${phase}`} aria-label={HEAD[phase]}>
      <div className="mdb-head">
        <span className="mdb-title">
          {phase === 'live' && <span className="chip chip-live">● LIVE</span>}
          {HEAD[phase]}
        </span>
        <span className="mdb-when num">
          {phase === 'live' ? (score ? `${score.reysol}-${score.opponent}` : `${elapsed}′`) :
           phase === 'justFinished' ? (f.score ? (o === 'W' ? '勝利' : o === 'L' ? '敗戦' : '引き分け') : '結果を確認') :
           phase === 'soon' ? `あと ${pad2(cd.hours)}:${pad2(cd.minutes)}:${pad2(cd.seconds)}` :
           `${fmtTime(d)} キックオフ`}
        </span>
      </div>

      <button type="button" className="mdb-match" onClick={() => onOpen(f.id)}>
        <span className="mdb-vs">
          <span className={`ha${home ? '' : ' ha-a'}`}>{home ? 'HOME' : 'AWAY'}</span>
          <b>vs {opp.name}</b>
        </span>
        <span className="mdb-sub">
          {comp.short} {f.round} · {st?.short ?? '会場未定'}
          {phase === 'live' && score ? ` · ${score.minute !== null ? `${score.minute}′ ` : ''}${STATUS_LABEL[score.status]}` : ''}
          {phase === 'justFinished' && f.score ? ` · ${scoreForKashiwa(f)}` : ''}
        </span>
      </button>

      {w && (phase === 'today' || phase === 'soon') && (
        <div className="mdb-wx">
          <WeatherLine w={w} onDark />
          {tip && <p className="mdb-tip">{tip}</p>}
        </div>
      )}

      <div className="mdb-actions">
        {phase === 'justFinished' && !f.score && (
          <button type="button" className="btn btn-ghost btn-block" onClick={() => openExternal(JLEAGUE_LIVE)}>
            <IconExternal />公式で結果を見る
          </button>
        )}
        {phase === 'justFinished' && board && (
          <button type="button" className="btn btn-sun btn-block" onClick={() => openExternal(boardUrl(board.slug))}>
            <IconBoard />掲示板で感想を見る
          </button>
        )}
        {phase === 'justFinished' && (
          <button type="button" className="btn btn-ghost btn-block" onClick={() => openExternal(boardUrl('reysol'))}>
            <IconBoard />超柏レイソル掲示板
          </button>
        )}

        {phase === 'live' && (
          <>
            <button type="button" className="btn btn-sun btn-block" onClick={() => openExternal(JLEAGUE_LIVE)}>
              <IconExternal />公式速報を見る
            </button>
            {bc && (
              <button type="button" className="btn btn-ghost btn-block" onClick={() => openExternal(bc.url)}>
                <IconPlay />{bc.name}で観る
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-block" onClick={() => openExternal(boardUrl('reysol'))}>
              <IconBoard />掲示板で実況を見る
            </button>
          </>
        )}

        {(phase === 'today' || phase === 'soon') && (
          <div className="mdb-grid">
            {home ? (
              <>
                {st && (
                  <button type="button" className="btn btn-sun" onClick={() => openExternal(mapsDirectionsUrl(st))}>
                    <IconMap />日立台へ
                  </button>
                )}
                {f.ticketUrl && tk !== 'upcoming' && (
                  <button type="button" className="btn btn-ghost" onClick={() => openExternal(f.ticketUrl!)}>
                    <IconTicket />チケット
                  </button>
                )}
              </>
            ) : (
              <>
                {bc && (
                  <button type="button" className="btn btn-sun" onClick={() => openExternal(bc.url)}>
                    <IconPlay />{bc.name}で観る
                  </button>
                )}
                {st && (
                  <button type="button" className="btn btn-ghost" onClick={() => openExternal(mapsDirectionsUrl(st))}>
                    <IconMap />会場へ
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

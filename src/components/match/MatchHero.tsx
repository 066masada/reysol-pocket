import type { Fixture } from '../../types';
import { BROADCASTS, COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { STADIUMS } from '../../data/stadiums';
import { isHome, isInMatchWindow, kickoffDate, ticketState } from '../../utils/fixtures';
import { countdownTo, fmtTime, pad2, weekdayEn } from '../../utils/date';
import { mapsDirectionsUrl, openExternal } from '../../utils/external';
import { useData } from '../../data/store';
import { STATUS_LABEL } from '../../utils/livescore';
import { CompetitionChip, Crest } from './Parts';
import { IconMap, IconPlay, IconTicket } from '../ui/Icons';

interface Props {
  f: Fixture;
  now: Date;
  onOpen: (id: string) => void;
}

export const MatchHero = ({ f, now, onOpen }: Props) => {
  const comp = COMPETITIONS[f.competition];
  const home = getClub(f.home);
  const away = getClub(f.away);
  const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
  const d = kickoffDate(f);
  const live = isInMatchWindow(f, now);
  const cd = countdownTo(d, now);
  const tk = ticketState(f, now);
  const bc = comp.broadcast[0] ? BROADCASTS[comp.broadcast[0]] : undefined;
  const elapsed = live ? Math.floor((now.getTime() - d.getTime()) / 60000) : 0;
  const { live: ls } = useData();
  const score = ls && ls.fixtureId === f.id ? ls : null;

  return (
    <section className="hero" aria-label={live ? '試合中' : '次の試合'}>
      <div className="hero-meta">
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <CompetitionChip id={f.competition} label={`${comp.short} · ${f.round}`} />
          {live && <span className="chip chip-live">● LIVE</span>}
        </span>
        <span>{isHome(f) ? 'HOME' : 'AWAY'}</span>
      </div>

      <button type="button" className="hero-teams" onClick={() => onOpen(f.id)} style={{ width: '100%' }} aria-label="試合詳細を開く">
        <div className="hero-team">
          <Crest club={home} />
          <b>{home.name}</b>
          <span>{home.country ?? 'HOME'}</span>
        </div>
        <div className="hero-ko">
          {live ? (
            <>
              <div className="hero-score">{score ? (isHome(f) ? `${score.reysol}–${score.opponent}` : `${score.opponent}–${score.reysol}`) : '–'}</div>
              <div className="d" style={{ color: 'var(--live)' }}>
                {score
                  ? `${score.minute !== null ? `${score.minute}′ ` : ''}${STATUS_LABEL[score.status]}`
                  : `${elapsed}′ 進行中`}
              </div>
            </>
          ) : (
            <>
              <div className="t">{f.timeTBD ? '--:--' : fmtTime(d)}</div>
              <div className="d">
                {f.timeTBD && f.dateLabel ? f.dateLabel : `${d.getMonth() + 1}.${d.getDate()} ${weekdayEn(d)}`}
              </div>
            </>
          )}
        </div>
        <div className="hero-team">
          <Crest club={away} />
          <b>{away.name}</b>
          <span>{away.country ?? 'AWAY'}</span>
        </div>
      </button>

      {!live && !f.timeTBD && (
        <div className="count" aria-label="キックオフまで">
          <div><div className="n">{cd.days}</div><div className="u">days</div></div>
          <div><div className="n">{pad2(cd.hours)}</div><div className="u">hrs</div></div>
          <div><div className="n">{pad2(cd.minutes)}</div><div className="u">min</div></div>
          <div><div className="n">{pad2(cd.seconds)}</div><div className="u">sec</div></div>
        </div>
      )}
      {live && (
        <p className="hero-venue" style={{ marginTop: 0, marginBottom: 'var(--s-3)' }}>
          {score ? '10秒ごとに自動更新中' : 'スコアを取得中…'}
        </p>
      )}

      <div className="hero-ctas" style={bc ? undefined : { gridTemplateColumns: '1fr 1fr' }}>
        <button
          type="button"
          className={`btn ${tk === 'onsale' || tk === 'presale' ? 'btn-sun' : 'btn-ghost'}`}
          disabled={!f.ticketUrl}
          onClick={() => f.ticketUrl && openExternal(f.ticketUrl)}
        >
          <IconTicket />{tk === 'upcoming' ? '発売前' : 'チケット'}
        </button>
        {bc && (
          <button type="button" className="btn btn-ghost" onClick={() => openExternal(bc.url)}>
            <IconPlay />{bc.name}
          </button>
        )}
        <button type="button" className="btn btn-ghost" disabled={!st} onClick={() => st && openExternal(mapsDirectionsUrl(st))}>
          <IconMap />行き方
        </button>
      </div>
      <p className="hero-venue">{st?.name ?? '会場未定'}{f.note ? ` · ${f.note}` : ''}</p>
    </section>
  );
};

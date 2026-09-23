import { useNavigation } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { COMPETITIONS } from '../../data/competitions';
import { getClub, KASHIWA_ID } from '../../data/clubs';
import { boardUrl } from '../../data/boards';
import { HOME_STADIUM } from '../../data/stadiums';
import { TICKET_LINKS, SEASON } from '../../data/schedule';
import { useData } from '../../data/store';
import {
  focusFixture, isHome, j1Record, matchPhase, nextFixture, opponentId,
  recentResults, scoreForKashiwa, kickoffDate,
} from '../../utils/fixtures';
import { fmtMonthDay } from '../../utils/date';
import { mapsDirectionsUrl, openExternal } from '../../utils/external';
import { MatchHero } from '../match/MatchHero';
import { MatchDayBanner } from '../match/MatchDayBanner';
import { ResultDot } from '../match/Parts';
import { InstallBanner } from '../ui/InstallBanner';
import { IconBoard, IconMap, IconPlay, IconTicket } from '../ui/Icons';

export const HomePage = () => {
  const now = useNow(1000);
  const { navigate, openMatch } = useNavigation();
  const { standings: J1_STANDINGS } = useData();

  // 試合当日は当日モードの帯を最上段に出し、ヒーローは次の試合を示す
  const focus = focusFixture(now);
  const phase = matchPhase(focus, now);
  const next = nextFixture(now);
  const hero = phase === 'none' ? next : (next && next.id !== focus?.id ? next : undefined);

  const recent = recentResults(3);
  const rec = j1Record();
  const myRank = J1_STANDINGS.rows.find((r) => r.clubId === KASHIWA_ID)?.rank;
  // 柏を中心に前後2クラブ（上端・下端では5行に揃える）
  const start = Math.max(0, Math.min((myRank ?? 1) - 3, J1_STANDINGS.rows.length - 5));
  const miniRows = J1_STANDINGS.rows.slice(start, start + 5);

  return (
    <div className="page">
      {focus && phase !== 'none' && (
        <MatchDayBanner f={focus} phase={phase} now={now} onOpen={openMatch} />
      )}

      {hero ? (
        <MatchHero f={hero} now={now} onOpen={openMatch} />
      ) : phase === 'none' ? (
        <section className="hero"><p className="empty" style={{ color: 'var(--on-night-2)' }}>今シーズンの日程はすべて終了しました</p></section>
      ) : null}

      <InstallBanner />

      <nav className="quick" aria-label="ショートカット">
        <button type="button" onClick={() => openExternal(TICKET_LINKS.official)}><IconTicket />チケット</button>
        <button type="button" onClick={() => openExternal('https://www.dazn.com/ja-JP/home')}><IconPlay />DAZN</button>
        <button type="button" onClick={() => openExternal(boardUrl('reysol'))}><IconBoard />掲示板</button>
        <button type="button" onClick={() => openExternal(mapsDirectionsUrl(HOME_STADIUM))}><IconMap />日立台へ</button>
      </nav>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <div className="sec-head">
          <span className="eyebrow">J1 {SEASON} · {J1_STANDINGS.asOf}</span>
          <button type="button" className="link" onClick={() => navigate('live', 'standings')}>順位・成績 →</button>
        </div>
        <div className="card">
          <div className="stat-grid" style={{ borderBottom: '1px solid var(--rule)' }}>
            <div className="stat"><div className="n">{myRank ? `${myRank}位` : '–'}</div><div className="l">順位</div></div>
            <div className="stat"><div className="n">{rec.points}</div><div className="l">勝点</div></div>
            <div className="stat"><div className="n">{rec.won}-{rec.drawn}-{rec.lost}</div><div className="l">勝-分-敗</div></div>
            <div className="stat"><div className="n">{rec.gf - rec.ga > 0 ? '+' : ''}{rec.gf - rec.ga}</div><div className="l">得失点</div></div>
          </div>
          <div className="mini-std">
            {miniRows.map((r) => (
              <button type="button" key={r.clubId} className={`mini-row${r.clubId === KASHIWA_ID ? ' me' : ''}`} onClick={() => navigate('live', 'standings')}>
                <span className="num r">{r.rank}</span>
                <span className="c">{getClub(r.clubId).name}</span>
                <span className="num">{r.won}-{r.drawn}-{r.lost}</span>
                <span className="num gd">{r.gf - r.ga > 0 ? '+' : ''}{r.gf - r.ga}</span>
                <span className="num p">{r.points}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <div className="sec-head">
          <span className="eyebrow">Recent</span>
          <button type="button" className="link" onClick={() => navigate('schedule')}>すべての日程 →</button>
        </div>
        <div className="card">
          {recent.length === 0 && <p className="empty">まだ結果がありません</p>}
          {recent.map((f) => {
            const opp = getClub(opponentId(f));
            const d = kickoffDate(f);
            return (
              <button type="button" key={f.id} className="row" onClick={() => openMatch(f.id)}>
                <ResultDot f={f} />
                <div className="m">
                  {opp.name}
                  <small>{COMPETITIONS[f.competition].short} {f.round} · {isHome(f) ? 'H' : 'A'} · {fmtMonthDay(d)}</small>
                </div>
                <span className="sc">{scoreForKashiwa(f)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

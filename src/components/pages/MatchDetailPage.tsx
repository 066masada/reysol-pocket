import { useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { useWeather } from '../../hooks/useWeather';
import { BROADCASTS, COMPETITIONS } from '../../data/competitions';
import { getClub } from '../../data/clubs';
import { BOARD_BY_CLUB, boardUrl } from '../../data/boards';
import { STADIUMS } from '../../data/stadiums';
import { TICKET_LINKS } from '../../data/schedule';
import { highlightUrl } from '../../data/links';
import { useData } from '../../data/store';
import { isHome, isInMatchWindow, kickoffDate, opponentId, outcome, ticketState, SALE_COLOR, SALE_LABEL } from '../../utils/fixtures';
import { fmtDateFull, fmtTime, fmtMonthDay } from '../../utils/date';
import { openExternal } from '../../utils/external';
import { downloadIcs, downloadSaleIcs } from '../../utils/ics';
import { CompetitionChip, Crest, HABadge } from '../match/Parts';
import { StadiumMap } from '../stadium/StadiumMap';
import { WeatherLine } from '../match/WeatherLine';
import { weatherTip } from '../../utils/weather';
import { IconBack, IconBoard, IconCalendarAdd, IconExternal, IconPlay, IconTicket } from '../ui/Icons';

const SPORTSNAVI_TEAM = 'https://soccer.yahoo.co.jp/jleague/team/132';
const JLEAGUE_MATCH = 'https://www.jleague.jp/match/';
const REYSOL_X = 'https://x.com/REYSOL_Official';
const OFFICIAL_NEWS = 'https://www.reysol.co.jp/news/topteam/';
const X_SEARCH = 'https://x.com/search?q=%23%E6%9F%8F%E3%83%AC%E3%82%A4%E3%82%BD%E3%83%AB&f=live';

export const MatchDetailPage = ({ id }: { id: string }) => {
  const { closeMatch } = useNavigation();
  const now = useNow(1000);
  const { fixtures } = useData();
  const f = fixtures.find((x) => x.id === id);
  const weather = useWeather(f, now);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!f) {
    return (
      <div className="detail"><div className="detail-inner">
        <div className="detail-bar"><div className="detail-bar-inner"><button type="button" onClick={closeMatch}><IconBack />戻る</button></div></div>
        <p className="empty">試合が見つかりません</p>
      </div></div>
    );
  }

  const comp = COMPETITIONS[f.competition];
  const home = getClub(f.home);
  const away = getClub(f.away);
  const opp = getClub(opponentId(f));
  const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
  const d = kickoffDate(f);
  const live = isInMatchWindow(f, now);
  const o = outcome(f);
  const tk = ticketState(f, now);
  const board = BOARD_BY_CLUB[opp.id];

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label="試合詳細">
      <div className="detail-inner">
        <div className="detail-bar">
          <div className="detail-bar-inner">
            <button type="button" onClick={closeMatch}><IconBack />戻る</button>
            <span className="title">{comp.short} · {f.round}</span>
          </div>
        </div>

        <div className="detail-body">
          <section className="hero">
            <div className="hero-meta">
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <CompetitionChip id={f.competition} />
                {live && <span className="chip chip-live">● LIVE</span>}
              </span>
              <HABadge home={isHome(f)} />
            </div>
            <div className="hero-teams">
              <div className="hero-team"><Crest club={home} /><b>{home.name}</b><span>{home.country ?? 'HOME'}</span></div>
              <div className="hero-ko">
                {f.score ? (
                  <div className="hero-score">{f.score.home}–{f.score.away}</div>
                ) : (
                  <div className="t">{f.timeTBD ? '--:--' : fmtTime(d)}</div>
                )}
                <div className="d">{f.timeTBD && f.dateLabel ? f.dateLabel : fmtDateFull(d)}</div>
              </div>
              <div className="hero-team"><Crest club={away} /><b>{away.name}</b><span>{away.country ?? 'AWAY'}</span></div>
            </div>
            {f.score?.note && <p className="hero-venue">{f.score.note}</p>}
            {o && <p className="hero-venue">柏レイソル {o === 'W' ? '勝利' : o === 'D' ? '引き分け' : '敗戦'}</p>}
          </section>

          <dl className="kv card card-pad">
            <dt>大会</dt><dd>{comp.name}</dd>
            <dt>節</dt><dd>{f.round}</dd>
            <dt>日時</dt><dd>{f.timeTBD && f.dateLabel ? `${f.dateLabel}（時刻未定）` : `${fmtDateFull(d)} ${fmtTime(d)} キックオフ`}</dd>
            <dt>会場</dt><dd>{st?.name ?? '未定'}</dd>
            {f.note && (<><dt>備考</dt><dd>{f.note}</dd></>)}
            {weather && (
              <>
                <dt>天気</dt>
                <dd>
                  <WeatherLine w={weather} />
                  {weatherTip(weather) && <div className="note" style={{ marginTop: 2 }}>{weatherTip(weather)}</div>}
                </dd>
              </>
            )}
            {f.ticketSales?.length ? (
              <>
                <dt>販売</dt>
                <dd>
                  <ol className="tl-phases in-kv">
                    {f.ticketSales.map((s) => {
                      const at = new Date(s.at);
                      const started = at.getTime() <= now.getTime();
                      return (
                        <li key={s.type} className={`tl-phase${started ? ' started' : ''}`}>
                          <span className="tl-dot" style={{ background: started ? SALE_COLOR[s.type] : 'transparent', borderColor: SALE_COLOR[s.type] }} />
                          <span className="tl-phase-label">{SALE_LABEL[s.type]}</span>
                          <span className="num tl-phase-at">{fmtMonthDay(at)} {fmtTime(at)}〜</span>
                          {!started && (
                            <button type="button" className="tl-add" onClick={() => downloadSaleIcs(f, s)} aria-label="発売日をカレンダーに追加">
                              <IconCalendarAdd />
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <div className="note" style={{ marginTop: 4 }}>アソシエイツ会員先行は試合前日まで</div>
                </dd>
              </>
            ) : null}
          </dl>

          {f.status !== 'ft' && (
            <div className="cta-grid">
              {f.ticketUrl ? (
                <button type="button" className={`btn ${tk === 'upcoming' ? 'btn-line' : 'btn-sun'}`} onClick={() => openExternal(f.ticketUrl!)}>
                  <IconTicket />{tk === 'upcoming' ? 'チケット（発売前）' : 'チケットを買う'}
                </button>
              ) : (
                <button type="button" className="btn btn-line" onClick={() => openExternal(TICKET_LINKS.jleague)}>
                  <IconTicket />Jリーグチケット
                </button>
              )}
              {comp.broadcast.map((b) => (
                <button type="button" key={b} className="btn btn-line" onClick={() => openExternal(BROADCASTS[b].url)}>
                  <IconPlay />{BROADCASTS[b].name}で観る
                </button>
              ))}
              <button type="button" className="btn btn-line" onClick={() => downloadIcs(f)}>
                <IconCalendarAdd />カレンダーに追加
              </button>
              {board && (
                <button type="button" className="btn btn-line" onClick={() => openExternal(boardUrl(board.slug))}>
                  <IconBoard />{opp.short}の掲示板
                </button>
              )}
            </div>
          )}
          {f.status === 'ft' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <span className="eyebrow">After the match</span>
              <div className="cta-grid">
                <button type="button" className="btn btn-sun" onClick={() => openExternal(boardUrl('reysol'))}>
                  <IconBoard />掲示板
                </button>
                <button type="button" className="btn btn-line" onClick={() => openExternal(highlightUrl(f.competition))}>
                  <IconPlay />ハイライト
                </button>
                <button type="button" className="btn btn-line" onClick={() => openExternal(X_SEARCH)}>
                  <IconExternal />X の反応
                </button>
                <button type="button" className="btn btn-line" onClick={() => openExternal(OFFICIAL_NEWS)}>
                  <IconExternal />公式ニュース
                </button>
                {board && (
                  <button type="button" className="btn btn-line" onClick={() => openExternal(boardUrl(board.slug))}>
                    <IconBoard />{opp.short}サポの掲示板
                  </button>
                )}
                <button type="button" className="btn btn-line" onClick={() => openExternal(f.lineupUrl ?? 'https://soccer.yahoo.co.jp/jleague/team/132')}>
                  <IconExternal />スタッツ
                </button>
              </div>
            </section>
          )}

          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">Lineup</span>
            <div className="card">
              <button type="button" className="link-row" onClick={() => openExternal(f.lineupUrl ?? SPORTSNAVI_TEAM)}>
                <span className="link-ico" style={{ background: '#FF0033', color: '#fff' }}>Y!</span>
                <span className="lbl">
                  <b>スポーツナビ{f.lineupUrl ? 'の試合ページ' : '（柏レイソル）'}</b>
                  <small>{f.lineupUrl ? 'スタメン・フォーメーション・スタッツ' : 'この試合のページはチーム日程から'}</small>
                </span>
                <span className="arrow"><IconExternal /></span>
              </button>
              <button type="button" className="link-row" onClick={() => openExternal(JLEAGUE_MATCH)}>
                <span className="link-ico" style={{ background: 'var(--night)', color: 'var(--sun)' }}>J</span>
                <span className="lbl"><b>Jリーグ公式 試合速報</b><small>メンバー・交代・カード</small></span>
                <span className="arrow"><IconExternal /></span>
              </button>
              <button type="button" className="link-row" onClick={() => openExternal(REYSOL_X)}>
                <span className="link-ico" style={{ background: '#000', color: '#fff' }}>𝕏</span>
                <span className="lbl"><b>柏レイソル公式X</b><small>キックオフ約1時間前にスタメン発表</small></span>
                <span className="arrow"><IconExternal /></span>
              </button>
            </div>
            {f.status !== 'ft' && (
              <p className="note">スタメンはキックオフの約1時間前に発表されます。</p>
            )}
          </section>

          {st && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <span className="eyebrow">Stadium</span>
              <StadiumMap stadium={st} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

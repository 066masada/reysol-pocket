import { useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNow } from '../../hooks/useNow';
import { useData } from '../../data/store';
import {
  ACLE, ACLE_OPPONENTS, ACLE_WATCH, EAST_ZONE, LEAGUE_GUIDES, OPPONENT_GUIDES,
  TRAVEL_GUIDES, TRAVEL_NOTE,
} from '../../data/acle';
import { COMPETITIONS } from '../../data/competitions';
import { getClub, KASHIWA_ID } from '../../data/clubs';
import { STADIUMS } from '../../data/stadiums';
import { fixturesFor, isHome, kickoffDate, opponentId, outcome, scoreForKashiwa } from '../../utils/fixtures';
import { countdownTo, fmtDateJa, fmtTime } from '../../utils/date';
import { openExternal } from '../../utils/external';
import { Crest } from '../match/Parts';
import { IconBack, IconExternal } from '../ui/Icons';

/** ACL特設ページ。大会の全体像・8試合の道のり・突破ラインまでの距離をまとめる */
export const AclePage = () => {
  const { navigate, openMatch } = useNavigation();
  const now = useNow(1000);
  const { acleStandings } = useData();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const fixtures = fixturesFor('acle');
  const played = fixtures.filter((f) => f.status === 'ft');
  const remaining = ACLE.matchdays - played.length;
  const next = fixtures.find((f) => f.status !== 'ft');
  const cd = next ? countdownTo(kickoffDate(next), now) : null;

  const table = acleStandings;
  const rows = table?.rows ?? [];
  const meIdx = rows.findIndex((r) => r.clubId === KASHIWA_ID);
  const me = meIdx >= 0 ? rows[meIdx] : null;
  const cut = rows[ACLE.qualifyRank - 1];
  const gapToCut = me && cut ? cut.points - me.points : null;

  const comp = COMPETITIONS.acle;

  return (
    <div className="detail acle" role="dialog" aria-modal="true" aria-label="ACL特設ページ">
      <div className="detail-inner">
        <div className="detail-bar">
          <div className="detail-bar-inner">
            <button type="button" onClick={() => navigate('more')}><IconBack />戻る</button>
            <span className="title">ACL ELITE {ACLE.season}</span>
          </div>
        </div>

        <div className="detail-body">
          {/* ── 今どこにいるか ── */}
          <section className="acle-hero">
            <p className="eyebrow" style={{ color: 'var(--on-night-2)' }}>East zone · {table?.asOf ?? '—'}</p>
            <div className="acle-standing">
              <span className="num acle-rank">{me ? me.rank : '–'}<small>位</small></span>
              <span className="acle-of">/ {ACLE.clubsPerZone}クラブ</span>
              <span className="num acle-pts">勝点{me?.points ?? 0}</span>
            </div>
            <div className="acle-cut">
              {gapToCut === null ? (
                <span>突破ラインは上位{ACLE.qualifyRank}位</span>
              ) : gapToCut <= 0 ? (
                <span className="in">突破圏内（{ACLE.qualifyRank}位まで） · {ACLE.qualifyRank}位と{-gapToCut}差</span>
              ) : (
                <span className="out">{ACLE.qualifyRank}位まで勝点{gapToCut}差</span>
              )}
              <span className="acle-remain">残り{remaining}試合</span>
            </div>
            {next && cd && (
              <button type="button" className="acle-next" onClick={() => openMatch(next.id)}>
                次は {next.round} · {getClub(opponentId(next)).name}
                <b className="num">{cd.days > 0 ? `あと${cd.days}日` : `${String(cd.hours).padStart(2, '0')}:${String(cd.minutes).padStart(2, '0')}`}</b>
              </button>
            )}
          </section>

          {/* ── 8試合の道のり ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">8試合の道のり</span>
            <div className="card">
              {fixtures.map((f) => {
                const opp = getClub(opponentId(f));
                const meta = ACLE_OPPONENTS[opp.id];
                const d = kickoffDate(f);
                const o = outcome(f);
                const st = f.stadiumId ? STADIUMS[f.stadiumId] : undefined;
                const isNext = next?.id === f.id;
                return (
                  <button type="button" key={f.id} className={`acle-row${isNext ? ' next' : ''}`} onClick={() => openMatch(f.id)}>
                    <span className="acle-md num">{f.round.replace('LS-', '')}</span>
                    <Crest club={opp} size="sm" />
                    <span className="acle-main">
                      <span className="acle-opp">
                        <span className={`ha${isHome(f) ? '' : ' ha-a'}`}>{isHome(f) ? 'H' : 'A'}</span>
                        {opp.name}
                      </span>
                      <span className="acle-sub">
                        {meta?.city ?? opp.country ?? ''}{st ? ` · ${st.short}` : ''}
                      </span>
                      {f.note && <span className="acle-note">{f.note}</span>}
                    </span>
                    <span className="acle-right num">
                      {f.status === 'ft' && f.score
                        ? <b className={`res-${o ?? 'D'}`}>{scoreForKashiwa(f)}</b>
                        : <>{fmtDateJa(d).replace('日(', '(')}<small>{fmtTime(d)}</small></>}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="note">キックオフはすべて日本時間。現地時刻が異なる試合は行内に併記しています。</p>
          </section>

          {/* ── 対戦相手ガイド ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">対戦相手 8クラブ</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {OPPONENT_GUIDES.map((g) => {
                const club = getClub(g.clubId);
                const meta = ACLE_OPPONENTS[g.clubId];
                const match = fixtures.find((f) => opponentId(f) === g.clubId);
                return (
                  <article key={g.clubId} className="card opp-card" style={{ borderTopColor: club.color }}>
                    <button type="button" className="opp-head" onClick={() => match && openMatch(match.id)}>
                      <Crest club={club} />
                      <span className="opp-title">
                        <b>{club.name}</b>
                        <span className="opp-tag">{g.tagline}</span>
                        <span className="opp-meta">{meta?.city} · {meta?.league}{match ? ` · ${match.round.replace('LS-', '')}` : ''}</span>
                      </span>
                    </button>
                    <p className="opp-about">{g.about}</p>
                    <dl className="opp-facts">
                      <dt>直近</dt><dd>{g.form}</dd>
                      {g.asia && (<><dt>アジア</dt><dd>{g.asia}</dd></>)}
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── アウェイ遠征ガイド ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">アウェイ遠征ガイド</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {TRAVEL_GUIDES.map((t) => {
                const club = getClub(t.clubId);
                const match = fixtures.find((f) => opponentId(f) === t.clubId);
                return (
                  <article key={t.clubId} className="card trip-card">
                    <div className="trip-head">
                      <span className="trip-city">{t.city}</span>
                      <span className="trip-meta">
                        {t.country} · {club.short}戦{match ? ` · ${fmtDateJa(kickoffDate(match))}` : ''}
                      </span>
                      <span className="trip-tz">{t.timeDiff}</span>
                    </div>
                    <dl className="trip-facts">
                      <dt>行き方</dt>
                      <dd><ul>{t.getting.map((g) => <li key={g}>{g}</li>)}</ul></dd>
                      <dt>会場まで</dt><dd>{t.toStadium}</dd>
                      <dt>入国</dt><dd>{t.entry}</dd>
                      <dt>お金</dt><dd>{t.money}</dd>
                      <dt>通信</dt><dd>{t.sim}</dd>
                      <dt>現地では</dt>
                      <dd><ul>{t.tips.map((x) => <li key={x}>{x}</li>)}</ul></dd>
                    </dl>
                    <button type="button" className="btn btn-line btn-sm btn-block" onClick={() => openExternal(t.mofaUrl)}>
                      <IconExternal />外務省 海外安全情報（{t.country}）
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="note">{TRAVEL_NOTE}</p>
          </section>

          {/* ── 相手国リーグ入門 ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">相手国リーグ入門</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {LEAGUE_GUIDES.map((l) => (
                <article key={l.key} className="card card-pad league-card">
                  <div className="league-head">
                    <b>{l.name}</b>
                    <span className="note">{l.country} · {l.format}</span>
                  </div>
                  <p className="opp-about" style={{ padding: 0 }}>{l.about}</p>
                  <p className="note">柏の相手: {l.opponents}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── 大会のしくみ ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">大会のしくみ</span>
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <div className="stat-grid" style={{ margin: 'calc(-1 * var(--s-4)) calc(-1 * var(--s-4)) 0' }}>
                <div className="stat"><div className="n">{ACLE.clubs}</div><div className="l">出場クラブ</div></div>
                <div className="stat"><div className="n">{ACLE.clubsPerZone}</div><div className="l">東地区</div></div>
                <div className="stat"><div className="n">{ACLE.matchdays}</div><div className="l">試合</div></div>
                <div className="stat"><div className="n">{ACLE.qualifyRank}</div><div className="l">突破</div></div>
              </div>
              <p className="note" style={{ color: 'var(--ink-2)' }}>
                東西に分かれた各16クラブが、<b>毎回違う相手と8試合</b>を戦う単一リーグ。
                各地区の<b>上位{ACLE.qualifyRank}クラブ</b>がラウンド16へ進みます。
              </p>
              <dl className="kv">
                {ACLE.knockout.map((k) => (
                  <div key={k.label} style={{ display: 'contents' }}>
                    <dt>{k.label}</dt>
                    <dd>{k.period}{k.note ? `（${k.note}）` : ''}</dd>
                  </div>
                ))}
                <dt>優勝すると</dt><dd>{ACLE.prize}</dd>
              </dl>
            </div>
          </section>

          {/* ── 東地区の顔ぶれ ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">東地区16クラブの内訳</span>
            <div className="card">
              {EAST_ZONE.map((z) => (
                <div key={z.country} className="zone-row">
                  <span className="zone-country">{z.country}</span>
                  <span className="num zone-count">{z.count}</span>
                  <span className="zone-clubs">{z.clubs}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 観る ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <span className="eyebrow">観る</span>
            <div className="card">
              {ACLE_WATCH.map((w) => (
                <button type="button" key={w.label} className="link-row" onClick={() => openExternal(w.url)}>
                  <span className="link-ico" style={{ background: comp.color, color: comp.textOnColor }}>AC</span>
                  <span className="lbl"><b>{w.label}</b><small>{w.description}</small></span>
                  <span className="arrow"><IconExternal /></span>
                </button>
              ))}
            </div>
          </section>

          <p className="note">
            順位表の出典: Wikipedia 日本語版（CC BY-SA）。クラブ・リーグの情報は 2026年9月時点のものです。
            アウェイ遠征ガイド（ラーチャブリー・ゴスフォード・浦項）は今後追加します。
          </p>
        </div>
      </div>
    </div>
  );
};

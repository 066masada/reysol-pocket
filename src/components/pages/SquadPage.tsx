import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { loadPlayers, type Player, type PlayersData, type Stint } from '../../data/players';
import { careerClub, textOn } from '../../data/careerClubs';
import { KASHIWA_ID } from '../../data/clubs';
import { IconBack } from '../ui/Icons';

/* ── 期間（月単位） ── */

/** "YYYY-MM" → 通し月 */
const mi = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const today = new Date();
const NOW = today.getFullYear() * 12 + today.getMonth();
const endOf = (s: Stint) => (s.to ? mi(s.to) : NOW + 1);

/** 1年の幅(px) */
const YEAR_W = 36;
const MONTH_W = YEAR_W / 12;

const yy = (m: number) => `'${String(Math.floor(m / 12) % 100).padStart(2, '0')}`;
/** '17–'20 / '23 / '25–現在 */
const fmtSpan = (from: number, to: number, ongoing: boolean) => {
  const a = yy(from);
  if (ongoing) return `${a}–現在`;
  const b = yy(to - 1);
  return a === b ? a : `${a}–${b}`;
};

/* ── ラベル・色 ── */

/** 同じ所属かどうかの鍵。クラブはアカデミーも含めてクラブ単位、学校は名前 */
const keyOf = (s: Stint) => s.org ?? `n:${s.label}`;

const academyTag = (label: string) => {
  const u = label.match(/U-?(\d+)/);
  if (u) return `U${u[1]}`;
  if (/ジュニアユース|Jrユース/.test(label)) return 'Jr';
  if (/ユース/.test(label)) return 'ユース';
  if (/TOR/.test(label)) return 'TOR';
  return '';
};

const cellLabel = (s: Stint) => {
  if (!s.org) return s.label.replace(/大学$/, '大');
  const short = careerClub(s.org)?.short ?? s.label;
  return s.kind === 'jy' || s.kind === 'youth' ? `${short}${academyTag(s.label)}` : short;
};

const titleOf = (s: Stint) => (s.org ? careerClub(s.org)?.name ?? s.label : s.label);

const KIND_LABEL: Record<Stint['kind'], string> = { jy: '中学年代', youth: 'ユース', school: '高校', univ: '大学', pro: '' };

const cellStyle = (s: Stint): CSSProperties | undefined => {
  const c = s.org ? careerClub(s.org) : null;
  return c ? { background: c.color, color: textOn(c) } : undefined;
};

/* ── 並び ── */

type SortKey = 'age' | 'no' | 'joined' | 'pos';
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'age', label: '年齢' },
  { id: 'no', label: '背番号' },
  { id: 'joined', label: '加入' },
  { id: 'pos', label: 'ポジション' },
];
const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

const sorters: Record<SortKey, (a: Player, b: Player) => number> = {
  age: (a, b) => a.born.localeCompare(b.born) || a.no - b.no,
  no: (a, b) => a.no - b.no,
  joined: (a, b) => b.joined.localeCompare(a.joined) || a.no - b.no,
  pos: (a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos] || a.no - b.no,
};

const ageOf = (born: string) => {
  const [y, m, d] = born.split('-').map(Number);
  const had = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  return today.getFullYear() - y - (had ? 0 : 1);
};

const familyName = (name: string) => name.split(/\s+/)[0];

/* ── つながり ── */

interface Overlap { a: Player; b: Player; from: number; to: number; label: string }

/** 同じ所属に同時期にいた組み合わせ。今まさに一緒（どちらも在籍中）のものは除く */
const overlapsAt = (key: string, players: Player[]): Overlap[] => {
  const out: Overlap[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i]!, b = players[j]!;
      let best: Overlap | null = null;
      for (const sa of a.stints) {
        if (keyOf(sa) !== key) continue;
        for (const sb of b.stints) {
          if (keyOf(sb) !== key || (sa.to === null && sb.to === null)) continue;
          const from = Math.max(mi(sa.from), mi(sb.from));
          const to = Math.min(endOf(sa), endOf(sb));
          if (to - from < 2) continue;
          // アカデミー同士なら区分を添える
          const label = sa.kind === sb.kind && sa.kind !== 'pro' ? academyTag(sa.label) || KIND_LABEL[sa.kind] : '';
          if (!best || to - from > best.to - best.from) best = { a, b, from, to, label };
        }
      }
      if (best) out.push(best);
    }
  }
  return out.sort((x, y) => y.to - x.to || y.from - x.from);
};

/** 柏 → よそ → 柏 と戻ってきた選手 */
const isReturnee = (p: Player) => {
  const seq = p.stints.filter((s) => s.kind !== 'school' && s.kind !== 'univ').map((s) => s.org === KASHIWA_ID);
  const first = seq.indexOf(true);
  return first >= 0 && seq.slice(first).includes(false) && seq[seq.length - 1] === true;
};

const isAcademy = (p: Player) => p.stints.some((s) => s.org === KASHIWA_ID && (s.kind === 'jy' || s.kind === 'youth'));

const proClubCount = (p: Player) => new Set(p.stints.filter((s) => s.kind === 'pro' && s.org).map((s) => s.org)).size;

/* ── 画面 ── */

interface Selection { key: string; title: string }

/** 選手の経歴マップ。ユース・大学・移籍の道のりを年表で並べ、同じ所属をたどれるようにする */
export const SquadPage = () => {
  const { navigate } = useNavigation();
  const [data, setData] = useState<PlayersData | null>(null);
  const [sort, setSort] = useState<SortKey>('age');
  const [withJy, setWithJy] = useState(false);
  const [sel, setSel] = useState<Selection | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let alive = true;
    loadPlayers().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, []);

  /** 表示する在籍（中学年代は切り替え） */
  const players = useMemo(() => (data?.players ?? []).map((p) => ({
    ...p,
    stints: withJy ? p.stints : p.stints.filter((s) => s.kind !== 'jy'),
  })), [data, withJy]);

  const start = useMemo(() => {
    const min = Math.min(...players.flatMap((p) => p.stints.map((s) => mi(s.from))));
    return Number.isFinite(min) ? Math.floor(min / 12) * 12 : NOW;
  }, [players]);
  const end = (Math.floor(NOW / 12) + 1) * 12;
  const years = Array.from({ length: (end - start) / 12 }, (_, i) => start / 12 + i);
  const trackW = (end - start) * MONTH_W;

  const matches = (p: Player) => !!sel && p.stints.some((s) => keyOf(s) === sel.key);

  const rows = useMemo(() => {
    const sorted = [...players].sort(sorters[sort]);
    if (!sel) return sorted;
    // 選んだ所属にいた選手を上に集める
    const hit = (p: Player) => p.stints.some((s) => keyOf(s) === sel.key);
    return [...sorted.filter(hit), ...sorted.filter((p) => !hit(p))];
  }, [players, sort, sel]);

  // 最近の年が見えるよう右端から
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data, withJy]);

  // 選んだら一覧の先頭へ。横は選んだ所属のいちばん古い在籍が見える位置まで
  useEffect(() => {
    const el = scroller.current;
    if (!sel || !el) return;
    const xs = [...el.querySelectorAll<HTMLElement>('.tl-cell.hit')].map((c) => c.offsetLeft);
    const nameW = el.querySelector<HTMLElement>('.tl-name')?.offsetWidth ?? 0;
    const visible = el.clientWidth - nameW;
    const min = Math.min(...xs);
    const left = xs.length && (min < el.scrollLeft || min > el.scrollLeft + visible - 40) ? Math.max(0, min - 12) : el.scrollLeft;
    el.scrollTo({ top: 0, left, behavior: 'smooth' });
  }, [sel]);

  const stats = useMemo(() => {
    const all = data?.players ?? [];
    const top = [...all].sort((a, b) => proClubCount(b) - proClubCount(a))[0];
    return {
      academy: all.filter(isAcademy).length,
      returnees: all.filter(isReturnee),
      traveler: top ? { name: familyName(top.name), n: proClubCount(top) } : null,
      total: all.length,
    };
  }, [data]);

  const picked = sel ? rows.filter(matches) : [];
  const overlaps = sel ? overlapsAt(sel.key, picked) : [];

  const toggle = (s: Stint) => {
    const key = keyOf(s);
    setSel((cur) => (cur?.key === key ? null : { key, title: titleOf(s) }));
  };

  return (
    <div className={`detail squad${sel ? ' has-sheet' : ''}`} role="dialog" aria-modal="true" aria-label="選手の経歴マップ">
      <div className="detail-inner">
        <div className="detail-bar">
          <div className="detail-bar-inner">
            <button type="button" onClick={() => navigate('more')}><IconBack />戻る</button>
            <span className="title">SQUAD CAREER {data?.season ?? ''}</span>
          </div>
        </div>

        <div className="detail-body">
          <div className="squad-controls">
            <div className="seg seg-sm" role="radiogroup" aria-label="並び順">
              {SORTS.map((s) => (
                <button type="button" key={s.id} role="radio" aria-checked={sort === s.id} className={sort === s.id ? 'active' : ''} onClick={() => setSort(s.id)}>{s.label}</button>
              ))}
            </div>
            <label className="squad-jy">
              <input type="checkbox" checked={withJy} onChange={(e) => setWithJy(e.target.checked)} />
              中学年代から
            </label>
          </div>

          {!data ? (
            <p className="note">読み込み中…</p>
          ) : (
            <div className="tl" ref={scroller}>
              <div className="tl-head">
                <div className="tl-name tl-corner">{sel ? `${sel.title}` : 'クラブをタップ'}</div>
                <div className="tl-track" style={{ width: trackW }}>
                  {years.map((y) => (
                    <span key={y} className="tl-year num" style={{ left: (y * 12 - start) * MONTH_W }}>'{String(y % 100).padStart(2, '0')}</span>
                  ))}
                </div>
              </div>

              {rows.map((p) => {
                const on = matches(p);
                return (
                  <div key={p.no} className={`tl-row${sel && !on ? ' dim' : ''}`}>
                    <div className="tl-name">
                      <span className="num tl-no">{p.no}</span>
                      <span className="tl-who">
                        <b>{p.name}</b>
                        <small>
                          {ageOf(p.born)}歳 · {p.pos}
                          {p.status === 'secondReg' && <em>2種</em>}
                          {p.status === 'designated' && <em>特指</em>}
                        </small>
                      </span>
                    </div>
                    <div className="tl-track" style={{ width: trackW }}>
                      {p.stints.map((s, i) => {
                        const x = (mi(s.from) - start) * MONTH_W;
                        const w = (endOf(s) - mi(s.from)) * MONTH_W;
                        const hit = sel?.key === keyOf(s);
                        const cls = [
                          'tl-cell',
                          s.org ? '' : s.kind === 'univ' ? 'c-univ' : 'c-school',
                          s.loan ? 'loan' : '',
                          w < 26 ? 'narrow' : '',
                          sel ? (hit ? 'hit' : 'off') : '',
                        ].filter(Boolean).join(' ');
                        return (
                          <button
                            type="button"
                            key={i}
                            className={cls}
                            style={{ left: x, width: Math.max(w - 1, 2), ...cellStyle(s) }}
                            title={`${s.label} ${fmtSpan(mi(s.from), endOf(s), s.to === null)}${s.loan ? '（期限付き）' : ''}`}
                            onClick={() => toggle(s)}
                          >
                            {w >= 10 && <span>{cellLabel(s)}</span>}
                          </button>
                        );
                      })}
                      <span className="tl-now" style={{ left: (NOW - start) * MONTH_W }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="squad-legend">
            <span><i className="c-school" />高校・街クラブ</span>
            <span><i className="c-univ" />大学</span>
            <span><i className="loan-swatch" />期限付き移籍</span>
            <span><i className="now-swatch" />現在</span>
          </div>

          {data && (
            <section className="squad-stats">
              <div><b className="num">{stats.academy}</b><small>柏アカデミー出身<br />（{stats.total}人中）</small></div>
              <div><b className="num">{stats.returnees.length}</b><small>柏に戻ってきた<br />{stats.returnees.map((p) => familyName(p.name)).join('・')}</small></div>
              {stats.traveler && <div><b className="num">{stats.traveler.n}</b><small>最多のプロ在籍クラブ数<br />{stats.traveler.name}</small></div>}
            </section>
          )}

          <p className="note">
            経歴は柏レイソル公式サイトの選手プロフィールより。
            高校・大学・中学年代の在籍年は公式に記載が無いため、生年月日から推定しています。
            クラブの色は各クラブカラーの近似です。
          </p>
        </div>
      </div>

      {sel && (
        <div className="squad-sheet" role="region" aria-label={`${sel.title}にいた選手`}>
          <div className="squad-sheet-head">
            <div>
              <span className="eyebrow">{picked.length}人が在籍</span>
              <h2>{sel.title}</h2>
            </div>
            <button type="button" className="btn btn-line btn-sm" onClick={() => setSel(null)}>閉じる</button>
          </div>

          <ul className="squad-who">
            {picked.map((p) => (
              <li key={p.no}>
                <span className="num">{p.no}</span>
                <b>{p.name}</b>
                <span className="spans">
                  {p.stints.filter((s) => keyOf(s) === sel.key).map((s, i) => (
                    <span key={i}>
                      {s.kind !== 'pro' && <em>{academyTag(s.label) || KIND_LABEL[s.kind]}</em>}
                      {fmtSpan(mi(s.from), endOf(s), s.to === null)}
                      {s.loan && <em>期限付き</em>}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>

          {overlaps.length > 0 && (
            <>
              <span className="eyebrow">同じ時期にいた</span>
              <ul className="squad-pairs">
                {overlaps.slice(0, 12).map((o) => (
                  <li key={`${o.a.no}-${o.b.no}`}>
                    <b>{familyName(o.a.name)}</b> × <b>{familyName(o.b.name)}</b>
                    <span className="num">{fmtSpan(o.from, o.to, false)}</span>
                    {o.label && <em>{o.label}</em>}
                  </li>
                ))}
              </ul>
              {overlaps.length > 12 && <p className="note">ほか {overlaps.length - 12} 組</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

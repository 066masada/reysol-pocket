import { useEffect, useMemo, useRef, useState } from 'react';
import type { Board } from '../../types';
import { BOARDS, BOARD_BASE, boardUrl } from '../../data/boards';
import { getClub } from '../../data/clubs';
import { openExternal } from '../../utils/external';
import { Crest } from '../match/Parts';
import { IconExternal } from '../ui/Icons';

type Tab = 'j1' | 'general' | 'other' | 'japan';

const TABS: { id: Tab; label: string }[] = [
  { id: 'j1', label: 'J1' },
  { id: 'general', label: '総合' },
  { id: 'other', label: 'J2・J3・他' },
  { id: 'japan', label: '代表' },
];

const boardColor = (b: Board) => (b.clubId ? getClub(b.clubId).color : 'var(--night)');

/**
 * 超サッカー掲示板は iframe 埋め込み不可（X-Frame-Options: DENY）。
 * クラブごとのカードを横スワイプで切り替え、タップでアプリ内ブラウザ（iOS: Safari シート / Android: カスタムタブ）で開く。
 */
export const BoardsPage = () => {
  const [tab, setTab] = useState<Tab>('j1');
  const j1Boards = useMemo(() => BOARDS.filter((b) => b.division === 'j1'), []);
  const [index, setIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // スワイプ位置 → 選択中インデックス
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = Array.from(deck.children) as HTMLElement[];
        const center = deck.scrollLeft + deck.clientWidth / 2;
        let best = 0; let bestDist = Infinity;
        cards.forEach((c, i) => {
          const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
          if (dist < bestDist) { best = i; bestDist = dist; }
        });
        setIndex(best);
      });
    };
    deck.addEventListener('scroll', onScroll, { passive: true });
    return () => { deck.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [tab]);

  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>('.club-btn.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [index]);

  const scrollTo = (i: number) => {
    const deck = deckRef.current;
    const card = deck?.children[i] as HTMLElement | undefined;
    if (deck && card) deck.scrollTo({ left: card.offsetLeft - (deck.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  };

  const others = BOARDS.filter((b) => b.division === tab);

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">掲示板</h1>
        <span className="eyebrow">超サッカー掲示板</span>
      </div>

      <div className="seg" role="tablist">
        {TABS.map((t) => (
          <button type="button" key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'j1' ? (
        <>
          <div className="club-strip" ref={stripRef} aria-label="クラブ">
            {j1Boards.map((b, i) => {
              const club = getClub(b.clubId!);
              return (
                <button type="button" key={b.slug} className={`club-btn${i === index ? ' active' : ''}`} onClick={() => scrollTo(i)}>
                  <Crest club={club} />
                  <span>{club.short}</span>
                </button>
              );
            })}
          </div>

          <div className="deck" ref={deckRef}>
            {j1Boards.map((b) => {
              const club = getClub(b.clubId!);
              const url = boardUrl(b.slug);
              return (
                <article key={b.slug} className="bcard" style={{ borderTopColor: club.color }}>
                  <div className="bcard-head">
                    <Crest club={club} />
                    <div>
                      <div className="bcard-name">超{b.name}掲示板</div>
                      <div className="bcard-url">{url.replace('https://', '')}</div>
                    </div>
                  </div>
                  <p className="note">
                    {club.id === 'kashiwa'
                      ? '試合後の盛り上がり、移籍の噂、遠征情報まで。柏サポの本音が集まる場所。'
                      : `${club.name}サポーターの掲示板。対戦前後の空気をのぞき見。`}
                  </p>
                  <div className="bcard-foot">
                    <button type="button" className="btn btn-sun btn-block" onClick={() => openExternal(url)}>
                      <IconExternal />掲示板を開く
                    </button>
                    <button type="button" className="btn btn-line btn-block btn-sm" onClick={() => openExternal(`${url}write.php`)}>
                      書き込む
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="deck-hint">← SWIPE TO SWITCH CLUB →</p>
        </>
      ) : (
        <div className="card board-list">
          {others.map((b) => (
            <button type="button" key={b.slug} className="board-row" onClick={() => openExternal(boardUrl(b.slug))}>
              <span className="link-ico" style={{ background: boardColor(b), color: b.clubId ? (getClub(b.clubId).textOnColor ?? '#fff') : 'var(--sun)' }}>
                {b.name.slice(0, 2)}
              </span>
              <span className="name">超{b.name}掲示板</span>
              <span className="ext"><IconExternal /></span>
            </button>
          ))}
        </div>
      )}

      <p className="note">
        掲示板は {BOARD_BASE.replace('https://', '')} を開きます。ホーム画面に追加したアプリからはアプリ内ブラウザで表示され、閉じるとこの画面に戻ります。
      </p>
    </div>
  );
};

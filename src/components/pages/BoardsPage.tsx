import { useEffect, useMemo, useRef, useState } from 'react';
import type { Board } from '../../types';
import { BOARDS, BOARD_BASE, boardUrl } from '../../data/boards';
import { getClub } from '../../data/clubs';
import { openExternal } from '../../utils/external';
import { useBoardFavorites } from '../../hooks/useBoardFavorites';
import { Crest } from '../match/Parts';
import { IconExternal, IconStar } from '../ui/Icons';

type Tab = 'fav' | 'j1' | 'general' | 'other' | 'japan';

const TABS: { id: Tab; label: string }[] = [
  { id: 'fav', label: 'お気に入り' },
  { id: 'j1', label: 'J1' },
  { id: 'general', label: '総合' },
  { id: 'other', label: 'J2・J3・他' },
  { id: 'japan', label: '代表' },
];

const BOARD_BY_SLUG = new Map(BOARDS.map((b) => [b.slug, b]));

const boardColor = (b: Board) => (b.clubId ? getClub(b.clubId).color : 'var(--night)');

/** クラブ掲示板ならエンブレム、総合・代表などは頭 2 文字のアイコン */
const BoardIcon = ({ b }: { b: Board }) =>
  b.clubId ? (
    <Crest club={getClub(b.clubId)} />
  ) : (
    <span className="link-ico" style={{ background: boardColor(b), color: 'var(--sun)' }}>{b.name.slice(0, 2)}</span>
  );

const StarButton = ({ on, name, onClick }: { on: boolean; name: string; onClick: () => void }) => (
  <button
    type="button"
    className={`star-btn${on ? ' on' : ''}`}
    aria-pressed={on}
    aria-label={on ? `${name}をお気に入りから外す` : `${name}をお気に入りに追加`}
    onClick={onClick}
  >
    <IconStar />
  </button>
);

/**
 * 超サッカー掲示板は iframe 埋め込み不可（X-Frame-Options: DENY）。
 * クラブごとのカードを横スワイプで切り替え、タップでアプリ内ブラウザ（iOS: Safari シート / Android: カスタムタブ）で開く。
 * お気に入りタブには登録した掲示板をタイルで並べ、閉じて別のタイルを押すだけで掲示板を切り替えられる。
 * 掲示板は掲示板ごとの名前付きタブで開く（openExternal）ので、通常ブラウザではブラウザのタブでも行き来できる。
 */
export const BoardsPage = () => {
  const { favorites, isFavorite, toggle } = useBoardFavorites();
  const [tab, setTab] = useState<Tab>(() => (favorites.length > 0 ? 'fav' : 'j1'));
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const j1Boards = useMemo(() => BOARDS.filter((b) => b.division === 'j1'), []);
  const favBoards = useMemo(() => favorites.map((s) => BOARD_BY_SLUG.get(s)).filter((b): b is Board => !!b), [favorites]);
  const [index, setIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const open = (b: Board, path = '') => {
    setLastOpened(b.slug);
    openExternal(`${boardUrl(b.slug)}${path}`);
  };

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

      <div className="seg seg-tight" role="tablist">
        {TABS.map((t) => (
          <button type="button" key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.id === 'fav' && <IconStar />}{t.label}
          </button>
        ))}
      </div>

      {tab === 'fav' ? (
        favBoards.length === 0 ? (
          <div className="card fav-empty">
            <p className="note">
              まだお気に入りがありません。J1 のカードや一覧の <span className="star-inline"><IconStar /></span> を押すと、ここに並びます。
            </p>
          </div>
        ) : (
          <>
            <div className="fav-grid">
              {favBoards.map((b) => (
                <div key={b.slug} className={`fav-tile${lastOpened === b.slug ? ' active' : ''}`} style={{ borderTopColor: boardColor(b) }}>
                  <button type="button" className="fav-open" onClick={() => open(b)}>
                    <BoardIcon b={b} />
                    <span className="fav-name">{b.clubId ? getClub(b.clubId).short : b.name}</span>
                  </button>
                  <div className="fav-actions">
                    <button type="button" className="fav-write" onClick={() => open(b, 'write.php')}>書く</button>
                    <StarButton on name={b.name} onClick={() => toggle(b.slug)} />
                  </div>
                </div>
              ))}
            </div>
            <p className="note">
              タイルを押すと掲示板が開きます。閉じてから別のタイルを押せば切り替えられます。PC のブラウザでは掲示板ごとにタブが分かれるので、ブラウザのタブでも行き来できます。
            </p>
          </>
        )
      ) : tab === 'j1' ? (
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
                    <div className="bcard-title">
                      <div className="bcard-name">超{b.name}掲示板</div>
                      <div className="bcard-url">{url.replace('https://', '')}</div>
                    </div>
                    <StarButton on={isFavorite(b.slug)} name={b.name} onClick={() => toggle(b.slug)} />
                  </div>
                  <p className="note">
                    {club.id === 'kashiwa'
                      ? '試合後の盛り上がり、移籍の噂、遠征情報まで。柏サポの本音が集まる場所。'
                      : `${club.name}サポーターの掲示板。対戦前後の空気をのぞき見。`}
                  </p>
                  <div className="bcard-foot">
                    <button type="button" className="btn btn-sun btn-block" onClick={() => open(b)}>
                      <IconExternal />掲示板を開く
                    </button>
                    <button type="button" className="btn btn-line btn-block btn-sm" onClick={() => open(b, 'write.php')}>
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
            <div key={b.slug} className="board-row">
              <button type="button" className="board-open" onClick={() => open(b)}>
                <span className="link-ico" style={{ background: boardColor(b), color: b.clubId ? (getClub(b.clubId).textOnColor ?? '#fff') : 'var(--sun)' }}>
                  {b.name.slice(0, 2)}
                </span>
                <span className="name">超{b.name}掲示板</span>
                <span className="ext"><IconExternal /></span>
              </button>
              <StarButton on={isFavorite(b.slug)} name={b.name} onClick={() => toggle(b.slug)} />
            </div>
          ))}
        </div>
      )}

      <p className="note">
        掲示板は {BOARD_BASE.replace('https://', '')} を開きます。ホーム画面に追加したアプリからはアプリ内ブラウザで表示され、閉じるとこの画面に戻ります。
      </p>
    </div>
  );
};

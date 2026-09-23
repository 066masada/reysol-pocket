import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Screen = 'home' | 'schedule' | 'live' | 'boards' | 'more';

export type LiveView = 'today' | 'standings' | 'acle';

interface NavState {
  screen: Screen;
  /** 画面内のサブビュー（LIVE: today / standings） */
  view: LiveView | null;
  /** 試合詳細（モーダル的に上に重ねる） */
  matchId: string | null;
}

interface NavigationContextType extends NavState {
  navigate: (screen: Screen, view?: LiveView) => void;
  openMatch: (id: string) => void;
  closeMatch: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

const SCREENS: Screen[] = ['home', 'schedule', 'live', 'boards', 'more'];

const VIEWS: LiveView[] = ['today', 'standings', 'acle'];

/** #/screen[/view][/matchId]  — 試合IDは必ず西暦で始まる（例 2026-10-14-acle-md2） */
const parseHash = (): NavState => {
  const h = window.location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
  const screen = SCREENS.includes(parts[0] as Screen) ? (parts[0] as Screen) : 'home';
  let view: LiveView | null = null;
  let matchId: string | null = null;
  for (const p of parts.slice(1)) {
    if (/^\d{4}-/.test(p)) matchId = p;
    else if (VIEWS.includes(p as LiveView)) view = p as LiveView;
  }
  return { screen, view, matchId };
};

const toHash = (s: NavState) =>
  `#/${s.screen}${s.view ? `/${s.view}` : ''}${s.matchId ? `/${encodeURIComponent(s.matchId)}` : ''}`;

/**
 * ハッシュベースのナビゲーション。
 * ブラウザ／Android の「戻る」で試合詳細を閉じられるようにする。
 */
export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<NavState>(() => parseHash());

  useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const push = useCallback((next: NavState) => {
    const hash = toHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    else setState(next);
  }, []);

  const navigate = useCallback((screen: Screen, view?: LiveView) => {
    push({ screen, view: view ?? null, matchId: null });
    window.scrollTo({ top: 0 });
  }, [push]);

  const openMatch = useCallback((id: string) => push({ screen: state.screen, view: state.view, matchId: id }), [push, state.screen, state.view]);

  const closeMatch = useCallback(() => {
    if (state.matchId && window.history.length > 1) window.history.back();
    else push({ screen: state.screen, view: state.view, matchId: null });
  }, [push, state]);

  const value = useMemo(() => ({ ...state, navigate, openMatch, closeMatch }), [state, navigate, openMatch, closeMatch]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
};

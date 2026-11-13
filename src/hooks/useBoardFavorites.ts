import { useCallback, useEffect, useState } from 'react';
import { BOARDS } from '../data/boards';

const KEY = 'reysol-pocket:boardFavorites';
const DEFAULT: string[] = ['reysol'];
const KNOWN = new Set(BOARDS.map((b) => b.slug));

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return DEFAULT;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string' && KNOWN.has(s)) : DEFAULT;
  } catch {
    return DEFAULT;
  }
};

/** お気に入り掲示板（slug を登録順に保持。端末ごとの保存） */
export const useBoardFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);
  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  return { favorites, isFavorite, toggle };
};

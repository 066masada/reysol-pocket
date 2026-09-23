import { useEffect } from 'react';
import type { Screen } from '../contexts/NavigationContext';

/** 横スワイプと判定する最小の移動量 */
const THRESHOLD = 60;
/** 縦移動に対して、どれだけ横向きが勝っていれば横スワイプとみなすか */
const RATIO = 1.5;
/** ゆっくりした操作は無視する */
const MAX_DURATION = 800;

/** 横スクロールできる要素の上で始まったスワイプは、その要素の操作として扱う */
const inHorizontalScroller = (start: EventTarget | null): boolean => {
  let el = start instanceof Element ? start : null;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const scrollable = style.overflowX === 'auto' || style.overflowX === 'scroll';
    if (scrollable && el.scrollWidth > el.clientWidth + 4) return true;
    el = el.parentElement;
  }
  return false;
};

/**
 * 横スワイプでタブを切り替える。
 * 掲示板のカードや月セレクタなど、横スクロールする部品の上では働かない。
 */
export const useSwipeTabs = (tabs: Screen[], current: Screen, go: (s: Screen) => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    let x0 = 0, y0 = 0, t0 = 0, ok = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { ok = false; return; }
      const t = e.touches[0]!;
      x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
      ok = !inHorizontalScroller(e.target);
    };

    const onEnd = (e: TouchEvent) => {
      if (!ok) return;
      ok = false;
      const t = e.changedTouches[0];
      if (!t || Date.now() - t0 > MAX_DURATION) return;
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy) * RATIO) return;

      const i = tabs.indexOf(current);
      if (i < 0) return;
      const next = dx < 0 ? tabs[i + 1] : tabs[i - 1];
      if (next) go(next);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
    };
  }, [tabs, current, go, enabled]);
};

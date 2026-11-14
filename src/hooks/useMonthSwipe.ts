import { useEffect, useRef, type RefObject } from 'react';

/** 月を切り替えるのに必要な横移動量 */
const THRESHOLD = 50;
/** これ以上動いたらタップではなくドラッグとみなす */
const DRAG_SLOP = 8;
/** 端（前後の月がない）方向へ引っぱったときの抵抗 */
const EDGE_RESIST = 0.25;

/**
 * 要素を横にドラッグして前後の月へ切り替える。
 * 指に合わせて中身を少し動かし、離した位置がしきい値を超えていれば onPrev / onNext を呼ぶ。
 * 縦スクロールはブラウザに任せる（CSS で touch-action: pan-y を付けておく）。
 */
export const useMonthSwipe = (
  ref: RefObject<HTMLElement | null>,
  { onPrev, onNext }: { onPrev?: () => void; onNext?: () => void },
) => {
  const handlers = useRef({ onPrev, onNext });
  useEffect(() => {
    handlers.current = { onPrev, onNext };
  }, [onPrev, onNext]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0 = 0, y0 = 0, dx = 0;
    let axis: 'x' | 'y' | null = null;
    let tracking = false;
    let suppressClick = false;

    const setOffset = (px: number, animate: boolean) => {
      el.style.transition = animate ? 'transform .2s ease-out' : 'none';
      el.style.transform = px ? `translateX(${px}px)` : '';
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0]!;
      x0 = t.clientX; y0 = t.clientY; dx = 0; axis = null; tracking = true; suppressClick = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0]!;
      const mx = t.clientX - x0;
      const my = t.clientY - y0;
      if (!axis) {
        if (Math.abs(mx) < DRAG_SLOP && Math.abs(my) < DRAG_SLOP) return;
        axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
      }
      if (axis !== 'x') return;
      suppressClick = true;
      const { onPrev: p, onNext: n } = handlers.current;
      const blocked = (mx > 0 && !p) || (mx < 0 && !n);
      dx = mx;
      setOffset(blocked ? mx * EDGE_RESIST : mx * 0.6, false);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (axis !== 'x') return;
      const { onPrev: p, onNext: n } = handlers.current;
      setOffset(0, true);
      if (dx <= -THRESHOLD && n) n();
      else if (dx >= THRESHOLD && p) p();
    };

    // ドラッグ後に指を離した位置のセルが「タップ」扱いにならないようにする
    const onClick = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
      el.removeEventListener('click', onClick, true);
      el.style.transform = '';
      el.style.transition = '';
    };
  }, [ref]);
};

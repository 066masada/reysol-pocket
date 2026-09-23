import { useCallback, useRef } from 'react';

/**
 * 長押しで発火する。指を動かしたり離したりしたら取り消す。
 * 隠しコマンド用なので、押している間の表示は変えない。
 */
export const useLongPress = (onLongPress: () => void, ms = 3000) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    origin.current = null;
  }, []);

  const start = useCallback((x: number, y: number) => {
    cancel();
    origin.current = { x, y };
    timer.current = setTimeout(() => { timer.current = null; onLongPress(); }, ms);
  }, [cancel, ms, onLongPress]);

  /** 押している間に動いたらスクロール操作とみなして取り消す */
  const moved = useCallback((x: number, y: number) => {
    if (!origin.current) return;
    if (Math.abs(x - origin.current.x) > 10 || Math.abs(y - origin.current.y) > 10) cancel();
  }, [cancel]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onMouseMove: (e: React.MouseEvent) => moved(e.clientX, e.clientY),
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) start(t.clientX, t.clientY);
    },
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) moved(t.clientX, t.clientY);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
};

import type { Stadium } from '../types';

/**
 * 外部リンクは常に新しいコンテキストで開く。
 * standalone PWA では iOS: アプリ内 Safari シート / Android: Chrome カスタムタブ で表示される。
 */
export const openExternal = (url: string) => {
  const board = BOARD_URL_RE.exec(url);
  if (board) {
    openNamed(url, `board-${board[1]}`);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

/** 超サッカー掲示板の URL（{slug} を取り出す） */
const BOARD_URL_RE = /^https:\/\/bm\.best-hit\.tv\/([^/?#]+)\//;

/**
 * 名前付きウィンドウで開く。同じ名前のタブが残っていればそれを再利用するので、
 * 通常ブラウザでは掲示板ごとに 1 タブずつ並び、ブラウザのタブで行き来できる。
 * noopener を付けると名前でのタブ再利用が効かないため、開いた後に opener を切る。
 */
const openNamed = (url: string, name: string) => {
  const w = window.open(url, name);
  if (!w) return;
  try { w.opener = null; } catch { /* ignore */ }
  try { w.focus(); } catch { /* ignore */ }
};

const embedKey = (import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY as string | undefined)?.trim();

/** Google Maps 埋め込み URL（キーがあれば Embed API、なければ簡易埋め込み） */
export const mapsEmbedUrl = (s: Stadium) => {
  if (embedKey) {
    const q = encodeURIComponent(s.name);
    return `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${q}&center=${s.lat},${s.lng}&zoom=15&language=ja`;
  }
  return `https://maps.google.com/maps?q=${s.lat},${s.lng}&z=15&hl=ja&output=embed`;
};

/** Google マップで開く（アプリがあればアプリ起動） */
export const mapsPlaceUrl = (s: Stadium) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name)}&query_place_id=&center=${s.lat},${s.lng}`;

/** 経路案内（現在地 → スタジアム、公共交通機関） */
export const mapsDirectionsUrl = (s: Stadium) =>
  `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=&travelmode=transit`;

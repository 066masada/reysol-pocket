/**
 * Google Analytics 4（gtag.js）。
 *
 * 測定IDはページソースに出る公開情報なので、既定値をここに持たせておく。
 * こうしておかないと `.env` のない環境でビルドしたときに計測が黙って止まる。
 *
 * - `.env` 未設定          → 既定値で計測する（本番ビルドのみ）
 * - `VITE_GA_MEASUREMENT_ID=G-XXXX` → その測定IDで計測する（フォーク先など）
 * - `VITE_GA_MEASUREMENT_ID=`（空）  → 計測しない（タグ自体を読み込まない）
 */
const DEFAULT_MEASUREMENT_ID = 'G-4LGK0JD4ML';

const override = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

const measurementId = (override ?? DEFAULT_MEASUREMENT_ID).trim();

const enabled = Boolean(measurementId) && import.meta.env.PROD;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** gtag.js を読み込む。main.tsx から一度だけ呼ぶ。 */
export const initAnalytics = () => {
  if (!enabled || window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // 公式スニペットと同じく arguments をそのまま積む
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };

  window.gtag('js', new Date());
  // ハッシュルーティングなので自動の page_view は使わず、画面遷移ごとに自前で送る
  window.gtag('config', measurementId, { send_page_view: false });
};

/**
 * 画面表示を送る。
 * GA4 は URL のフラグメント（#/live/standings）を捨ててしまうので、
 * 仮想パス（/live/standings）に組み替えて渡す。
 */
export const trackPageView = (path: string, title: string) => {
  if (!enabled || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: `${window.location.origin}${path}`,
  });
};

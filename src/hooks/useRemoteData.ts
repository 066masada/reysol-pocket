import { useEffect } from 'react';
import { fetchRemoteData } from '../data/remote';
import { setData } from '../data/store';

/** 開いている間の取得間隔。配信元（raw.githubusercontent.com）のキャッシュが5分なので、それより詰めても変わらない */
const POLL_MS = 5 * 60 * 1000;
/** 復帰時に取り直すまでの最短間隔 */
const MIN_GAP_MS = 2 * 60 * 1000;

/**
 * 起動時・復帰時と、画面を開いている間は定期的に最新データを取り込む。
 * 失敗しても同梱データのまま動くので、画面にエラーは出さない。
 */
export const useRemoteData = () => {
  useEffect(() => {
    const ctrl = new AbortController();
    let last = 0;

    const load = () => {
      if (Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      fetchRemoteData(ctrl.signal).then(({ fixtures, standings, acleStandings, history, updatedAt }) => {
        if (ctrl.signal.aborted) return;
        setData({
          fixtures, history, updatedAt,
          ...(standings ? { standings } : {}),
          ...(acleStandings ? { acleStandings } : {}),
        });
      });
    };

    load();
    // 見えていないときは取りにいかない（復帰時に visibilitychange で取る）
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { ctrl.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
};

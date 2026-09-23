import { useEffect } from 'react';
import { fetchRemoteData } from '../data/remote';
import { setData } from '../data/store';

/**
 * 起動時と復帰時に最新データを取り込む。
 * 失敗しても同梱データのまま動くので、画面にエラーは出さない。
 */
export const useRemoteData = () => {
  useEffect(() => {
    const ctrl = new AbortController();
    let last = 0;

    const load = () => {
      // 復帰のたびに叩かないよう10分は間隔を空ける
      if (Date.now() - last < 10 * 60 * 1000) return;
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
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { ctrl.abort(); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
};

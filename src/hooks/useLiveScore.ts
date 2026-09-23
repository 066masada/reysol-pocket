import { useEffect } from 'react';
import { getData, setData } from '../data/store';
import { fetchLiveScore } from '../utils/livescore';
import { isInMatchWindow, sortedFixtures } from '../utils/fixtures';

/** 試合中の取得間隔 */
const INTERVAL = 10_000;
/** 連続で失敗したときは間隔を空ける */
const BACKOFF = 60_000;
/** 試合が終わってからも少しだけ拾い続ける（終了直後の確定スコア用） */
const TAIL_MS = 10 * 60 * 1000;

/**
 * 試合中だけ10秒おきにスコアを取りにいく。
 * 画面が見えていないときは止め、失敗が続いたら間隔を空ける。
 */
export const useLiveScore = () => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let ctrl: AbortController | null = null;
    let failures = 0;
    let stopped = false;

    /** いま試合中か（終了直後の猶予を含む） */
    const activeFixture = () => {
      const now = new Date();
      return sortedFixtures().find((f) => {
        if (isInMatchWindow(f, now)) return true;
        // 試合枠を抜けた直後も少しだけ見る
        const live = getData().live;
        return live?.fixtureId === f.id && Date.now() - live.fetchedAt < TAIL_MS;
      });
    };

    const tick = async () => {
      if (stopped) return;
      const f = activeFixture();

      if (!f || document.visibilityState !== 'visible') {
        schedule(INTERVAL);
        return;
      }

      ctrl?.abort();
      ctrl = new AbortController();
      const score = await fetchLiveScore(ctrl.signal);
      if (stopped) return;

      if (score) {
        failures = 0;
        setData({ live: { ...score, fixtureId: f.id } });
        // 試合終了が取れたら、それ以上は追わない
        if (score.status === 'FT') { schedule(BACKOFF); return; }
      } else {
        failures += 1;
      }
      schedule(failures >= 3 ? BACKOFF : INTERVAL);
    };

    const schedule = (ms: number) => {
      if (stopped) return;
      timer = setTimeout(tick, ms);
    };

    tick();

    const onVisible = () => { if (document.visibilityState === 'visible') { if (timer) clearTimeout(timer); tick(); } };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      ctrl?.abort();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
};

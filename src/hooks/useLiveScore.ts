import { useEffect } from 'react';
import { getData, setData } from '../data/store';
import { fetchLiveScore } from '../utils/livescore';
import { isInMatchWindow, kickoffDate, sortedFixtures } from '../utils/fixtures';
import { isSameDay } from '../utils/date';

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

    /**
     * 取得対象の試合。
     * 試合中はもちろん、同期がまだ結果を反映していない「今日の終わった試合」も対象にする
     * （終了後にアプリを開き直したときに結果が出ないため）。
     */
    const activeFixture = () => {
      const now = new Date();
      return sortedFixtures().find((f) => {
        if (f.timeTBD) return false;
        if (isInMatchWindow(f, now)) return true;
        const d = kickoffDate(f);
        if (d.getTime() > now.getTime()) return false;
        // 当日の試合で、まだ確定スコアが入っていないもの
        if (isSameDay(d, now) && !f.score) return true;
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
        // 終了後は頻繁に見に行く必要がない
        if (score.status === 'FT') { schedule(BACKOFF); return; }
      } else {
        failures += 1;
      }
      // 試合中だけ10秒。それ以外（終了後の取りこぼし拾い）は控えめに
      const base = isInMatchWindow(f, new Date()) ? INTERVAL : BACKOFF;
      schedule(failures >= 3 ? BACKOFF : base);
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

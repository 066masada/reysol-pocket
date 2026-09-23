import { useEffect, useState } from 'react';
import type { Fixture } from '../types';
import { STADIUMS } from '../data/stadiums';
import { parseKickoff } from '../utils/date';
import { fetchWeather, isForecastable, type Weather } from '../utils/weather';

interface State { key: string; weather: Weather | null }

/**
 * 試合のキックオフ時刻の天気。
 * 時刻未定・会場未定・予報範囲外・取得失敗のときは null（UI では何も出さない）。
 */
export const useWeather = (fixture: Fixture | undefined, now: Date = new Date()): Weather | null => {
  const [state, setState] = useState<State>({ key: '', weather: null });
  const stadiumId = fixture?.stadiumId;
  const kickoffAt = fixture?.kickoffAt;
  const timeTBD = fixture?.timeTBD;
  // now は毎秒更新されるので、依存には日付だけを渡す
  const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const key = `${stadiumId ?? ''}|${kickoffAt ?? ''}|${today}`;

  useEffect(() => {
    if (!stadiumId || !kickoffAt || timeTBD) return;
    const st = STADIUMS[stadiumId];
    if (!st) return;
    const ko = parseKickoff(kickoffAt);
    if (!isForecastable(ko, new Date())) return;

    const ctrl = new AbortController();
    fetchWeather(st.lat, st.lng, ko, ctrl.signal).then((weather) => {
      if (!ctrl.signal.aborted && weather) setState({ key, weather });
    });
    return () => ctrl.abort();
  }, [stadiumId, kickoffAt, timeTBD, key]);

  // 別の試合に切り替わった直後に前の試合の予報を出さない
  return state.key === key ? state.weather : null;
};

import { useSyncExternalStore } from 'react';
import type { Fixture, StandingsSnapshot, StandingsTable } from '../types';
import { FIXTURES } from './schedule';
import { ACLE_STANDINGS, J1_STANDINGS } from './standings';

/**
 * 日程・順位表の現在値。同梱データで起動し、取得できたら差し替える。
 * ユーティリティ（純関数）からも参照できるようモジュール変数で持つ。
 */
interface DataState {
  fixtures: Fixture[];
  standings: StandingsTable;
  acleStandings: StandingsTable;
  /** 順位推移用のスナップショット（古い順） */
  history: StandingsSnapshot[];
  /** 取得できた時刻（ISO）。null は同梱データのまま */
  updatedAt: string | null;
}

let state: DataState = { fixtures: FIXTURES, standings: J1_STANDINGS, acleStandings: ACLE_STANDINGS, history: [], updatedAt: null };
const listeners = new Set<() => void>();

export const getData = () => state;
export const getFixtures = () => state.fixtures;
export const getStandings = () => state.standings;

export const setData = (next: Partial<DataState>) => {
  state = { ...state, ...next };
  for (const l of listeners) l();
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

/** データ更新で再描画したい画面で呼ぶ */
export const useData = () => useSyncExternalStore(subscribe, getData, getData);

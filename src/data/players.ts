/** data/players.json（scripts/build-players.mjs が公式プロフィールから生成）の型と読み込み */

export type StintKind = 'jy' | 'youth' | 'school' | 'univ' | 'pro';

export interface Stint {
  /** クラブ ID。学校・街クラブは null */
  org: string | null;
  /** 公式表記のまま（例: 京都サンガF.C.U-18 / 筑波大） */
  label: string;
  kind: StintKind;
  /** "YYYY-MM" */
  from: string;
  /** "YYYY-MM"。null は在籍中 */
  to: string | null;
  loan?: boolean;
  country?: string;
  note?: string;
}

export interface Player {
  no: number;
  name: string;
  pos: 'GK' | 'DF' | 'MF' | 'FW';
  born: string;
  hometown: string;
  /** pro: トップ登録 / secondReg: 2種登録（ユース在籍中） / designated: 特別指定（大学在籍中） */
  status: 'pro' | 'secondReg' | 'designated';
  /** 柏に（今回）加わった時期 "YYYY-MM" */
  joined: string;
  stints: Stint[];
  source: string;
}

export interface PlayersData {
  season: string;
  source: string;
  generatedAt: string;
  players: Player[];
}

/** 経歴ページを開いたときにだけ読む（本体のバンドルを太らせない） */
export const loadPlayers = async (): Promise<PlayersData> =>
  (await import('../../data/players.json')).default as PlayersData;

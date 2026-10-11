import { CLUBS } from './clubs';

export interface CareerClub {
  name: string;
  short: string;
  color: string;
  textOnColor?: string;
}

/**
 * 選手の経歴にだけ出てくるクラブ（J1 以外・海外・アカデミー）。
 * ID は scripts/build-players.mjs の ORGS と揃える。色はクラブカラーの近似。
 */
const EXTRA: Record<string, CareerClub> = {
  yokohamafc:   { name: '横浜FC',               short: '横浜FC', color: '#00A0E9' },
  kumamoto:     { name: 'ロアッソ熊本',          short: '熊本',   color: '#C8102E' },
  sanuki:       { name: 'カマタマーレ讃岐',      short: '讃岐',   color: '#4FA3D9' },
  matsumoto:    { name: '松本山雅FC',           short: '松本',   color: '#00552E' },
  toyama:       { name: 'カターレ富山',          short: '富山',   color: '#1B3C8C' },
  tokushima:    { name: '徳島ヴォルティス',      short: '徳島',   color: '#1D2088' },
  kitakyushu:   { name: 'ギラヴァンツ北九州',    short: '北九州', color: '#FFD800', textOnColor: '#C8102E' },
  yamagata:     { name: 'モンテディオ山形',      short: '山形',   color: '#003B8E' },
  gunma:        { name: 'ザスパ群馬',           short: '群馬',   color: '#0E2C59' },
  omiya:        { name: '大宮アルディージャ',    short: '大宮',   color: '#F26A21' },
  shonan:       { name: '湘南ベルマーレ',        short: '湘南',   color: '#57B947' },
  niigata:      { name: 'アルビレックス新潟',    short: '新潟',   color: '#F15A22' },
  ryukyu:       { name: 'FC琉球',               short: '琉球',   color: '#9B1C26' },
  tosu:         { name: 'サガン鳥栖',           short: '鳥栖',   color: '#0091D6' },
  ehime:        { name: '愛媛FC',               short: '愛媛',   color: '#F39800' },
  oita:         { name: '大分トリニータ',        short: '大分',   color: '#00349A' },
  kanazawa:     { name: 'ツエーゲン金沢',        short: '金沢',   color: '#C8102E' },
  tochigi:      { name: '栃木SC',               short: '栃木',   color: '#1C5DAA' },
  kagoshima:    { name: '鹿児島ユナイテッドFC',  short: '鹿児島', color: '#0B2C6A' },
  fujieda:      { name: '藤枝MYFC',             short: '藤枝',   color: '#6A2C91' },
  sendai:       { name: 'ベガルタ仙台',          short: '仙台',   color: '#FFC20E', textOnColor: '#0B2C6A' },
  sapporo:      { name: '北海道コンサドーレ札幌', short: '札幌',   color: '#D6001C' },
  honda:        { name: 'Honda FC',             short: 'Honda',  color: '#B5121B' },
  unionberlin:  { name: 'ウニオン・ベルリン',    short: 'ウニオン', color: '#D4011D' },
  braunschweig: { name: 'ブラウンシュバイク',    short: 'Bシュバイク', color: '#F7D117', textOnColor: '#1B3F8C' },
  boavista:     { name: 'ボアヴィスタ',          short: 'ボアヴィスタ', color: '#1A1A1A' },
  onehunga:     { name: 'オネハンガ・スポーツ',  short: 'オネハンガ', color: '#1B4F9C' },
  jfaacademy:   { name: 'JFAアカデミー福島',     short: 'JFA',    color: '#0A2C6B' },
  yowa:         { name: '三菱養和SC',            short: '養和',   color: '#E60012' },
};

export const careerClub = (id: string): CareerClub | null => CLUBS[id] ?? EXTRA[id] ?? null;

/** 背景色に対して読める文字色（クラブ側の指定があればそれ） */
export const textOn = (c: CareerClub): string => {
  if (c.textOnColor) return c.textOnColor;
  const n = parseInt(c.color.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#111111' : '#FFFFFF';
};

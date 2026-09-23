import type { Club } from '../types';

export const KASHIWA_ID = 'kashiwa';

/**
 * J1 2026-27 の 20 クラブ（＋対戦相手として登場するクラブ）
 * boardSlug は 超サッカー掲示板 (https://bm.best-hit.tv/{slug}/) の slug
 */
const LIST: Club[] = [
  { id: 'kashiwa',    name: '柏レイソル',            short: '柏',      color: '#FFE100', textOnColor: '#111111', division: 'j1', stadiumId: 'sankyo',    boardSlug: 'reysol' },
  { id: 'kashima',    name: '鹿島アントラーズ',        short: '鹿島',    color: '#9B1B30', division: 'j1', stadiumId: 'kashima',   boardSlug: 'antlers' },
  { id: 'urawa',      name: '浦和レッズ',             short: '浦和',    color: '#E60012', division: 'j1', stadiumId: 'saitama',   boardSlug: 'reds' },
  { id: 'fctokyo',    name: 'FC東京',                short: 'FC東京',  color: '#0A2C6B', division: 'j1', stadiumId: 'ajinomoto', boardSlug: 'fctokyo' },
  { id: 'verdy',      name: '東京ヴェルディ',          short: '東京V',   color: '#1C6E3C', division: 'j1', stadiumId: 'ajinomoto', boardSlug: 'verdy' },
  { id: 'machida',    name: 'FC町田ゼルビア',         short: '町田',    color: '#1A3A8C', division: 'j1', stadiumId: 'machida',   boardSlug: 'zelvia' },
  { id: 'kawasaki',   name: '川崎フロンターレ',        short: '川崎F',   color: '#00A0E9', division: 'j1', stadiumId: 'todoroki',  boardSlug: 'frontale' },
  { id: 'yokohamafm', name: '横浜F・マリノス',        short: '横浜FM',  color: '#0B2C6A', division: 'j1', stadiumId: 'nissan',    boardSlug: 'fmarinos' },
  { id: 'shimizu',    name: '清水エスパルス',          short: '清水',    color: '#F39800', division: 'j1', stadiumId: 'iai',       boardSlug: '178spulse' },
  { id: 'nagoya',     name: '名古屋グランパス',        short: '名古屋',  color: '#D8262C', division: 'j1', stadiumId: 'toyota',    boardSlug: 'grampus' },
  { id: 'kyoto',      name: '京都サンガF.C.',         short: '京都',    color: '#7A1F5C', division: 'j1', stadiumId: 'sanga',     boardSlug: 'sanga' },
  { id: 'gamba',      name: 'ガンバ大阪',             short: 'G大阪',   color: '#0B2C6A', division: 'j1', stadiumId: 'panasonic', boardSlug: 'gamba' },
  { id: 'cerezo',     name: 'セレッソ大阪',           short: 'C大阪',   color: '#E4007F', division: 'j1', stadiumId: 'yanmar',    boardSlug: 'cerezo' },
  { id: 'kobe',       name: 'ヴィッセル神戸',          short: '神戸',    color: '#8B0F2C', division: 'j1', stadiumId: 'noevir',    boardSlug: 'vissel' },
  { id: 'hiroshima',  name: 'サンフレッチェ広島',      short: '広島',    color: '#5C2D91', division: 'j1', stadiumId: 'edion',     boardSlug: '178sanfrecce' },
  { id: 'okayama',    name: 'ファジアーノ岡山',        short: '岡山',    color: '#B8232F', division: 'j1', stadiumId: 'jfe',       boardSlug: 'fagiano' },
  { id: 'fukuoka',    name: 'アビスパ福岡',           short: '福岡',    color: '#133A6B', division: 'j1', stadiumId: 'best',      boardSlug: 'avispa' },
  { id: 'mito',       name: '水戸ホーリーホック',      short: '水戸',    color: '#1A3A8C', division: 'j1', stadiumId: 'mito',      boardSlug: 'hollyhock' },
  { id: 'nagasaki',   name: 'V・ファーレン長崎',      short: '長崎',    color: '#F26A21', division: 'j1', stadiumId: 'peace',     boardSlug: 'vvaren' },
  { id: 'chiba',      name: 'ジェフユナイテッド千葉',   short: '千葉',    color: '#FFD400', textOnColor: '#1B5E3B', division: 'j1', stadiumId: 'fukuari', boardSlug: 'jef' },

  /* ── 天皇杯・その他の対戦相手 ── */
  { id: 'senshu',     name: '専修大学',               short: '専修大',  color: '#1E5A3C', division: 'other' },
  { id: 'imabari',    name: 'FC今治',                short: '今治',    color: '#0B3B8C', division: 'j2', boardSlug: 'imabari' },

  /* ── ACLE 2026/27 リーグステージ ── */
  { id: 'jeonbuk',    name: '全北現代モータース',       short: '全北',    color: '#0A6B3A', division: 'other', country: '韓国',         stadiumId: 'jeonju' },
  { id: 'port',       name: 'ポートFC',              short: 'ポート',   color: '#F26A21', division: 'other', country: 'タイ' },
  { id: 'ratchaburi', name: 'ラーチャブリーFC',        short: 'ラーチャブリー', color: '#1B4F9C', division: 'other', country: 'タイ', stadiumId: 'ratchaburi' },
  { id: 'daejeon',    name: '大田ハナ・シチズン',       short: '大田',    color: '#7A1F5C', division: 'other', country: '韓国' },
  { id: 'newcastle',  name: 'ニューカッスル・ジェッツ',  short: 'ニューカッスル', color: '#C8102E', division: 'other', country: 'オーストラリア', stadiumId: 'centralcoast' },
  { id: 'conganhanoi', name: 'コンアン・ハノイ',        short: 'ハノイ',   color: '#B8232F', division: 'other', country: 'ベトナム' },
  { id: 'buriram',    name: 'ブリーラム・ユナイテッド',  short: 'ブリーラム', color: '#0B2C6A', division: 'other', country: 'タイ' },
  { id: 'shanghaiport', name: '上海海港',            short: '上海海港', color: '#C8102E', division: 'other', country: '中国' },
  { id: 'beijing',    name: '北京FC',                short: '北京',    color: '#0B6B3A', division: 'other', country: '中国' },
  { id: 'jdt',        name: 'ジョホール・ダルル・タクジム', short: 'JDT',  color: '#1B3F8C', division: 'other', country: 'マレーシア' },
  { id: 'pohang',     name: '浦項スティーラーズ',       short: '浦項',    color: '#B8232F', division: 'other', country: '韓国',         stadiumId: 'pohang' },
];

export const CLUBS: Record<string, Club> = Object.fromEntries(LIST.map((c) => [c.id, c]));
export const CLUB_LIST = LIST;
export const J1_CLUBS = LIST.filter((c) => c.division === 'j1');
export const KASHIWA = CLUBS[KASHIWA_ID]!;

export const getClub = (id: string): Club =>
  CLUBS[id] ?? { id, name: id, short: id, color: '#807F78', division: 'other' };

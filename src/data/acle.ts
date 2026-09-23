/**
 * AFCチャンピオンズリーグ Elite 2026/27 の大会情報。
 *
 * 出典:
 *  - 大会方式・日程: AFC発表（Wikipedia「AFCチャンピオンズリーグエリート2026/27」で確認、2026-09-23）
 *  - 柏の組み合わせ: 柏レイソル公式 https://www.reysol.co.jp/news/event/acl-elite-202627.html
 *
 * 対戦相手ガイド・相手国リーグ入門・遠征ガイドは今後ここに追加していく。
 */

export const ACLE = {
  season: '2026/27',
  /** 東西あわせた出場クラブ数 */
  clubs: 32,
  /** 1地区あたりのクラブ数 */
  clubsPerZone: 16,
  /** リーグステージの試合数（毎回違う相手） */
  matchdays: 8,
  /** ノックアウトに進める順位 */
  qualifyRank: 8,
  officialUrl: 'https://www.reysol.co.jp/afc202627/index.php',
  knockout: [
    { label: 'ラウンド16', period: '2027年3月1日〜17日' },
    { label: '準々決勝〜決勝', period: '2027年4月23日〜5月1日', note: 'サウジアラビアで集中開催' },
  ] as { label: string; period: string; note?: string }[],
  prize: 'FIFAインターコンチネンタルカップ2027 と FIFAクラブワールドカップ2029 の出場権',
} as const;

/** 東地区の出場16クラブの国別内訳 */
export const EAST_ZONE = [
  { country: '日本', count: 5, clubs: '柏・鹿島・神戸・京都・G大阪' },
  { country: '韓国', count: 3, clubs: '全北・大田・浦項' },
  { country: 'タイ', count: 3, clubs: 'ブリーラム・ポート・ラーチャブリー' },
  { country: '中国', count: 2, clubs: '上海海港・北京' },
  { country: 'オーストラリア', count: 1, clubs: 'ニューカッスル' },
  { country: 'マレーシア', count: 1, clubs: 'ジョホール' },
  { country: 'ベトナム', count: 1, clubs: 'コンアン・ハノイ' },
] as const;

/** 対戦相手の基本情報（詳しいガイドは今後追加） */
export interface AcleOpponent {
  clubId: string;
  city: string;
  league: string;
  /** 自国リーグの通称（相手国リーグ入門へのキー） */
  leagueKey: 'k1' | 'thai1' | 'aleague' | 'vleague';
}

export const ACLE_OPPONENTS: Record<string, AcleOpponent> = {
  jeonbuk:     { clubId: 'jeonbuk',     city: '全州（韓国）',           league: 'Kリーグ1',      leagueKey: 'k1' },
  port:        { clubId: 'port',        city: 'バンコク（タイ）',       league: 'タイ・リーグ1', leagueKey: 'thai1' },
  ratchaburi:  { clubId: 'ratchaburi',  city: 'ラーチャブリー（タイ）', league: 'タイ・リーグ1', leagueKey: 'thai1' },
  daejeon:     { clubId: 'daejeon',     city: '大田（韓国）',           league: 'Kリーグ1',      leagueKey: 'k1' },
  newcastle:   { clubId: 'newcastle',   city: 'ニューカッスル（豪）',   league: 'Aリーグ',       leagueKey: 'aleague' },
  conganhanoi: { clubId: 'conganhanoi', city: 'ハノイ（ベトナム）',     league: 'Vリーグ1',      leagueKey: 'vleague' },
  buriram:     { clubId: 'buriram',     city: 'ブリーラム（タイ）',     league: 'タイ・リーグ1', leagueKey: 'thai1' },
  pohang:      { clubId: 'pohang',      city: '浦項（韓国）',           league: 'Kリーグ1',      leagueKey: 'k1' },
};

/** 観る導線 */
export const ACLE_WATCH = [
  { label: 'DAZN', description: 'ACLE 全試合ライブ配信', url: 'https://www.dazn.com/ja-JP/home' },
  { label: 'KASHIWA REYSOL CHANNEL', description: 'クラブ公式のハイライト', url: 'https://www.youtube.com/@KashiwaReysolChannel/videos' },
  { label: '柏レイソル ACL特設ページ', description: 'クラブ公式の発表・チケット情報', url: ACLE.officialUrl },
];

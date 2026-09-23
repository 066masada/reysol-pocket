import type { Stadium } from '../types';

/**
 * 座標は地図表示・経路案内用の概略値。
 */
export const STADIUMS: Record<string, Stadium> = {
  sankyo: {
    id: 'sankyo',
    name: '三協フロンテア柏スタジアム',
    short: '三協F柏',
    address: '千葉県柏市日立台1-2-50',
    lat: 35.8489, lng: 139.9754,
    access: 'JR常磐線・東武アーバンパークライン「柏駅」東口から徒歩約20分。柏駅東口からバス「日立台」下車すぐ（試合日は臨時便あり）',
    note: 'ACLE開催時の名称は「柏サッカースタジアム」',
  },
  kashima: {
    id: 'kashima', name: 'メルカリスタジアム', short: 'メルスタ',
    address: '茨城県鹿嶋市神向寺後山26-2', lat: 35.9919, lng: 140.6403,
    access: 'JR鹿島線「鹿島サッカースタジアム駅」（試合日のみ臨時停車）徒歩約2分',
  },
  saitama: {
    id: 'saitama', name: '埼玉スタジアム2002', short: '埼玉',
    address: '埼玉県さいたま市緑区美園2-1', lat: 35.9030, lng: 139.7174,
    access: '埼玉高速鉄道「浦和美園駅」徒歩約15分',
  },
  ajinomoto: {
    id: 'ajinomoto', name: '味の素スタジアム', short: '味スタ',
    address: '東京都調布市西町376-3', lat: 35.6644, lng: 139.5272,
    access: '京王線「飛田給駅」徒歩約5分',
  },
  kokuritsu: {
    id: 'kokuritsu', name: 'MUFGスタジアム（国立競技場）', short: 'MUFG国立',
    address: '東京都新宿区霞ヶ丘町10-1', lat: 35.6779, lng: 139.7146,
    access: 'JR「千駄ヶ谷駅」「信濃町駅」徒歩約5分、都営大江戸線「国立競技場駅」直結',
  },
  machida: {
    id: 'machida', name: '町田GIONスタジアム', short: 'Gスタ',
    address: '東京都町田市野津田町2035', lat: 35.5895, lng: 139.4177,
    access: '小田急線「鶴川駅」・JR/小田急「町田駅」からバス',
  },
  todoroki: {
    id: 'todoroki', name: 'Uvanceとどろきスタジアム by Fujitsu', short: 'U等々力',
    address: '神奈川県川崎市中原区等々力1-1', lat: 35.5856, lng: 139.6527,
    access: 'JR南武線「武蔵中原駅」徒歩約15分、東急東横線「武蔵小杉駅」徒歩約20分',
  },
  nissan: {
    id: 'nissan', name: '日産スタジアム', short: '日産ス',
    address: '神奈川県横浜市港北区小机町3300', lat: 35.5100, lng: 139.6063,
    access: 'JR横浜線「小机駅」徒歩約7分、「新横浜駅」徒歩約14分',
  },
  iai: {
    id: 'iai', name: 'IAIスタジアム日本平', short: 'アイスタ',
    address: '静岡県静岡市清水区村松3880-1', lat: 34.9634, lng: 138.4200,
    access: 'JR「清水駅」「東静岡駅」からシャトルバス',
  },
  toyota: {
    id: 'toyota', name: '豊田スタジアム', short: '豊田ス',
    address: '愛知県豊田市千石町7-2', lat: 35.0846, lng: 137.1706,
    access: '名鉄「豊田市駅」徒歩約15分',
  },
  sanga: {
    id: 'sanga', name: 'サンガスタジアム by KYOCERA', short: 'サンガS',
    address: '京都府亀岡市追分町', lat: 35.0069, lng: 135.5666,
    access: 'JR嵯峨野線「亀岡駅」徒歩約3分',
  },
  panasonic: {
    id: 'panasonic', name: 'パナソニック スタジアム 吹田', short: 'パナスタ',
    address: '大阪府吹田市千里万博公園3-3', lat: 34.8027, lng: 135.5385,
    access: '大阪モノレール「万博記念公園駅」徒歩約15分',
  },
  yanmar: {
    id: 'yanmar', name: 'YANMAR HANASAKA STADIUM', short: 'ハナサカ',
    address: '大阪府大阪市東住吉区長居公園1-1', lat: 34.6140, lng: 135.5185,
    access: 'Osaka Metro御堂筋線「長居駅」徒歩約5分',
  },
  noevir: {
    id: 'noevir', name: 'ノエビアスタジアム神戸', short: 'ノエスタ',
    address: '兵庫県神戸市兵庫区御崎町1-2-1', lat: 34.6567, lng: 135.1704,
    access: '神戸市営地下鉄海岸線「御崎公園駅」徒歩約5分',
  },
  edion: {
    id: 'edion', name: 'エディオンピースウイング広島', short: 'Eピース',
    address: '広島県広島市中区基町15-2', lat: 34.4001, lng: 132.4517,
    access: 'JR「広島駅」から徒歩約25分、アストラムライン「県庁前駅」徒歩約10分',
  },
  jfe: {
    id: 'jfe', name: 'JFE晴れの国スタジアム', short: 'JFEス',
    address: '岡山県岡山市北区いずみ町2-1', lat: 34.6772, lng: 133.9231,
    access: 'JR「岡山駅」徒歩約20分',
  },
  best: {
    id: 'best', name: 'ベスト電器スタジアム', short: 'ベススタ',
    address: '福岡県福岡市博多区東平尾公園2-1-1', lat: 33.5860, lng: 130.4615,
    access: '福岡市地下鉄「福岡空港駅」徒歩約25分、またはバス',
  },
  mito: {
    id: 'mito', name: '水戸信用金庫スタジアム', short: '水戸信ス',
    address: '茨城県水戸市小吹町2058-1', lat: 36.3517, lng: 140.4380,
    access: 'JR「水戸駅」からシャトルバス',
  },
  peace: {
    id: 'peace', name: 'PEACE STADIUM Connected by SoftBank', short: 'ピースタ',
    address: '長崎県長崎市幸町7-1', lat: 32.7560, lng: 129.8640,
    access: 'JR「長崎駅」徒歩約10分',
  },
  fukuari: {
    id: 'fukuari', name: 'フクダ電子アリーナ', short: 'フクアリ',
    address: '千葉県千葉市中央区川崎町1-20', lat: 35.5945, lng: 140.1085,
    access: 'JR京葉線・内房線・外房線「蘇我駅」徒歩約8分',
  },
  /* ── ACLE アウェイ ── */
  jeonju: {
    id: 'jeonju', name: '全州ワールドカップスタジアム', short: '全州W杯',
    address: '韓国 全羅北道 全州市', lat: 35.8682, lng: 127.0644,
  },
  ratchaburi: {
    id: 'ratchaburi', name: 'ラーチャブリースタジアム', short: 'ラーチャブリー',
    address: 'タイ ラーチャブリー県', lat: 13.5327, lng: 99.8016,
  },
  centralcoast: {
    id: 'centralcoast', name: 'セントラルコーストスタジアム', short: 'ゴスフォード',
    address: 'オーストラリア NSW ゴスフォード', lat: -33.4300, lng: 151.3400,
  },
  pohang: {
    id: 'pohang', name: '浦項スティールヤード', short: '浦項',
    address: '韓国 慶尚北道 浦項市', lat: 36.0083, lng: 129.3596,
  },
};

export const HOME_STADIUM = STADIUMS.sankyo;

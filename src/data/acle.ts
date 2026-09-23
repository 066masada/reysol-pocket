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

/* ── 対戦相手ガイド ──
 * 出典: スポーツナビ（ACLE組み合わせ・Kリーグ順位）、Goal.com / FootyStats（タイ・リーグ順位）、
 *       各クラブWikipedia。2026-09-23 時点。
 */

export interface OpponentGuide {
  clubId: string;
  /** ひと言でいうと */
  tagline: string;
  /** どんなクラブか（2〜3文） */
  about: string;
  /** 直近の実績 */
  form: string;
  /** アジアでの実績 */
  asia?: string;
}

export const OPPONENT_GUIDES: OpponentGuide[] = [
  {
    clubId: 'jeonbuk',
    tagline: '韓国の絶対王者',
    about: '全羅北道・全州を本拠とするKリーグ随一の強豪。資本力と選手層で他を圧倒し、アジアでも常に上位に絡む。',
    form: '2025年 Kリーグ1 優勝（4年ぶり10度目）',
    asia: 'ACL優勝2回（2006・2016）',
  },
  {
    clubId: 'port',
    tagline: 'バンコクの下町クラブ',
    about: 'バンコクのクロントゥーイ港に由来する歴史あるクラブ。熱狂的なサポーターと、狭く音が響くスタジアムで知られる。',
    form: '2025/26 タイ・リーグ1 2位',
  },
  {
    clubId: 'ratchaburi',
    tagline: 'タイ中部の伏兵',
    about: 'バンコクの西およそ100kmのラーチャブリー県が本拠。近年着実に力をつけ、初めてのACLE挑戦となる。',
    form: '2025/26 タイ・リーグ1 3位',
  },
  {
    clubId: 'daejeon',
    tagline: '躍進を続ける市民クラブ',
    about: '韓国中部・大田を本拠とする市民クラブ。ハナ金融グループの支援を受けて近年急成長し、上位常連になった。',
    form: '2025年 Kリーグ1 2位',
  },
  {
    clubId: 'newcastle',
    tagline: '戦闘機がエンブレムのクラブ',
    about: 'シドニーの北、ニューカッスルを本拠とするAリーグのクラブ。近郊の空軍基地にちなむ「ジェッツ」の名を持ち、エンブレムは3機の戦闘機。',
    form: '2025/26 Aリーグ レギュラーシーズン上位',
  },
  {
    clubId: 'conganhanoi',
    tagline: 'ベトナム王者、初のアジア挑戦',
    about: 'ハノイ市公安（警察）を母体とするクラブ。大型資本を投じて一気に強化され、ベトナムサッカーの勢力図を塗り替えた。ACLE初出場。',
    form: '2025/26 Vリーグ1 優勝',
  },
  {
    clubId: 'buriram',
    tagline: 'タイ最強、東地区の優勝候補',
    about: 'タイ東北部ブリーラム県を本拠とする、タイサッカー史上もっとも成功したクラブ。専用スタジアムとサーキットを備えた「ブリーラム・キャッスル」で知られる。',
    form: '2025/26 タイ・リーグ1 優勝／2026 タイFAカップ優勝（8度目）',
  },
  {
    clubId: 'pohang',
    tagline: '鉄の街の古豪',
    about: '製鉄の街・浦項を本拠とする韓国屈指の伝統クラブ。育成に定評があり、堅い守備から一気に仕留めるスタイル。',
    form: '2025年 Kリーグ1 4位',
    asia: 'ACL優勝（2009）ほか、前身のアジアクラブ選手権でも優勝経験',
  },
];

/* ── 相手国リーグ入門 ── */

export interface LeagueGuide {
  key: 'k1' | 'thai1' | 'aleague' | 'vleague';
  name: string;
  country: string;
  /** 規模とシーズン */
  format: string;
  /** どんなリーグか */
  about: string;
  /** 柏の対戦相手 */
  opponents: string;
}

export const LEAGUE_GUIDES: LeagueGuide[] = [
  {
    key: 'k1', name: 'Kリーグ1', country: '韓国',
    format: '12クラブ／春秋制（3月〜11月）',
    about: 'アジアで最も長くACLを戦ってきたリーグのひとつ。球際の強さと切り替えの速さが特徴で、Jリーグとは「アジアの盟主」を争う関係が続く。上位クラブは代表級を多く抱える。',
    opponents: '全北現代・大田ハナ・浦項（柏は3クラブと対戦）',
  },
  {
    key: 'thai1', name: 'タイ・リーグ1', country: 'タイ',
    format: '16クラブ／秋春制（8月〜5月）',
    about: '東南アジア最大の規模と資金力を持つリーグ。日本人選手・指導者も多く、Jリーグとの関係が深い。高温多湿と熱狂的な観客、独特のピッチコンディションがアウェイの壁になる。',
    opponents: 'ブリーラム・ポート・ラーチャブリー（柏は3クラブと対戦）',
  },
  {
    key: 'aleague', name: 'Aリーグ', country: 'オーストラリア',
    format: '13クラブ／10月〜5月',
    about: 'フィジカルとスピードを前面に出すリーグ。長距離移動と、日本とは逆の季節（11月は現地の初夏）が遠征の難しさになる。',
    opponents: 'ニューカッスル・ジェッツ',
  },
  {
    key: 'vleague', name: 'Vリーグ1', country: 'ベトナム',
    format: '14クラブ／秋春制',
    about: '代表の躍進とともに急速にレベルが上がっているリーグ。資本が入ったクラブが強化を進め、アジアの舞台でも侮れない存在になりつつある。',
    opponents: 'コンアン・ハノイ',
  },
];

/* ── アウェイ遠征ガイド ──
 * 2026年9月時点の目安。運賃・物価・入国制度は変わるため、渡航前に必ず公式で確認すること。
 */

export interface TravelGuide {
  /** 対戦相手の clubId */
  clubId: string;
  city: string;
  country: string;
  /** 日本との時差（日本が何時間進んでいるか） */
  timeDiff: string;
  /** 日本からの行き方 */
  getting: string[];
  /** 空港・主要駅からスタジアムまで */
  toStadium: string;
  /** 入国に必要なもの */
  entry: string;
  /** 通貨と物価の目安 */
  money: string;
  /** 通信 */
  sim: string;
  /** 現地で楽しめること */
  tips: string[];
  /** 外務省の国・地域別安全情報 */
  mofaUrl: string;
}

export const TRAVEL_GUIDES: TravelGuide[] = [
  {
    clubId: 'ratchaburi',
    city: 'ラーチャブリー', country: 'タイ',
    timeDiff: '日本 −2時間（現地19:15 = 日本21:15）',
    getting: [
      '成田・羽田からバンコク（スワンナプーム）まで直行便で約6〜7時間',
      'バンコク市内からラーチャブリーまで約100km。タイ国鉄 南線（クルンテープ・アピワット駅発）で約2時間',
      '車・乗合バスでも約2時間。試合は夜なのでバンコク前泊・後泊が現実的',
    ],
    toStadium: 'ラーチャブリー駅から市内。スタジアムへはタクシーかソンテウ（乗合）で移動',
    entry: '観光目的の短期滞在はビザ不要（滞在可能日数は変更されることがあるため要確認）。入国前にオンラインの入国カード提出が必要な場合あり',
    money: 'タイバーツ（THB）。1THB ≒ 4〜5円。屋台の食事 50〜100THB、市内タクシー初乗り 35THB',
    sim: '空港で現地SIMが買えるほか、eSIM が手軽。7日間 数百円〜',
    tips: [
      '「タイ12の秘宝」に選ばれたアートの町。水瓶（オーン）の産地として知られる',
      'バンコクから日帰り圏内なので、バンコク泊にして試合日だけ移動する手もある',
      '10月末でも日中30℃前後。ナイトゲームでも水分補給を',
    ],
    mofaUrl: 'https://www.anzen.mofa.go.jp/info/pcinfectionspothazardinfo_008.html',
  },
  {
    clubId: 'newcastle',
    city: 'ゴスフォード（セントラルコースト）', country: 'オーストラリア',
    timeDiff: '日本 +2時間（現地18:45 = 日本16:45）※夏時間',
    getting: [
      '成田・羽田からシドニーまで直行便で約9〜10時間',
      'シドニー中心部からゴスフォードまで、セントラルコースト&ニューカッスル線の電車で約1時間20分',
      '試合会場はニューカッスルではなく、その手前のゴスフォード。シドニー泊が便利',
    ],
    toStadium: 'セントラルコースト・スタジアムはゴスフォード駅から徒歩圏内',
    entry: 'ETA（電子渡航許可）が必要。専用アプリから申請する。渡航前に余裕をもって取得を',
    money: 'オーストラリアドル（AUD）。1AUD ≒ 100円前後。物価は日本より高め。カード決済がほぼ全て',
    sim: '現地SIM または eSIM。空港でも購入可',
    tips: [
      '11月下旬は現地の初夏。日本の冬支度のまま行かないこと',
      'ゴスフォードは海沿いのリゾート地。試合前に海岸を歩ける',
      '時差が小さく（2時間）、体への負担が軽い遠征先',
    ],
    mofaUrl: 'https://www.anzen.mofa.go.jp/info/pcinfectionspothazardinfo_024.html',
  },
  {
    clubId: 'pohang',
    city: '浦項（ポハン）', country: '韓国',
    timeDiff: '時差なし（現地19:00 = 日本19:00）',
    getting: [
      '成田・羽田・関空からソウル（仁川・金浦）まで約2〜2時間半。福岡からはさらに近い',
      'ソウルから浦項まで KTX で約2時間20分',
      '釜山経由でもアクセスできる。地方空港発の便も選択肢',
    ],
    toStadium: '浦項スティールヤードは市内中心部からバス・タクシーで',
    entry: '日本人は短期滞在ビザ不要。K-ETA は2026年12月31日まで免除（電子入国申告の利用は可）',
    money: '韓国ウォン（KRW）。1,000KRW ≒ 110円前後。交通カード（T-money）があると便利',
    sim: '現地SIM・eSIM ともに豊富。空港受け取りの WiFi ルーターも',
    tips: [
      '2月中旬の試合。韓国東海岸の冬は冷えるので防寒をしっかり',
      '製鉄の街。海沿いの港町でもあり、海鮮が名物',
      '時差がなく、移動も短い。もっとも行きやすいアウェイ',
    ],
    mofaUrl: 'https://www.anzen.mofa.go.jp/info/pcinfectionspothazardinfo_005.html',
  },
];

export const TRAVEL_NOTE =
  'ビザ・入国制度・運賃・物価は変わります。渡航前に必ず外務省や各国公式の最新情報を確認してください。';

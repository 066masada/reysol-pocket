# Reysol Pocket — 柏レイソル ファンアプリ（PWA）

「ポケットに日立台を」。柏レイソルの試合日程・チケット・スタジアム・掲示板・配信への導線をひとつにまとめた非公式ファンアプリです。

- 企画・設計: [docs/PROPOSAL.md](docs/PROPOSAL.md)
- デザインモック: [docs/mockup.html](docs/mockup.html)

## 技術スタック

React 19 / TypeScript / Vite 8 / vite-plugin-pwa（Workbox）/ カスタムCSS（デザイントークン）/ Firebase Hosting
状態管理は Context API のみ。UI ライブラリなし。

## 開発

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run preview    # ビルド結果を確認
npm run lint
```

### 環境変数（任意）

`.env.example` を `.env` にコピーして設定。

| 変数 | 内容 |
|---|---|
| `VITE_GOOGLE_MAPS_EMBED_KEY` | Google Maps Embed API キー。未設定ならキー不要の簡易埋め込みにフォールバック |

天気は Open-Meteo（APIキー不要）を直接呼ぶため設定は不要です。

## デプロイ（Firebase Hosting）

```bash
npm run build
npx firebase login
npx firebase use reysol-pocket   # .firebaserc のプロジェクトID
npx firebase deploy --only hosting
```

## 構成

```
src/
├── App.tsx / main.tsx / index.css     ← シェル・デザイントークン
├── types/index.ts
├── contexts/  NavigationContext（ハッシュルーティング・試合詳細）/ SettingsContext（テーマ）
├── data/      competitions / clubs / stadiums / schedule（2026-27 全日程）/ standings / boards / links / changelog
├── hooks/     useNow / useWeather / useInstallPrompt
├── utils/     date / fixtures（成績・当日モード判定）/ external / weather（Open-Meteo）/ ics
└── components/
    ├── pages/ Home / Schedule / Live / Boards / More / MatchDetail
    ├── match/ MatchHero / MatchDayBanner / MatchRow / CalendarGrid / MatchCalendar
    │          TicketCalendar / TicketList / WeatherLine / Parts
    ├── standings/ StandingsView（カテゴリ別）/ StandingsTable / RecordCard / CupPath
    ├── stadium/ StadiumMap
    └── ui/ Icons / InstallBanner
```

## データ自動更新

GitHub Actions が1日2回（JST 6:00 / 23:30）公式ページを取得し、変化があれば `data/*.json` をコミットします。
アプリは起動時にその JSON を読み、同梱データに上書きマージします。**デプロイは不要**です。

| 取得元 | 内容 | 出力 |
|---|---|---|
| [柏レイソル公式 試合日程](https://www.reysol.co.jp/game/results/) | 全50試合の日時・会場・結果 | `data/fixtures.json` |
| 柏レイソル公式 試合結果ページ（`/game/results/202627/MMDD.php`） | 得点者（両チーム・時間つき） | 同上（`goals`） |
| [Jリーグ公式 J1順位表](https://www.jleague.jp/standings/j1/) | 20クラブの順位・勝点 | `data/standings-j1.json` |
| [Wikipedia ACLE 2026/27](https://ja.wikipedia.org/wiki/AFCチャンピオンズリーグエリート2026/27) | ACLE東地区16クラブの順位 | `data/standings-acle.json` |

- **上書きされるもの**: キックオフ日時、時刻確定、会場、スコア、試合ステータス
- **手入力のまま残るもの**: チケット販売日程（`ticketSales`）、スタメンURL（`lineupUrl`）、注記（`note`）
- 取得に失敗した場合は同梱データ（`src/data/schedule.ts`）で動作します
- 手元で試す: `npm run sync`（`data/` に書き出し）。アプリ側の参照先は `VITE_DATA_BASE` で差し替え可能

配信元は `src/data/remote.ts` の `BASE` 定数（既定: `raw.githubusercontent.com/066masada/reysol-pocket/main/data`）。
リポジトリ名を変えた場合はここを直してください。

## 試合中のライブスコア

試合時間中だけ、[TheSportsDB のライブスコア](https://www.thesportsdb.com/api/v1/json/3/livescore.php?s=Soccer)（無料・キー不要・CORS許可）を
**10秒おき**に取得します（[src/hooks/useLiveScore.ts](src/hooks/useLiveScore.ts)）。

- 柏を含む試合だけを拾うので、相手クラブの英語表記は不要
- 画面が見えていない間は停止。失敗が3回続いたら60秒間隔に落とす
- 試合終了（FT）を取得したら追跡をやめる。確定スコアは通常の同期が拾う

## データ更新（手動メンテが必要なもの）

- 日程・結果: 自動更新されます（上記）。同梱データを直す場合は [src/data/schedule.ts](src/data/schedule.ts)
- スタメンのリンク: 同ファイルの `lineupUrl: sn('<スポーツナビの試合ID>')`。IDは https://soccer.yahoo.co.jp/jleague/team/132 の日程から取得
- チケット販売日: 同ファイルの `ticketSales`（プレリク抽選・一次・二次・三次の4段階。出典: 公式「販売日程」）
- 掲示板一覧: [src/data/boards.ts](src/data/boards.ts)（[docs/boards.tsv](docs/boards.tsv) から生成）
- 順位表: J1・ACLEとも自動更新
- ACL特設の読み物（対戦相手・リーグ・遠征ガイド・地図の座標）: [src/data/acle.ts](src/data/acle.ts)
- ACL特設の地図: `node scripts/build-map.mjs` で [src/data/acle-map.ts](src/data/acle-map.ts) を再生成（出典: Natural Earth 110m、パブリックドメイン）

## ロードマップ

- ✅ 静的データ＋PWA
- ✅ 日程・結果・J1順位表の自動更新（GitHub Actions、外部APIもシークレットも不要）
- 次: 全会場ライブスコア、選手名鑑・スタメン予想、プッシュ通知

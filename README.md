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

## データ更新

- 日程・結果: [src/data/schedule.ts](src/data/schedule.ts) を編集（出典: 柏レイソル公式サイト）。試合終了後は `status: 'ft'` と `score` を入れる
- スタメンのリンク: 同ファイルの `lineupUrl: sn('<スポーツナビの試合ID>')`。IDは https://soccer.yahoo.co.jp/jleague/team/132 の日程から取得
- チケット販売日: 同ファイルの `ticketSales`（プレリク抽選・一次・二次・三次の4段階。出典: 公式「販売日程」）
- 掲示板一覧: [src/data/boards.ts](src/data/boards.ts)（[docs/boards.tsv](docs/boards.tsv) から生成）
- 順位表: [src/data/standings.ts](src/data/standings.ts)（節ごとに手動更新。Phase 2 で自動化）

## ロードマップ

- Phase 1（現在）: 静的データ＋PWA
- Phase 2: API-Football + Cloud Functions で日程自動同期・全会場ライブスコア・順位表
- Phase 3: プッシュ通知・公式ニュース・天気

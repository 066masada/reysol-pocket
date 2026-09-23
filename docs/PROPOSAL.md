# 柏レイソル ファン向け PWA — 企画・設計提案

> 作成日: 2026-09-22
> 参考構成: `C:\work\KG\MLA-C01`（React 19 / TypeScript / Vite 8 / vite-plugin-pwa / Firebase Hosting + Realtime Database）
> 状態: Phase 1 実装中（2026-09-22 着手）。

---

## 0. 結論（先に要点）

| 項目 | 提案 |
|---|---|
| アプリ名（仮） | **Reysol Pocket** — 「ポケットに日立台を」 |
| 技術スタック | 参考プロジェクトと同じ **React 19 + TS + Vite + vite-plugin-pwa + Firebase**。状態管理は Context API のみ、UIライブラリなし |
| 画面 | 5タブ: **ホーム / 日程 / LIVE / 掲示板 / もっと** |
| データ戦略 | ①静的マスタ（クラブ・スタジアム・リンク）はリポジトリ内 ②日程・ライブ・順位は **API-Football を Cloud Functions が定期取得 → RTDB に書き込み → 全ユーザーが購読**（APIキーはサーバ側に隠蔽、1回の取得を全員で共有） |
| デザイン | 「**日立台ナイター**」コンセプト。黒のヘッダー／ヒーローに **サンイエロー (#FFE100)** を効かせ、コンテンツ面は暖色寄りのオフホワイト。数字は Oswald（スコアボード感）、本文は Noto Sans JP |
| 段階 | Phase 1: 静的データで骨格＋PWA（Functions不要） → Phase 2: ライブ・順位・自動日程同期 → Phase 3: 通知・ニュース・カレンダー連携 |

---

## 1. 前提となる事実（2026-09-22 時点で確認）

- Jリーグは **2026-27 シーズンから秋春制**（8月開幕〜5月閉幕）。シーズンキーは `2026-27` 形式で持つ。
- 柏は **AFC Champions League Elite 2026/27** リーグステージに出場中。
  - ホーム（三協フロンテア柏スタジアム）: 10/14 ポートFC、11/3 大田ハナ・シチズン、12/1 コンアン・ハノイ、2027/2/10 ブリーラム・ユナイテッド
  - アウェイ: 9/16 全北、10/27 ラーチャブリー、11/24 ニューカッスル・ジェッツ、2027/2/16 浦項
- Jリーグ公式サイト（jleague.jp）は Next.js 製で **公開JSON APIなし**。スクレイピングは規約・壊れやすさの両面で非推奨 → 日程／ライブは外部APIを使う。
- 掲示板は **超サッカー掲示板（bm.best-hit.tv）**。柏は `https://bm.best-hit.tv/reysol/`、他クラブも同ドメインで `https://bm.best-hit.tv/{slug}/`（例: `reds`, `antlers`, `zelvia`, `j1`=J1総合）。全 84 掲示板の slug 一覧は `docs/boards.tsv`。
  - **iframe 埋め込みは不可**（`X-Frame-Options: DENY` を確認済み）。アプリ内に直接表示はできない。
  - 代わりに各掲示板が **RSS を配信**（`https://bm.best-hit.tv/{slug}/feed.rss`、UTF-8、最新投稿の本文＋時刻）。ただし CORS ヘッダなし → ブラウザから直接は取れず、**サーバ側（Cloud Functions）経由**で取得する。
- 放送・配信: DAZN が引き続きJリーグ全試合配信、ABEMA は「ABEMA de DAZN」および一部無料試合。ACLE は DAZN（要確認）。

---

## 2. 要件 → 機能マッピング

| 要望 | 実現方法 | Phase |
|---|---|---|
| 試合日程をチェック | 「日程」タブ。月別・大会別フィルタ、試合カード→詳細画面。ホームに「次の試合」ヒーロー＋カウントダウン | 1 |
| J1／天皇杯／ルヴァン／ACLE を判別 | 大会ごとの **色チップ**（J1=黒×黄、ルヴァン=緑、天皇杯=紫、ACLE=青）。フィルタも同じ色で統一 | 1 |
| チケット予約への導線 | 試合詳細・ホームヒーローに「チケット」CTA。試合ごとに `ticketUrl` と `ticketOnSale`（発売日）を持ち「発売前／発売中／完売」バッジ表示。リンク先: レイソル公式チケット・Jリーグチケット | 1 |
| Google Map でスタジアム | **Maps Embed API**（無料・要APIキー）の iframe を試合詳細／スタジアムガイドに埋め込み。「Googleマップで開く」「経路」ボタンはディープリンク（`https://www.google.com/maps/dir/?api=1&destination=lat,lng`）でアプリ起動 | 1 |
| Jリーグ掲示板に簡単アクセス、他クラブもスワイプ | 「掲示板」タブ。**クラブカードを横スワイプで切替**（柏を先頭、以降 J1 → J1総合 → J2 → J3）。iframe は不可（X-Frame-Options: DENY）なので、カードから **ワンタップで掲示板を開く**（`https://bm.best-hit.tv/{slug}/`）。PWA からの外部リンクは **iOS: アプリ内 Safari シート／Android: Chrome カスタムタブ** で開くため、閉じればアプリに戻る（決定: 方式②）。RSS 取り込み・自前UI再描画は利用規約（禁止事項14）に触れる可能性があるため採用しない | 1 |
| DAZN / ABEMA 導線 | 試合詳細・ヒーローに「観る」CTA（試合ごとの `broadcast: ['dazn','abema']`）。もっとタブにも常設リンク | 1 |
| 公式情報 | もっとタブ: 公式サイト・公式X/Instagram/YouTube・チケット・グッズ。Phase 3 で公式ニュースをサーバ側取得しホームに最新3件表示 | 1 / 3 |
| リアルタイム試合状況（他会場含む） | 「LIVE」タブ。柏の試合をトップに、同節の全試合スコアを一覧。Cloud Functions が試合中 60〜120 秒ごとに API-Football から取得 → RTDB `/live` → 全クライアントがリアルタイム購読。順位表も同居 | 2 |

**提案する追加機能（あると嬉しい）**
- **順位表**（J1 / ACLE グループ）— API-Football の standings をそのまま
- **カレンダー登録**（.ics 生成、iOS/Android の標準カレンダーに追加）
- **キックオフ当日の天気**（Open-Meteo: 無料・キー不要）を試合詳細に
- **プッシュ通知**（FCM Web Push）: キックオフ1時間前、ゴール、試合終了。iOS はホーム画面追加で対応
- **オフライン対応**: 日程・スタジアム情報を Service Worker でキャッシュ → 圏外のスタジアムでも開ける

---

## 3. 画面構成

```
┌───────────── App Bar（黒地・黄ロゴ） ─────────────┐
│  ◆ REYSOL POCKET                    2026-27  ⚙  │
└─────────────────────────────────────────────────┘
│                                                 │
│               Main Content                      │
│                                                 │
┌──────────── Bottom Nav（黒地・黄アクティブ）──────┐
│  ホーム │ 日程 │ LIVE │ 掲示板 │ もっと          │
└─────────────────────────────────────────────────┘
```

### ホーム
1. **次の試合ヒーロー**（黒）— 大会チップ、対戦カード（エンブレム＋略称）、キックオフ日時、会場、**カウントダウン（日:時:分）**、「チケット」「観る（DAZN）」「行き方」の3ボタン
   - 試合中は自動で **ライブスコア表示**に切り替わる（LIVE バッジ点滅）
2. 直近の結果（3件、W/D/L の色付き）
3. J1 順位（柏の前後3クラブだけ抜粋）→ LIVE タブへ
4. 公式ニュース最新3件（Phase 3）

### 日程
- 上部: 月セレクタ（横スクロール）＋大会フィルタチップ
- 試合カード: 日付・曜日 ／ 大会チップ ／ H/A ／ 対戦相手 ／ キックオフ ／ 会場 ／ 結果 or チケット状態
- タップ → **試合詳細**: 地図（Embed）、アクセス、チケットCTA、配信CTA、天気、相手クラブの掲示板、カレンダー追加

### LIVE
- 柏の試合（大きく）→ 同節の全会場（コンパクト、ゴール時に行がフラッシュ）
- サブタブ: 「今日」「順位表」
- 試合がない日は「次の試合まで ○日」＋前節の結果

### 掲示板（超サッカー掲示板）
- クラブカードを横スワイプ（`scroll-snap`）。柏 → J1 各クラブ → J1総合 → J2 → J3。上部にクラブカラーのタブバー
- カード内容: クラブ名／掲示板名／クラブカラー、「掲示板を開く」ボタン（アプリ内ブラウザで `bm.best-hit.tv/{slug}/`）
- 柏の掲示板はホーム画面のショートカットにも置く（試合直後に一番押すボタン）
- 決定（2026-09-22）: 方式②「アプリ内ブラウザ」。RSS/HTML の取り込みは行わない（規約リスク回避）
- 試合詳細画面には「相手クラブの掲示板」ボタンを置く（対戦相手 slug を `clubs.ts` から引く）

### もっと
- 公式リンク（サイト・SNS・チケット・グッズ・アカデミー）
- 配信（DAZN / ABEMA / ACLE配信先）
- スタジアムガイド（三協フロンテア柏スタジアム: 地図・住所・最寄駅・入場ゲート・注意事項）
- 設定（通知、テーマ、ホーム画面追加の案内）
- バージョン・更新履歴（参考プロジェクトと同じ長押しで開く仕組みを流用可）

---

## 4. システム構成

```
                      ┌──────────────────────────┐
   API-Football       │  Firebase Cloud Functions │        Firebase RTDB
  (api-sports.io) <───┤  ・syncFixtures (毎日 1回) ├──────> /fixtures/{season}
                      │  ・pollLive (試合中 60-120s)│──────> /live/{date}
  reysol.co.jp  <─────┤  ・syncNews (30分ごと,P3)   │──────> /standings/{league}
  (ニュース, P3)       │  ・notify (ゴール等, P3)    │──────> /news
                      └──────────────────────────┘             │
                                                               │ onValue 購読
                      ┌──────────────────────────┐             v
   ユーザー <─────────┤  PWA (Firebase Hosting)   │<────────────┘
                      │  React + Vite + Workbox   │
                      │  静的: clubs/stadiums/links│──> Google Maps Embed / Open-Meteo（クライアント直）
                      └──────────────────────────┘
```

### なぜ「サーバ側で取得 → RTDB → 購読」か
- **APIキーをクライアントに置かない**（参考プロジェクトの Firebase 設定と同じ思想）
- **API 呼び出し回数がユーザー数に依存しない**（100人が見ても 1 分に 1 回）
- クライアントは RTDB の `onValue` でリアルタイム更新 → 実装が単純で、参考プロジェクトの `useFirebase.ts` パターンをそのまま流用できる

### データソース比較（ライブ・日程）

| 案 | 内容 | 長所 | 短所 | 判定 |
|---|---|---|---|---|
| **A. API-Football** | J1・ルヴァン・天皇杯・ACL をカバー。`fixtures?live=all` で全会場を1リクエスト取得 | 公式に許可されたAPI、日程／順位／ライブが1本で揃う | 無料枠 100 req/日（1試合日で 60〜120s ポーリング ≒ 75〜150 req）。有料は約 $19/月〜 | **採用**。まず無料枠で試合中のみ 120s 間隔、足りなければ有料 |
| B. jleague.jp スクレイピング | HTMLを解析 | 無料 | 規約リスク、構造変更で即壊れる、Next.js のクライアント描画で取りづらい | 不採用 |
| C. 手動メンテ JSON | `public/data/schedule.json` を自分で更新 | 依存ゼロ、確実 | ライブ不可、更新が手間 | **Phase 1 の日程はこれ**（後に A で自動化、JSON は上書き用に残す） |

> Phase 1 は Functions 不要（Spark プランのまま）。Phase 2 で Blaze プランに変更（Scheduled Functions に必要。無料枠内でほぼ $0）。

### データモデル（RTDB）

```
/fixtures/{season}/{fixtureId}
  { competition: 'j1'|'levain'|'emperor'|'acle'|'friendly',
    round, kickoffAt (ISO), home: clubId, away: clubId,
    stadiumId, status: 'scheduled'|'live'|'ft'|'postponed',
    score: { home, away } | null,
    ticketUrl?, ticketOnSale?, broadcast?: ['dazn','abema'] }

/live/{yyyy-mm-dd}/{fixtureId}
  { minute, status, score, events: [{ minute, type:'goal'|'card'|'sub', team, player }], updatedAt }

/standings/{season}/{competition}
  [{ rank, clubId, played, won, drawn, lost, gf, ga, gd, points }]

/news (P3)   [{ id, title, url, publishedAt, category }]
/users/{uid} (P3, 通知設定)  { fcmToken, notify: { kickoff, goal, ft } }
```

静的マスタ（`src/data/`）:
- `clubs.ts` — J1〜J3 全クラブ: id / 正式名 / 略称 / クラブカラー / jleague slug / 掲示板 slug（bm.best-hit.tv、`docs/boards.tsv` から生成） / エンブレム（SVG or 公式画像URL）
- `stadiums.ts` — 名称 / 住所 / 緯度経度 / 最寄駅 / アクセス文
- `links.ts` — 公式・チケット・配信・掲示板の URL 一覧
- `competitions.ts` — 大会の表示名・色・API-Football のリーグID

---

## 5. デザイン方針 —「日立台ナイター」

参考プロジェクトの K&G デザインシステム（紺×紙、静かな編集的トーン）とは意図的に変え、**スタジアムのスコアボード**を思わせる強いコントラストに振る。

| トークン | 値 | 用途 |
|---|---|---|
| `--sun` | `#FFE100` | 柏のサンイエロー。CTA、アクティブ状態、数字の強調 |
| `--sun-deep` | `#E5C700` | 黄の hover / 押下 |
| `--night` | `#111111` | App Bar、ヒーロー、Bottom Nav、ダークモードの地 |
| `--night-2` | `#1E1E1C` | 黒地の上のカード |
| `--ground` | `#FAF8F0` | 明るい面の地（黄に寄せた暖色オフホワイト。純白にしない） |
| `--ink` / `--ink-2` / `--ink-3` | `#161616` / `#4A4A46` / `#807F78` | 本文階層 |
| `--live` | `#E4002B` | LIVE バッジ、ゴール点滅（黄と競合しない赤） |
| 大会色 | J1 `#111`×黄 / ルヴァン `#0F7A4A` / 天皇杯 `#5C2D91` / ACLE `#1B4F9C` | チップ・フィルタ |
| 勝敗 | W `#1C8A4E` / D `#807F78` / L `#C0392B` | 結果ドット |

- **書体**: 数字・時刻・スコア・カウントダウン = **Oswald**（コンデンスド、スコアボード感）／本文 = **Noto Sans JP**／英字ラベル = Oswald の小文字スペーシング
- **ダークモード**: 地を `--night`、面を `--night-2`、黄はそのまま。黒×黄は暗所（ナイター現地）で最も映える
- **形**: 角丸 4〜8px、影はほぼ無し、区切りは 1px の罫。カードの左に大会色の 3px ストライプ
- **モーション**: ゴール時に該当行が黄→透明にフラッシュ、LIVE バッジは 1.2s の点滅。`prefers-reduced-motion` で停止
- モックアップ: `docs/mockup.html`（Artifact でも共有）

---

## 6. ディレクトリ構成（案）

```
reysol/
├── functions/                  ← Phase 2（Cloud Functions, TypeScript）
│   └── src/{syncFixtures,pollLive,syncStandings}.ts
├── public/
│   ├── icons/ (192/512 PNG, maskable)
│   └── data/schedule.json      ← Phase 1 の日程（手動）
├── src/
│   ├── App.tsx / main.tsx / index.css / firebase.ts
│   ├── types/index.ts
│   ├── contexts/NavigationContext.tsx, SettingsContext.tsx
│   ├── data/{clubs,stadiums,links,competitions}.ts
│   ├── hooks/{useFixtures,useLive,useStandings,useCountdown}.ts
│   ├── components/
│   │   ├── pages/{HomePage,SchedulePage,LivePage,BoardsPage,MorePage,MatchDetail}.tsx
│   │   ├── match/{MatchCard,MatchHero,ScoreRow,CompetitionChip,ResultDot}.tsx
│   │   ├── stadium/{StadiumMap,AccessInfo}.tsx
│   │   └── boards/{ClubSwiper,BoardFrame}.tsx
│   └── utils/{date,ics,links}.ts
├── firebase.json / .firebaserc / database.rules.json
├── vite.config.ts（manifest: name 'Reysol Pocket', theme_color '#111111', background '#FFE100'）
└── package.json
```

---

## 7. 実装フェーズ

### Phase 1 — 骨格＋静的データ（Functions 不要）
1. Vite + React + TS + PWA の雛形、デザイントークン、5タブ、App Bar / Bottom Nav
2. `clubs / stadiums / links / competitions` マスタ作成
3. `schedule.json`（2026-27 の J1・ルヴァン・天皇杯・ACLE を手入力）＋ 日程タブ・試合詳細
4. ホームの次の試合ヒーロー＋カウントダウン、チケット／配信／経路 CTA
5. スタジアム Google Map（Embed）、掲示板スワイプ、もっとタブ
6. Firebase Hosting へデプロイ、ホーム画面追加の動作確認（iOS/Android）

### Phase 2 — ライブ・順位・自動同期
1. API-Football のアカウント作成、リーグID／柏の team ID を確認
2. Cloud Functions: `syncFixtures`（毎日）、`syncStandings`（毎日）、`pollLive`（試合中のみ、Cloud Scheduler で毎分起動して試合窓内なら取得）
3. LIVE タブ（柏＋全会場）、ホームヒーローのライブ切替、順位表
4. `schedule.json` は override 用に降格（チケットURL・発売日などAPIにない情報）

### Phase 3 — 通知・ニュース・便利機能
1. FCM Web Push（キックオフ前・ゴール・終了）、設定画面
2. 公式ニュース取り込み（RSS の有無を確認、なければ HTML パース）
3. .ics カレンダー登録、Open-Meteo 天気、アウェイ会場ガイド

---

## 8. 決めていただきたいこと

1. ~~掲示板~~ → 超サッカー掲示板（bm.best-hit.tv）、方式②「カードをスワイプ → アプリ内ブラウザで開く」で確定。
2. **ライブ配信データ**に API-Football を使う方針で良いですか？（無料枠から開始。足りなければ月 $19 程度。Phase 2 で Firebase を Blaze プランに変更が必要）
3. **Google Maps** は Embed API（無料、Google Cloud で APIキー発行が必要）で良いですか？ キー不要の簡易埋め込み（`maps.google.com/maps?q=...&output=embed`）でも動きますが非公式です。
4. アプリ名は「Reysol Pocket」（仮）で進めて良いですか？
5. Firebase プロジェクトは新規作成（例: `reysol-pocket`）で良いですか？

---

## 参考リンク
- 柏レイソル公式: https://www.reysol.co.jp/
- ACLE 2026/27 日程（公式）: https://www.reysol.co.jp/news/event/acl-elite-202627.html
- Jリーグ公式 柏ページ: https://www.jleague.jp/club/kashiwa/
- 超柏レイソル掲示板: https://bm.best-hit.tv/reysol/ （RSS: https://bm.best-hit.tv/reysol/feed.rss、全掲示板一覧: https://h178.com/bbs.htm）
- Jリーグチケット 柏: https://www.jleague-ticket.jp/club/ka/
- API-Football: https://www.api-football.com/

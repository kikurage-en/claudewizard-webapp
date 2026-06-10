# CHANGELOG

## v0.2.2 (2026-06-10)

### Light プラン増強（品質接地 + core-principles 追加 5→6）

#### 追加

- `src/templates/{ja,en}/core_principles_md.ts`: Light に静的テンプレ `core-principles.md`（Evidence First / Boundary Check / Failure Reflection の3原則）を追加。CLI `core-principles.md` から翻案し self-contained 化。Light の出力ファイルが 5 → **6** に。
- `src/templates/manifest.ts`: `LIGHT_MANIFEST` に core-principles を追加（FREE_MANIFEST spread の末尾＝Free/Plus 非波及）。
- `src/generator/lightGenerator.ts`: `loadStaticTemplates` / `allTemplates` に core_principles を配線。
- `scripts/verify-prompts-grounded.sh` + `.github/workflows/e2e.yml`: **.enc 反映漏れ防止ゲート**（復号した light prompt に grounding マーカーの存在を grep 検証。ローカル必須完了条件 + CI ゲート）。

#### 変更

- `src/prompts/light_{ja,en}.ts`（平文）: 生成 prompt を dotfiles/CLI 慣習へ接地 — CLAUDE.md を **最大150行 → 100行以下**（自リポジトリ Truth Source `verification-guidelines.md` に整合）、MUST/MUST NOT 形式、出荷3 rules への @参照チェーン、SKILL.md の YAML frontmatter 必須化、Q3-Q5（作業内容/ツール/目標）の反映を具体マッピング化。**※ `.enc` 再暗号化（USER-GATED）まで本番未反映。**

#### テスト・検証

- `templates/__tests__/manifest.test.ts`（新規）: FREE=4 / LIGHT=6 / PLUS=9・LIGHT[0..3]===FREE・Plus 非波及を deterministic に assert（adversarial review finding 3）。
- `generator/__tests__/lightGenerator.test.ts`: 生成 Blob を展開し 6 entries + core-principles を検証。
- `e2e/light-flow.spec.ts`: ファイル数 6 + **出力構造 assert**（CLAUDE.md ≤100行・@参照3本・SKILL frontmatter、adversarial review finding 2）。
- drift 同時更新: `CompletePage.test.tsx`（light:6）/ `locales/{ja,en}.json`（files_count 6）/ spec（requirements / acceptance）/ 元要件定義書 §3.3・§19.1。

## v0.2.1 (2026-06-04)

### Phase 2 クローズ + GitHub Pages 配信修正 + 公開リポジトリ同期

#### 修正

- `vite.config.ts`: GitHub Pages サブディレクトリ配信のため `GITHUB_REPOSITORY` から base path を動的設定（197d96b）
- `index.html`: 公開 URL を `https://kikurage-en.github.io/claudewizard-webapp/` に統一（og:url / hreflang / JSON-LD、fb10fd6）

#### 追加

- 公開リポジトリ同期スクリプト `scripts/sync-public.sh` と暗号化スクリプトの整備（82191ad）
  - rsync 除外パターンをベースファイル名指定（`light_ja.ts` 等）に修正し全パス階層で確実に除外
- `src/security/__tests__/anthropicClient.test.ts`: timeout（AbortError / message に "timeout"）と 503 の単体テストを追加（401/429/500/503/timeout×2/CORS の 9 ケースに）

#### テスト・検証（Phase 2 正式クローズ）

- 単体・コンポーネント: 152 件全件合格（20 ファイル）
- カバレッジ: All files 94.2% lines / 85.07% branches / 84.72% funcs（閾値 80% クリア）、型チェック合格
- `.claude/spec/acceptance.md` の Phase 2 受け入れ基準を確定（**機能受け入れ全件達成**：実 API キー使用の完走 E2E も実キーで `2 passed`、他は証跡付きで [x]）
- spec-reviewer / impl-validator 実行済み（prompt 平文コミットの誤検知を git ls-files / .gitignore で否定、ブロッカーなし）
- 定期チェック実施（health-check 疎通 / npm audit / Web ドキュメント確認、2026-06-04）

## v0.2.0 (2026-05-02)

### Phase 2 完成（Light プラン / BYOK + Claude API）

#### 追加

- Light プランの完走フロー（トップ → API キー入力 → Q1-Q6 → Claude API 生成 → ZIP DL）
- 5 ファイル生成（Free 4 + development-workflow.md）
- BYOK（Bring Your Own Key）基盤
  - `src/security/sessionStore.ts`: API キーを sessionStorage に保存（タブ閉じで自動削除）
  - `src/ui/pages/ApiKeyPage.tsx`: パスワード型入力 + 表示トグル + 注記表示（FR-5）
- Claude API クライアント（`src/security/anthropicClient.ts`）
  - `@anthropic-ai/sdk` + `dangerouslyAllowBrowser: true` + 専用ヘッダー
  - エラー分類: auth / rate_limit / server / timeout / cors / unknown
- 出力パース（`src/generator/parseClaudeOutput.ts`）
  - マークダウンコードブロック除去 + JSON 抽出（要件定義書 §4.4 #1）
- Light 用ジェネレータ（`src/generator/lightGenerator.ts`）
  - API 1-2 回呼び出し + パース失敗時リトライ（要件定義書 §4.4 #3）
- プロンプト暗号化基盤
  - `scripts/encrypt-prompts.sh` / `decrypt-prompts.sh`（openssl aes-256-cbc + pbkdf2）
  - `vite.config.ts` で `.enc` をビルド時復号 → `define` で埋め込み
  - `src/security/promptLoader.ts`: 復号失敗時に致命的エラー（要件定義書 §20.2）
  - `src/prompts/light_ja.enc` / `light_en.enc` をコミット、平文 `.ts` は `.gitignore` で除外
- エラーハンドリング UI（`src/ui/components/ErrorBanner.tsx`）
  - 3 分類別表示（auto_recovery / user_action / fatal）
  - 再試行・閉じるボタン（致命的エラーは再試行不可）
- E2E テスト（`e2e/light-flow.spec.ts`）
  - 実 API キー使用、Light 完走 → 5 ファイル ZIP 検証
  - `ANTHROPIC_API_KEY` 未設定時は自動 skip
- Q6（備考・要望）: Light/Plus プランのみで表示、optional テキスト入力
- CI 連携
  - `.github/workflows/deploy.yml`: `VITE_PROMPT_ENCRYPTION_KEY` を Secrets から
  - `.github/workflows/e2e.yml`: `VITE_PROMPT_ENCRYPTION_KEY` + `ANTHROPIC_API_KEY` を Secrets から

#### 改善

- E2E config: `package.json test:e2e` に `--config=e2e/playwright.config.ts` を明示（src/ 配下の `.test.tsx` 誤検出を防ぐ）

#### テスト

- 単体・コンポーネント: 149 件全件合格（Free 100 件 + Phase 2 で 49 件追加）
- E2E: free-flow 6 件合格、light-flow 2 件（実 API 必要 / 未設定時 skip）
- 型チェック合格、ビルド成功（暗号化プロンプトを bundle に正しく埋め込み）

#### セキュリティ

- API キー: `sessionStorage` のみ、サーバー送信なし
- プロンプト: openssl aes-256-cbc + pbkdf2 で暗号化、復号キーは GitHub Secrets
- 平文プロンプト（`light_*.ts`）は `.gitignore` で git 管理対象外

---

## v0.1.1 (2026-05-02)

### Q1-Q5 質問・選択肢の汎用化

#### 変更

- Q1〜Q5 の質問・選択肢をソフトウェア開発に特化した内容から、SNS 運用・文章作成・データ分析・デザイン・業務効率化など幅広い分野に対応する汎用設計に刷新
- Q1（分野）: `frontend` / `backend` / `mobile` 等の開発職種から `software` / `data-research` / `writing` / `sns` / `automation` / `design` / `other` の職種横断カテゴリーに変更
- Q4（ツール）: テンプレート変数名を `{{techStack}}` → `{{tool}}` に改名し、「プログラミング言語」に加えて「オフィスツール」「クリエイティブツール」「SNS プラットフォーム」「コマンドライン」を選択肢に追加
- `src/locales/ja.json` / `en.json` の wizard セクション更新
- `src/generator/parseAnswers.ts` のラベルマップを全面改訂
- `src/templates/ja/` / `en/` 全 4 テンプレートの変数参照を `{{tool}}` に更新

---

## v0.1.0 (2026-05-02)

### Phase 1 完成（MVP / Free プラン）

#### 追加

- Free プランの完走フロー（トップ → プラン選択 → Q1-Q5 → 生成 → ZIP DL）
- 4 ファイル生成（CLAUDE.md / README.md / SKILL.md / security-guidelines.md）を ZIP に含む
- 利用規約に同意するチェックなしでは ZIP ダウンロード不可
- 日英対応（URL 駆動 i18n、`/ja/` ↔ `/en/` 切替）
- hash ルーティング（GitHub Pages 対応）
- GA4 analytics 基盤（page_view / plan_select / zip_download 等 8 イベント）
- 単体テスト・コンポーネントテスト（Vitest + React Testing Library）
- E2E テスト（Playwright）
- GitHub Actions CI（unit-and-component / type-check / e2e / deploy）
- E2E テスト CI ワークフロー（.github/workflows/e2e.yml）— production build + preview server で Playwright を実行

#### 改善

- Google Fonts を非レンダーブロッキング読み込みに変更（rel="preload" as="style" onload パターン）
  - Mobile Lighthouse Performance: 62 → 100、LCP: 6.3s → 1.4s
- フォントを 3 種（Noto Sans JP + Zen Kaku Gothic New + JetBrains Mono）から 2 種に削減

#### 技術スタック

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS（cream/ink/orange トークン）
- JSZip（クライアントサイド ZIP 生成）
- Vitest + Playwright（テスト）

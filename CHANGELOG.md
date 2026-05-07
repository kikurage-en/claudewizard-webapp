# CHANGELOG

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

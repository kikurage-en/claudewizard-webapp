# コントリビューションガイド

## 概要

このリポジトリはプライベート開発リポジトリです。公開リポジトリ（`claudewizard-web-public`）との二重運用を採用しています。コミット前・同期前のセキュリティチェックを必ず実施してください。

## 開発環境のセットアップ

```bash
git clone <repository>
cd claudewizard-web
npm install

cp .env.local.example .env.local
# VITE_PROMPT_ENCRYPTION_KEY=<復号キー> を記入

npm run dev          # 開発サーバー起動（http://localhost:5173）
```

## コードスタイル

- TypeScript strict モード
- コミットメッセージは**日本語**（例: `feat: フリープラン完走E2Eテストを追加`）
- TDD 原則: テストを先に書く
- 詳細は `.claude/rules/development-workflow.md` を参照

## ブランチ戦略

- `main`: リリース済みコード
- `feature/xxx`: 機能開発
- PR 作成 → CI グリーン → レビュー → main マージ

## CI/CD パイプライン

3 ジョブ並列実行:

| ジョブ | コマンド | Secrets |
|--------|---------|---------|
| unit-and-component | `vitest run --coverage` | 不要 |
| e2e | `playwright test` | ANTHROPIC_API_KEY, POLAR_SANDBOX_TOKEN, PROMPT_ENCRYPTION_KEY |
| type-check | `tsc --noEmit` | 不要 |

フォーク PR では Secrets が不要なジョブのみ自動実行されます。

## セキュリティチェック（コミット前）

以下を必ず確認してください:

- [ ] `.env`, `.env.local` がステージングに含まれていない
- [ ] API キー・復号キーがコード内にハードコードされていない
- [ ] prompt 平文（`*.md`, `*.txt`）がコミットされていない（`.enc` のみ）
- [ ] `git secrets` または `detect-secrets` でスキャン済み

`.claude/hooks/detect-secrets.sh` が pre-commit フックとして機能します。

## 公開リポジトリへの同期

プライベート開発リポジトリから公開リポジトリへの同期手順:

### 同期前チェックリスト

- [ ] 単体・E2E テスト全件合格
- [ ] 型チェック合格
- [ ] `npm audit` でハイ以上の脆弱性なし
- [ ] prompt 平文が含まれていないことを確認
- [ ] `.env*` ファイルが含まれていないことを確認

### 手動同期（rsync スクリプト）

```bash
# scripts/sync-public.sh を使用
bash scripts/sync-public.sh
```

このスクリプトは以下を公開リポジトリにコピーします:
- `src/` — ソースコード
- `e2e/` — E2E テスト
- `public/` — 静的ファイル
- `index.html`, `package.json`, `package-lock.json`
- `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- `README.md`, `README.en.md`, `CONTRIBUTING.md`, `LICENSE`, `CHANGELOG.md`
- `.github/workflows/deploy.yml`

**除外対象**（公開リポジトリには含めない）:
- `.claude/` — 設計ドキュメント・内部ルール
- `.env*` — 環境変数
- `src/prompts/*.md`, `src/prompts/*.txt` — prompt 平文
- `*.enc` — 暗号化ファイル（ビルド済みバイナリに含まれるため）
- `coverage/`, `playwright-report/`, `node_modules/`, `dist/`

### 公開リポジトリでの確認

```bash
# 公開リポジトリ側で GitHub Pages が有効か確認
# Settings → Pages → Source: GitHub Actions

# 公開 URL で E2E を実行
BASE_URL=https://[username].github.io/claudewizard-web npm run test:e2e
```

## テスト

```bash
npm test                # 単体/コンポーネント（全件）
npm run test:watch      # watchモード
npm run test:coverage   # カバレッジレポート付き
npm run test:e2e        # E2E（開発サーバー起動が必要）
npm run typecheck       # 型チェック
npm run test:all        # CI と同等の全テスト
```

## 関連ドキュメント

- 設計思想・要件: `.claude/plans/claudewizard-web-requirements.md`
- 受け入れ基準: `.claude/spec/acceptance.md`
- セキュリティ: `.claude/rules/security-guidelines.md`
- 公開リポジトリ同期設計: `.claude/plans/public-repo-sync-design.md`

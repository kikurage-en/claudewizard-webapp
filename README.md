# claudewizard-web

Claude Code 設定ファイル生成ウィザードの Web 版。ブラウザ完結（BYOK）で Free / Light / Plus の 3 プランを提供。コンサルプランは CLI 版（claudewizard）で別納品。

## 概要

| 項目 | 内容 |
|------|------|
| 目的 | Claude Code の設定ファイル一式（CLAUDE.md, rules, hooks, SKILL.md 等）を質問への回答から自動生成・ZIP ダウンロード |
| 運営コスト | 0円（GitHub Pages + BYOK） |
| 利用コスト | Free 0円 / Light は API 従量課金 / Plus は API + ライセンス |
| 利用規約 | Anthropic BYOK モデルに適合（OAuth 非使用） |

## クイックスタート

### 開発者向け（このリポジトリで作業する場合）

```bash
git clone <repository>
cd claudewizard-web
npm install

# ローカル開発（PROMPT_ENCRYPTION_KEY を .env.local に設定）
cp .env.local.example .env.local
# .env.local に VITE_PROMPT_ENCRYPTION_KEY=xxxxx を記入

# Light/Plus プロンプトを復号（.enc → .ts）
PROMPT_ENCRYPTION_KEY=xxxxx bash scripts/decrypt-prompts.sh

npm run dev          # 開発サーバー起動
npm test             # 単体/コンポーネントテスト
npm run typecheck    # 型チェック
npm run test:e2e     # E2E（実 API 使用）
npm run build        # 本番ビルド（VITE_PROMPT_ENCRYPTION_KEY で .enc を復号→bundle）
```

> **注**: `.env.local.example` が存在しない場合は、リポジトリルートに `.env.local` を直接作成し `VITE_PROMPT_ENCRYPTION_KEY=xxxxx` の 1 行を記述してください（`.env.local` は `.gitignore` で除外されます）。

### プロンプトの暗号化（メンテナ向け）

平文の `src/prompts/light_*.ts` を編集した後、`.enc` ファイルを更新してコミットする手順:

```bash
# 1. PROMPT_ENCRYPTION_KEY を環境変数に設定（GitHub Secrets と同じ値）
export PROMPT_ENCRYPTION_KEY=xxxxx

# 2. 暗号化（light_*.ts → light_*.enc）
bash scripts/encrypt-prompts.sh

# 3. .enc ファイルのみコミット（.ts は .gitignore で除外済み）
git add src/prompts/light_ja.enc src/prompts/light_en.enc
git commit -m "chore: Light プロンプトを更新"
```

### 利用者向け（Webアプリのユーザー）

1. https://[your-username].github.io/claudewizard-web/ にアクセス
2. プラン選択（Free / Light / Plus）
3. Light/Plus は Anthropic API キーを入力（sessionStorage 保存）
4. 5〜6 問の質問に回答
5. 生成された ZIP をダウンロード

## プロジェクト構成

```
claudewizard-web/
├── CLAUDE.md                    ← Claudeへのルール・設定（100行以下）
├── README.md                    ← このファイル（日本語、主言語）
├── README.en.md                 ← 英語版
├── .wizard-log.md               ← ウィザード回答ログ
├── package.json                 ← npm 依存定義
├── vite.config.ts               ← Vite 設定
├── index.html                   ← エントリ HTML
├── .env.local.example           ← ローカル開発用テンプレート
├── .github/
│   └── workflows/deploy.yml     ← 復号→ビルド→Pagesデプロイ
├── src/
│   ├── ui/                      ← UI基盤
│   ├── wizard/                  ← 質問フロー制御（Q1-Q6）
│   ├── security/                ← BYOK・ライセンス検証
│   ├── generator/               ← ファイル生成ロジック
│   ├── templates/{ja,en}/       ← Free 用テンプレート
│   ├── locales/{ja,en}.json     ← i18n 翻訳
│   ├── i18n/                    ← Context + useTranslation hook
│   └── prompts/                 ← Light/Plus 用 prompt（暗号化）
├── e2e/                         ← Playwright E2E
└── .claude/                     ← Claude Code 設定
    ├── skills/                  ← スキル定義
    │   ├── web/SKILL.md         ← メインスキル
    │   ├── improve/SKILL.md     ← 改善提案
    │   ├── verify/SKILL.md      ← 品質検証（3段階WF）
    │   └── health-check/SKILL.md← 接続確認
    ├── rules/                   ← ルール群
    │   ├── development-workflow.md
    │   ├── security-guidelines.md
    │   ├── api-documentation.md
    │   ├── quality-checklist.md
    │   ├── ui-domain.md         ← path-scoped (src/ui/, src/wizard/)
    │   ├── generator-domain.md  ← path-scoped (src/generator/, src/templates/, src/prompts/)
    │   ├── security-domain.md   ← path-scoped (src/security/)
    │   ├── infra-domain.md      ← path-scoped (src/i18n/, src/locales/, .github/)
    │   ├── seo-domain.md        ← 章10-11対応（実装パスなし）
    │   ├── business-domain.md   ← 章3,6,13,2.4対応
    │   └── content-domain.md    ← 章7,12,15,17,20対応
    ├── references/              ← Truth Source 群
    │   ├── environment-spec.md
    │   ├── style-guide.md
    │   └── verification-guidelines.md
    ├── spec/                    ← 仕様書（Q1.5=A 仕様駆動）
    │   ├── requirements.md
    │   ├── constraints.md
    │   └── acceptance.md
    ├── agents/                  ← サブエージェント
    │   ├── spec-reviewer.md
    │   └── impl-validator.md
    ├── hooks/                   ← フックスクリプト
    │   ├── detect-secrets.sh
    │   ├── guardrail-bash-check.sh
    │   └── periodic-check.sh
    ├── state/                   ← 状態ファイル
    │   └── check-log.md
    ├── plans/                   ← 設計ドキュメント（元の生資料）
    │   ├── claudewizard-web-requirements.md       ← 元の要件定義書（1377 行）
    │   └── design_handoff_claudewizard/           ← デザイン案
    │       ├── README.md                          ← デザインガイド（22KB）
    │       └── design/                            ← UI モックアップ（17 JSX/HTML）
    └── settings.json            ← 権限・hook設定
```

## 設計ドキュメント

このプロジェクトの設計の Truth Source は以下です。実装前に必ず参照してください。

| ドキュメント | 内容 |
|------------|------|
| @.claude/plans/claudewizard-web-requirements.md | 元の要件定義書（1377 行、Truth Source） |
| @.claude/plans/design_handoff_claudewizard/README.md | デザイン案・スタイルガイド（22KB） |
| @.claude/plans/design_handoff_claudewizard/design/ | UI モックアップ（17 ファイル: 16 JSX + proposal.html） |
| @.claude/spec/requirements.md | 機能要件・非機能要件（要件定義書から抽出） |
| @.claude/spec/constraints.md | 制約条件（要件定義書から抽出） |
| @.claude/spec/acceptance.md | 受け入れ基準（要件定義書から抽出） |

`.claude/spec/` は要件定義書から実装観点で抽出した整理済み仕様、`.claude/plans/` は元の生資料（claudewizard CLI 版から複製・同梱）です。

## 主要機能（プラン別）

| プラン | 質問数 | 生成ファイル | API 呼び出し | コスト |
|-------|-------|------------|-------------|-------|
| Free | 4-5 | 4 | なし（テンプレ穴埋め） | 0 円 |
| Light | 5-6 | 5 | 1-2 回 | API 従量（数円） |
| Plus | 5-6 | 9-11 | 4 回（マルチステップ） | API + ライセンス |

詳細は @.claude/spec/requirements.md を参照。

## セキュリティ

- BYOK: API キーはブラウザ（sessionStorage）でのみ保持、サーバー送信なし
- HTTPS: 全通信（Anthropic API、Polar.sh）は HTTPS で暗号化
- prompt: Light/Plus 用は openssl aes-256-cbc で暗号化、復号キーは GitHub Secrets
- CSP: XSS 対策として CSP ヘッダー + innerHTML 不使用
- 公開リポジトリ: コードの透明性で「サーバー送信していない」ことを証明

詳細は @.claude/rules/security-guidelines.md を参照。

## 設計判断・重要事項

| 項目 | 決定 | 理由 |
|------|------|------|
| 開発スタイル | 仕様駆動（Q1.5=A） | 要件定義書が完成済み、TDD で進める |
| ホスティング | GitHub Pages | 静的サイト・0円・SSL自動 |
| 課金 | Polar.sh（旧 Lemon Squeezy 候補） | KYC 問題回避、Customer Portal API が認証不要 |
| 言語管理 | URL 駆動（/{lang}/） | ブックマーク・SNS シェアで言語保持 |
| API キー保存 | sessionStorage | タブ閉じで自動削除、リロード耐性 |
| OSS ライセンス | MIT | セキュリティ透明性が公開目的 |

## 横展開ガイド

このプロジェクトのドメイン別ルール（`*-domain.md`）は他プロジェクトでも再利用できます。

### 方法1: symlink（推奨）

```bash
ln -s /path/to/claudewizard-web/.claude/rules/seo-domain.md \
      /path/to/other-project/.claude/rules/seo-domain.md
```

### 方法2: Personal rules

```bash
cp .claude/rules/security-domain.md ~/.claude/rules/security-domain.md
```

### 方法3: Plugin

詳細: https://code.claude.com/docs/en/plugins

## テスト戦略

| レベル | ツール | 対象 |
|-------|------|------|
| 単体・コンポーネント | Vitest + RTL | i18n, generator, security, wizard, UI |
| E2E | Playwright | フリー/ライト/プラス完走、日英切替、エラー系 |
| 外部 API | E2E は実 API、単体はモック | Claude API（実 key）、Polar.sh（sandbox） |

詳細は @.claude/spec/acceptance.md と @.claude/references/verification-guidelines.md を参照。

## 段階リリース計画

```
Phase 1（MVP）: フリー実装 + GitHub Pages デプロイ
Phase 2: ライト実装（BYOK + Claude API）
Phase 3: プラス実装（Polar.sh + 暗号化 prompt + マルチステップ）
Phase 4: 日英対応（i18n）
Phase 5: コンテンツ整備（利用規約・プライバシー・FAQ）
Phase 6: マーケティング（note記事、X投稿）
Phase 7: コンサルサービス設計
```

## 参考リソース

| 種別 | リンク |
|-----|------|
| Claude API（公式） | https://platform.claude.com/docs/en/api/overview |
| Anthropic SDK | https://github.com/anthropics/anthropic-sdk-typescript |
| Polar.sh API | https://docs.polar.sh/api-reference |
| GitHub Pages | https://docs.github.com/pages |
| Vite | https://vitejs.dev/ |

## ライセンス

MIT License（OSS 公開リポジトリ）。

prompt 部分は暗号化済み（GitHub Secrets の復号キーが必要）。コードは MIT、prompt はビルド成果物として公開。

## サポート・フィードバック

- バグ報告: GitHub Issues
- 改善提案: `/improve` スキル → `claudewizard-web-feedback.md` を生成 → CLI版 claudewizard へフィードバック

詳細は @.claude/skills/improve/SKILL.md を参照。

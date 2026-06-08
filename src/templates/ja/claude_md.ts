export const template = `# {{projectName}}

{{domain}} の Claude Code 設定ファイル。Claude はこのファイルのルールに従って作業する。

## プロジェクト概要

- **分野**: {{domain}}
- **目的**: {{domain}} に関する作業を Claude Code と進めるためのプロジェクト

## Tech Stack

このプロジェクトで使う言語・フレームワーク・主要ツールを書く。
（例: TypeScript / React、Python / pandas など。実際の構成に合わせて調整する）

## Build & Test

Claude が推測できない具体的なコマンドのみ書く。

\`\`\`bash
# 例（実際のコマンドに置き換える）
npm install
npm test
npm run build
\`\`\`

## Code Style

- MUST: 問題を解決する最小限の変更にとどめる（投機的な実装をしない）
- MUST: 触る必要のある箇所だけ変更する（無関係な整形・改善をしない）
- MUST: コードを書く前に、関連する既存コード・呼び出し元・共有処理を読む
- MUST: テストは「なぜその挙動が重要か」を検証する（挙動の丸写しにしない）
- MUST: 既存コードベースの規約に合わせる
- MUST NOT: スキップした作業を「完了」と報告しない

## Architecture

主要ディレクトリの役割を 4〜5 行で書く。
（例: src/ アプリ本体 / tests/ テスト / docs/ ドキュメント。実際の構成に合わせて調整する）

## Security

- MUST NOT: .env・認証情報・API キーをコミットしない
- MUST NOT: eval() や動的なコマンド構築をしない
- MUST: 外部入力はバリデーションしてから使用する
- MUST: 危険操作（rm -rf, force push, sudo 等）は実行前に意味・影響・代替案を説明する

詳細は @.claude/rules/security-guidelines.md を参照。

## Important Rules

- 構築 → テスト → デプロイ → 運用 の順に進める
- 迷ったときは推測で埋めず、確認する
- ドキュメントを最新の状態に保つ

## Skills

利用可能なスキルは @.claude/skills/main/SKILL.md を参照。
`

export default template

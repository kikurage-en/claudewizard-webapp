export const template = `# {{projectName}}

Claude Code の動作設定ファイル。このファイルに記述したルールと指示に従って作業を行う。

## プロジェクト概要

- **分野**: {{domain}}
- **主な作業**: {{workType}}
- **使用ツール**: {{tool}}
- **主な目標**: {{goal}}

## ツール / 環境

{{tool}} を使用した {{domain}} プロジェクト。

## Build & Test

プロジェクトのビルド・テスト手順をここに記載する。

\`\`\`bash
# 例
npm run dev    # 開発サーバー起動
npm test       # テスト実行
npm run build  # ビルド
\`\`\`

## Code Style

- MUST: 変更前に確認を取る（設計判断は勝手に変更しない）
- MUST: コードの品質を最優先にする
- MUST: テストを書く（TDD 推奨）
- MUST NOT: 未テストのコードをコミットしない

## Architecture

プロジェクトのアーキテクチャをここに記載する。

## Important Rules

- **{{workType}}** を主な作業として、{{goal}} を達成することが目標
- コードレビューを行い、品質を維持する
- ドキュメントを最新の状態に保つ

## Safety Skills

詳細は \`.claude/skills/main/SKILL.md\` を参照。

## Agents

| エージェント | 説明 |
|-------------|------|
| spec-reviewer | 仕様レビューと整合性チェック |
`

export default template

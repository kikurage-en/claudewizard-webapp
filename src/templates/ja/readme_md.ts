export const template = `# {{projectName}}

{{domain}} のプロジェクト。Claude Code の設定ファイル一式を含む。

## 概要

{{projectName}} は {{domain}} を目的とするプロジェクトです。
Claude Code（claude.com/code）と組み合わせて開発・運用することを想定しています。

## セットアップ

\`\`\`bash
# 取得（例。実際の URL に置き換える）
git clone https://github.com/your-account/{{projectName}}.git
cd {{projectName}}

# 依存関係のインストール・起動（実際のコマンドに置き換える）
npm install
npm run dev
\`\`\`

## Claude Code 設定ファイル

このプロジェクトには以下の Claude Code 設定が含まれます:

| ファイル | 役割 |
|---------|------|
| \`CLAUDE.md\` | Claude Code の動作ルール・プロジェクト設定 |
| \`.claude/skills/main/SKILL.md\` | 利用可能なスキル一覧 |
| \`.claude/rules/security-guidelines.md\` | セキュリティガイドライン |

## ライセンス

MIT
`

export default template

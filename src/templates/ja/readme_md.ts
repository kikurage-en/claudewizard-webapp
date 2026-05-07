export const template = `# {{projectName}}

{{domain}} プロジェクト。

## 概要

このプロジェクトは {{tool}} を使用した {{domain}} プロジェクトです。
主な作業内容は **{{workType}}** で、目標は **{{goal}}** です。

## セットアップ

\`\`\`bash
# リポジトリをクローン
git clone <repository-url>
cd {{projectName}}

# 依存関係をインストール
npm install  # または適切なパッケージマネージャを使用

# 開発サーバーを起動
npm run dev
\`\`\`

## Claude Code との連携

このプロジェクトは Claude Code の設定ファイルを含みます:

- \`CLAUDE.md\` - Claude Code の動作設定
- \`.claude/skills/main/SKILL.md\` - 利用可能なスキル一覧
- \`.claude/rules/security-guidelines.md\` - セキュリティガイドライン

## ライセンス

MIT
`

export default template

export const template = `# {{projectName}}

{{domain}} のプロジェクト。Claude Code の設定ファイル一式を含む。

## 概要

{{projectName}} は {{domain}} を目的とするプロジェクトです。
Claude Code（claude.com/code）と組み合わせて開発・運用することを想定しています。

## セットアップ

1. このリポジトリ（または生成された設定ファイル一式）を取得する。
2. \`CLAUDE.md\` と \`.claude/\` をプロジェクトの直下に配置する。
3. Claude Code（claude.com/code）でプロジェクトを開く。CLAUDE.md のルールに従って作業が始まる。

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

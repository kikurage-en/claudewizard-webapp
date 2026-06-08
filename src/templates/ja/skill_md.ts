export const template = `---
name: main
description: |
  {{projectName}} のメインスキル。{{domain}} の作業を Claude Code で進めるための基本フロー。

  [起動条件] /main、「{{domain}} の作業を始める」等
---

# {{projectName}} メインスキル

{{domain}} のプロジェクトで Claude Code を使うための基本スキル。

## 概要

- **分野**: {{domain}}
- **目的**: {{domain}} に関する作業を効率的に進める

## 主要機能

このプロジェクトで使える基本的な補助コマンド:

### /verify — 実装・成果物の検証
作成したものをレビューし、品質・整合性を確認する。

### /improve — 改善提案
現状を分析し、優先度付きで改善案を提示する。

### /review — レビュー
変更差分を確認し、品質・セキュリティ観点でコメントする。

## 実行フロー

1. 作業内容を明確にする（目的・制約・完了条件）
2. 最小の変更で実装する
3. /verify で検証し、必要なら /improve で改善する

## 設定ファイル

| ファイル | 役割 |
|---------|------|
| \`CLAUDE.md\` | 動作ルール・プロジェクト設定 |
| \`.claude/rules/security-guidelines.md\` | セキュリティガイドライン |
`

export default template

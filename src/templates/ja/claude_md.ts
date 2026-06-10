export const template = `# {{projectName}}

{{domain}} の Claude Code 設定ファイル。Claude はこのファイルのルールに従って作業する。

## プロジェクト概要

- **分野**: {{domain}}
- **目的**: {{domain}} に関する作業を Claude Code と進めるためのプロジェクト

## Tech Stack

{{techStack}}

## Build & Test

{{buildCommands}}

## {{workRulesHeading}}

{{workRules}}

## Architecture

{{architecture}}

## Security

- MUST NOT: .env・認証情報・API キーをコミットしない
- MUST NOT: eval() や動的なコマンド構築をしない
- MUST: 外部入力はバリデーションしてから使用する
- MUST: 危険操作（rm -rf, force push, sudo 等）は実行前に意味・影響・代替案を説明する

詳細は @.claude/rules/security-guidelines.md を参照。

## Important Rules

- {{lifecycleRule}}
- 迷ったときは推測で埋めず、確認する
- ドキュメントを最新の状態に保つ
- 判断の基本原則（Evidence First 等）は @.claude/rules/core-principles.md を参照

## Skills

利用可能なスキルは @.claude/skills/main/SKILL.md を参照。
`

export default template

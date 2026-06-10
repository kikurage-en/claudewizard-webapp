export const template = `# {{projectName}}

Claude Code configuration for this {{domain}} project. Claude follows the rules in this file.

## Overview

- **Domain**: {{domain}}
- **Purpose**: A project for working on {{domain}} tasks with Claude Code

## Tech Stack

{{techStack}}

## Build & Test

{{buildCommands}}

## {{workRulesHeading}}

{{workRules}}

## Architecture

{{architecture}}

## Security

- MUST NOT: Commit .env, credentials, or API keys
- MUST NOT: Use eval() or dynamic command construction
- MUST: Validate external input before use
- MUST: Explain meaning, impact, and alternatives before destructive ops (rm -rf, force push, sudo)

See @.claude/rules/security-guidelines.md for details.

## Important Rules

- {{lifecycleRule}}
- When unsure, ask instead of guessing
- Keep documentation up to date
- See @.claude/rules/core-principles.md for the core decision principles

## Skills

See @.claude/skills/main/SKILL.md for available skills.
`

export default template

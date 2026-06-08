export const template = `# {{projectName}}

Claude Code configuration for this {{domain}} project. Claude follows the rules in this file.

## Overview

- **Domain**: {{domain}}
- **Purpose**: A project for working on {{domain}} tasks with Claude Code

## Tech Stack

{{techStack}}

## Build & Test

{{buildCommands}}

## Code Style

- MUST: Make the minimum change that solves the problem (nothing speculative)
- MUST: Touch only what you must (no unrelated reformatting or "improvements")
- MUST: Read related existing code, callers, and shared utilities before writing
- MUST: Tests verify WHY the behavior matters (not just WHAT it does)
- MUST: Match the existing codebase conventions
- MUST NOT: Report skipped work as "completed"

## Architecture

{{architecture}}

## Security

- MUST NOT: Commit .env, credentials, or API keys
- MUST NOT: Use eval() or dynamic command construction
- MUST: Validate external input before use
- MUST: Explain meaning, impact, and alternatives before destructive ops (rm -rf, force push, sudo)

See @.claude/rules/security-guidelines.md for details.

## Important Rules

- Proceed in order: build -> test -> deploy -> operate
- When unsure, ask instead of guessing
- Keep documentation up to date

## Skills

See @.claude/skills/main/SKILL.md for available skills.
`

export default template

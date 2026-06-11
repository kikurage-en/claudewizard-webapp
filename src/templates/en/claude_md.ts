export const template = `# {{projectName}}

Claude Code configuration for this {{domain}} project.

## Tech Stack

{{techStack}}

## Working Rules

{{workRules}}{{domainWorkRules}}
- MUST: When unsure, ask instead of guessing

See @.claude/rules/core-principles.md for the core decision principles (Evidence First, etc.).

## Security

- MUST NOT: Commit .env, credentials, or API keys
- MUST NOT: Use eval() or dynamic command construction
- MUST: Validate external input before use
- MUST: Explain meaning, impact, and alternatives before destructive ops (rm -rf, force push, sudo)

See @.claude/rules/security-guidelines.md for details.

## Skills

See @.claude/skills/main/SKILL.md for available skills.
{{initGuidanceComment}}`

export default template

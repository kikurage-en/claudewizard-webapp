export const template = `# {{projectName}}

A {{domain}} project. Includes a set of Claude Code configuration files.

## Overview

{{projectName}} is a project for {{domain}}.
It is intended to be developed and operated together with Claude Code (claude.com/code).

## Setup

1. Get this repository (or the generated set of configuration files).
2. Place \`CLAUDE.md\` and \`.claude/\` at the root of your project.
3. Open the project with Claude Code (claude.com/code). Claude will follow the rules in CLAUDE.md.

## Claude Code Configuration Files

This project includes the following Claude Code configuration:

| File | Role |
|------|------|
| \`CLAUDE.md\` | Claude Code behavior rules and project settings |
| \`.claude/skills/main/SKILL.md\` | Available skills |
| \`.claude/rules/security-guidelines.md\` | Security guidelines |

## License

MIT
`

export default template

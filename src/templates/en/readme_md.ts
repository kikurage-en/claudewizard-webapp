export const template = `# {{projectName}}

A {{domain}} project. Includes a set of Claude Code configuration files.

## Overview

A project for {{domain}} work with Claude Code.
CLAUDE.md and the rules/skills under .claude/ define how Claude behaves here.

## Tech Stack

{{techStack}}

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
| \`.claude/rules/core-principles.md\` | Core decision principles (Evidence First, etc.) |

{{initGuidanceSection}}## License

MIT
`

export default template

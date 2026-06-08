export const template = `# {{projectName}}

A {{domain}} project. Includes a set of Claude Code configuration files.

## Overview

{{projectName}} is a project for {{domain}}.
It is intended to be developed and operated together with Claude Code (claude.com/code).

## Setup

\`\`\`bash
# Clone (example — replace with your real URL)
git clone https://github.com/your-account/{{projectName}}.git
cd {{projectName}}

# Install dependencies and start (replace with your real commands)
npm install
npm run dev
\`\`\`

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

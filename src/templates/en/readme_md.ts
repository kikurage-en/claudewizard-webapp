export const template = `# {{projectName}}

{{domain}} project.

## Overview

This project is a {{domain}} project using {{tool}}.
The primary work is **{{workType}}** with the goal of **{{goal}}**.

## Setup

\`\`\`bash
# Clone repository
git clone <repository-url>
cd {{projectName}}

# Install dependencies
npm install  # or use appropriate package manager

# Start dev server
npm run dev
\`\`\`

## Claude Code Integration

This project includes Claude Code configuration files:

- \`CLAUDE.md\` - Claude Code behavior settings
- \`.claude/skills/main/SKILL.md\` - Available skills
- \`.claude/rules/security-guidelines.md\` - Security guidelines

## License

MIT
`

export default template

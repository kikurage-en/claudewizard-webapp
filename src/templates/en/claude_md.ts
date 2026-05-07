export const template = `# {{projectName}}

Claude Code configuration file. Work according to the rules and instructions described in this file.

## Project Overview

- **Domain**: {{domain}}
- **Main Work**: {{workType}}
- **Main Tool**: {{tool}}
- **Primary Goal**: {{goal}}

## Main Tool / Environment

{{domain}} project using {{tool}}.

## Build & Test

Describe build and test procedures here.

\`\`\`bash
# Example
npm run dev    # Start dev server
npm test       # Run tests
npm run build  # Build
\`\`\`

## Code Style

- MUST: Confirm before making changes (do not change design decisions unilaterally)
- MUST: Prioritize code quality
- MUST: Write tests (TDD recommended)
- MUST NOT: Commit untested code

## Architecture

Describe project architecture here.

## Important Rules

- Primary focus is **{{workType}}** with the goal of **{{goal}}**
- Conduct code reviews to maintain quality
- Keep documentation up to date

## Safety Skills

See \`.claude/skills/main/SKILL.md\` for details.

## Agents

| Agent | Description |
|-------|-------------|
| spec-reviewer | Spec review and consistency check |
`

export default template

export const template = `---
name: main
description: |
  Main skill for {{projectName}}. Basic flow for working on {{domain}} tasks with Claude Code.

  [Trigger] /main, "start working on {{domain}}"{{skillTriggers}}
---

# {{projectName}} Main Skill

The basic skill for using Claude Code on this {{domain}} project.

## Overview

- **Domain**: {{domain}}
- **Purpose**: Work efficiently on {{domain}} tasks

## Main Features

Basic helper commands available in this project:

### /verify — Verify implementations and deliverables
Review what was produced and check quality and consistency.{{verifyFocus}}

### /improve — Improvement suggestions
Analyze the current state and present prioritized improvements.

### /review — Review
{{reviewDescription}}

## Workflow

1. Clarify the task (goal, constraints, definition of done)
2. Implement with the minimum change
3. Verify with /verify, and refine with /improve if needed

{{skillGotchas}}## Configuration Files

| File | Role |
|------|------|
| \`CLAUDE.md\` | Behavior rules and project settings |
| \`.claude/rules/security-guidelines.md\` | Security guidelines |
| \`.claude/rules/core-principles.md\` | Core decision principles (Evidence First, etc.) |
`

export default template

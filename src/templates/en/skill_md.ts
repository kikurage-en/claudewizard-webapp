export const template = `# {{projectName}} Skills

This file lists the skills available for Claude Code.

## /verify - Implementation Verification

Verifies generated implementations.

### Usage

\`\`\`
/verify
\`\`\`

### Process

1. Code review
2. Test verification
3. Spec consistency check
4. Quality standards check

## /improve - Improvement Suggestions

Provides improvement suggestions for code and design.

### Usage

\`\`\`
/improve [target file or component]
\`\`\`

### Process

1. Analyze current implementation
2. Identify improvement points
3. Present concrete improvement proposals
4. Prioritized suggestions

## /review - Code Review

Performs code review on changes.

### Usage

\`\`\`
/review
\`\`\`

### Process

1. Check diff changes
2. Code quality check
3. Security verification
4. Generate review comments
`

export default template

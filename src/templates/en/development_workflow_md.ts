export const template = `# Development Workflow

Development workflow guidelines for the {{projectName}} project.

## Work Process

### 1. Before Starting a Task

- Clarify the purpose and scope
- Confirm the scope of impact
- Understand dependencies and constraints

### 2. During Implementation

- Commit in small units
- {{implementWhileRule}}
- Verify existing behavior before making changes

### 3. Before Completion

- {{completionCheckRule}}
- {{reviewChecklistRule}}
- Update documentation

## Commit Convention

\`\`\`
feat:     Add new feature
fix:      Fix a bug
refactor: Refactor code
docs:     Update documentation
test:     Add or update tests
chore:    Build and tooling changes
\`\`\`

Example: \`feat: add user authentication\`

## Review Criteria

- {{reviewCriteriaFirst}}
- Are edge cases considered?
- Is there any performance impact?
- Are there any security concerns?

## Notes When Using {{tool}}

- Follow best practices specific to {{tool}}
- Verify version compatibility
- Avoid deprecated APIs and features

## Troubleshooting

When a problem occurs:
1. Check error messages carefully
2. Identify reproduction steps
3. Review known issues and FAQ
4. Consult with team members
`

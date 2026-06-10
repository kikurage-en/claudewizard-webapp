export const template = `# Security Guidelines

Security guidelines for the {{projectName}} project.

## Core Principles

### MUST NOT

- Hardcode sensitive information (API keys, passwords, tokens, etc.) in code
- Commit sensitive information to version control
{{securityMustNotExtra}}

### MUST

- Manage sensitive information using environment variables or secret management tools
{{securityMustExtra}}
- Use HTTPS to encrypt communications

## Authentication & Authorization

- Store credentials securely (hashing, etc.)
- Apply the principle of least privilege
- Manage sessions appropriately
- Recommend multi-factor authentication

{{securityDomainSections}}

## Dangerous Operations Require Pre-confirmation

Before performing the following operations, explain the meaning, impact, and alternatives:

- File deletion (destructive operations)
- Git history changes (force push, rebase, etc.)
- Destructive database operations
- Permission changes

## Incident Response

1. Report security issues immediately upon discovery
2. Identify scope of impact and implement temporary mitigation
3. Identify root cause and apply permanent fix
4. Consider measures to prevent recurrence
`

export default template

export const template = `# Core Principles (Evidence First / Boundary Check / Failure Reflection)

For the {{projectName}} project, base implementation, change, and review decisions on first-hand evidence shown before acting — not on an abstract "checked".

## Three Principles

### 1. Evidence First

Do not judge external APIs / SDKs / protocols / specs from official doc examples alone; verify the raw response, missing fields, error responses, and the meaning of each field against the real system.

- **Criterion**: present the supporting evidence (file path + line number, or command + stdout) in the same turn as the decision
- **Triggers**: when using "official", "recommended", "spec", "best practice", "at most", "within"

### 2. Boundary Check

When changing numbers, settings, or thresholds, check combination boundaries rather than a single value.

- **Criterion**: enumerate the 0 / max / min / 1 / repeated / unstoppable cases in a table or formula
- **Triggers**: when changing a number, setting, threshold, upper bound, or lower bound

### 3. Failure Reflection

Do not let anomaly detection end at a notification. Confirm that downstream processing stops, state is cleared, or it is reconciled. For deploys, verify the running artifact reflects the change, not just a successful build.

- **Criterion**: {{failureReflectionCriteria}}
- **Triggers**: when implementing error handling, alerts, deploys, or retries

## Operational Clauses (meta-rules for applying the three principles)

- **Cite sources**: when using "official", "recommended", or "spec", include a URL or file path + line number
- **Self-application**: apply the three principles to the work of introducing or updating this rule itself
- **No vague deferral**: classify each detected concern as "needs fix / no action / on hold (approved)"
- **WHY/HOW separation**: reference the Truth Source (implementation files) for numbers, thresholds, and paths instead of copying them into docs
- **Curb optimistic claims**: when asserting "isolated", "incidental", "unnecessary", or "no problem", include quantitative grounds

## Review Criterion

Do not approve a decision that lacks shown evidence. Use these principles as the review criterion.
`

export default template

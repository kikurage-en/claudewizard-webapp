export const template = `# Failure Routing — Where Prevention Measures Belong

A rule for {{projectName}} that routes prevention measures for failures and review findings to the smallest effective place, before they pile up in CLAUDE.md and bloat the always-on context.

## Triggers

- When deciding prevention measures from a failure, review finding, or incident
- When considering a new addition to CLAUDE.md / rules
- When about to say "we'll be careful next time" or "let's make it a rule"

## Requirements

Route each measure to the smallest effective place by failure type first.

| Failure type | First place to put it |
| --- | --- |
| Misreading an external spec / API | Tests / verification scripts |
| Wrong numbers or thresholds | Validation / tests |
| Missed rollout or skipped step | Checklists / scripted steps |
| Documentation drift | Consistency checks / a single source of truth |
| Leaked secrets | Permissions / automated scanning |

Steps:

1. Classify the failure type
2. First decide whether tests, scripts, or checklists can prevent it
3. Prefer a place that prevents it without entering the always-on context (CLAUDE.md / rules)
4. State where it went and why it was not promoted to an always-on rule

## Promotion Criteria

Add to CLAUDE.md / rules only when the same type of failure keeps recurring, cannot be prevented mechanically, or has severe impact. Even then, record only the abstracted decision criterion, not the incident details.

## Self-Application

When adding new failure knowledge, classify it with this file before choosing where it goes.
`

export default template

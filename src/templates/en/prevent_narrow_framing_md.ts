export const template = `# Prevent Narrow Framing

A rule for {{projectName}} that keeps Claude from building proposals, investigations, or designs inside the first framing that comes to mind.

## Triggers

When a task involves any of the following (interpret broadly):

- Proposals: "suggest", "what should we do", "come up with a plan"
- Verification: "verify", "review", "check whether this is correct"
- Investigation: "investigate", "analyze", "assess the current state"
- Optimization: "optimize", "improve", "reduce cost", "speed up"
- Design decisions: changing settings, changing structure, selecting tools

Does not fire for: simple typo fixes, an explicitly specified single-file edit, or plain execution of an already-decided action.

## Requirements

1. Enumerate the option space (axes, perspectives, alternatives) before concluding — state it as "axes considered: A, B, C"
2. Do not treat the current state as fixed (existing settings and current practices are also candidates for re-evaluation)
3. Name the axes you will not address, with a one-line reason each (no silent exclusion)
4. When delegating work, do not hand over a pre-narrowed scope — ask the delegate to enumerate axes independently
5. Before planning how to do the task, ask once whether the task's premise itself holds against the goal

## Self-Application

Apply this rule to the work of introducing or updating the rule itself.
`

export default template

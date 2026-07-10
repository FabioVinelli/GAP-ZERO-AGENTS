---
name: gapzero-doctrine
description: GAP/ZERO L0-L5 doctrine for GAP/ZERO Trading Agent v2.0. Load before any task in this project.
---

# GAP/ZERO doctrine — operating rules
- Actuation boundary: ONLY the 4 registered tools (see sibling skills). Unknown mechanism = GAP = stop.
- Terminal contract: executed action (landing-checked) | validated handoff | explicit block. Never a bare report.
- Policy: Live order (any size) → escalate · Position size >2% capital per trade → escalate · Paper trade or backtest → allow · Ladder skip detected (backtest or paper missing) → block. Irreversible always escalates.
- Generator ≠ evaluator: never grade your own run; hand off to the Evaluator (gapzero-evaluator skill).
- Stop conditions: task-complete · clarification-needed · validation-required · policy-blocked · budget-exhausted.

## Certification gates (from blueprint)
✓ G1 Outcome contract + owner
✓ G2 Maturity classified
✓ G3 Pipeline fully typed/wired
✓ G4 Write tools mechanism+check+reversibility
✓ G5 Policy engine logs every write
✓ G6 Terminal node action/handoff/block
✓ G7 <=1 human validation no middleware
✓ G8 Owner+detection+rollback named
✓ G9 Trace covers actuation+policy+validator
✓ G10 Separate evaluator hard thresholds
✓ G11 KPI standard friction<=1
✓ G12 PoC sprint+kill+scale+review

## Anti-patterns to refuse
- (none detected at export; stay alert for: report factory, human middleware, rubber stamp, assumed wiring, self-grading generator)

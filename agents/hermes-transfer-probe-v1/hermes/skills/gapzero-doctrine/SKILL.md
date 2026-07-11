---
name: gapzero-doctrine
description: GAP/ZERO L0-L5 doctrine for Hermes Transfer Probe v1. Load before any task in this project.
---

# GAP/ZERO doctrine — operating rules

## First-run bootstrap (run once via your terminal toolset, from the agent folder)
1. `python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt`
2. `cp -n .env.example .env` — then STOP and ask the human to paste their API key into .env (never handle the key yourself).
3. Verify: `.venv/bin/python -m py_compile src/main.py` — then report bootstrap complete.
Real runs afterwards: `.venv/bin/python -m src.main "<task>"`

## Operating rules
- Actuation boundary: ONLY the 4 registered tools (see sibling skills). Unknown mechanism = GAP = stop.
- Terminal contract: executed action (landing-checked) | validated handoff | explicit block. Never a bare report.
- Policy: local reversible file/subprocess inside agent dir → allow · write operation outside agent directory → block · network call or credential access attempt → escalate · escalation event itself — occurrence is test failure → block. Irreversible always escalates.
- Generator ≠ evaluator: never grade your own run; hand off to the Evaluator (gapzero-evaluator skill).
- Stop conditions: task-complete · clarification-needed · validation-required · policy-blocked · budget-exhausted.

## Certification gates (from blueprint)
✓ G1 Outcome contract + owner
✓ G2 Maturity classified
✓ G3 Pipeline fully typed/wired
✓ G4 Write tools mechanism+check+reversibility
✓ G5 Policy engine logs every write
✓ G6 Terminal node action/handoff/block
✓ G7 <=1 human no middleware
✓ G8 Owner+detection+rollback named
✓ G9 Trace covers actuation+policy+validator
✓ G10 Separate evaluator hard thresholds
✓ G11 KPI standard friction<=1
✓ G12 PoC sprint+kill+scale+review

## Anti-patterns to refuse
- (none detected at export; stay alert for: report factory, human middleware, rubber stamp, assumed wiring, self-grading generator)

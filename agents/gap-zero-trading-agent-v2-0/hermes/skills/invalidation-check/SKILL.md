---
name: invalidation-check
description: Invalidation Check via Rules engine evaluates post-trade metrics against pre-declared invalidation conditions. Landing check: Pass/fail record written to audit log; escalation paged if fail. reversible.
---

# Invalidation Check
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: Rules engine evaluates post-trade metrics against pre-declared invalidation conditions
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- Pass/fail record written to audit log; escalation paged if fail
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

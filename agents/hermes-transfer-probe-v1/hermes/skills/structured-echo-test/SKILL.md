---
name: structured-echo-test
description: Structured echo test via file op — serialize known JSON payload; pass to tool; receive return; assert byte-identical + schema validation. Landing check: returned payload compared byte-for-byte; schema validator result logged; any deviation = failure. reversible.
---

# Structured echo test
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: file op — serialize known JSON payload; pass to tool; receive return; assert byte-identical + schema validation
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- returned payload compared byte-for-byte; schema validator result logged; any deviation = failure
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

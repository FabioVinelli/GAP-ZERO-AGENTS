---
name: paper-trade-order
description: Paper Trade Order via REST API call to paper endpoint with order payload. Landing check: Fill confirmation returned with order ID; logged to audit trail. reversible.
---

# Paper Trade Order
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: REST API call to paper endpoint with order payload
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- Fill confirmation returned with order ID; logged to audit trail
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

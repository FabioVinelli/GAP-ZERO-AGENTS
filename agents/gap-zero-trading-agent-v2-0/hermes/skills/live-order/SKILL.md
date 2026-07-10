---
name: live-order
description: Live Order via REST API call to live endpoint; position sizing verified pre-call. Landing check: Fill confirmation + position reconciled against intended size within 1 cycle. irreversible.
---

# Live Order
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: REST API call to live endpoint; position sizing verified pre-call
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- Fill confirmation + position reconciled against intended size within 1 cycle
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- irreversible. ALWAYS escalate to the human touchpoint BEFORE execution. A self-issued or assumed approval token is a policy violation — the harness will veto it.

---
name: shell-execution-test
description: Shell execution test via orchestrator subprocess call — run benign command echo HERMES_OK; capture exit code and stdout. Landing check: exit code == 0 AND stdout contains HERMES_OK marker; both values written to trace entry. reversible.
---

# Shell execution test
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: orchestrator subprocess call — run benign command echo HERMES_OK; capture exit code and stdout
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- exit code == 0 AND stdout contains HERMES_OK marker; both values written to trace entry
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

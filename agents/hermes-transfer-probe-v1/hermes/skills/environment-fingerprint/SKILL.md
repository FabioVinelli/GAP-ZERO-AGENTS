---
name: environment-fingerprint
description: Environment fingerprint via file op — write fingerprint.json to agent dir; read back and assert byte-identical hostname+python_version+model_id. Landing check: fingerprint.json present, parsed, all fields match expected values; failure halts cycle. reversible.
---

# Environment fingerprint
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: file op — write fingerprint.json to agent dir; read back and assert byte-identical hostname+python_version+model_id
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- fingerprint.json present, parsed, all fields match expected values; failure halts cycle
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

---
name: file-round-trip-test
description: File round-trip test via file op — write test file with known content; read back; compute SHA-256 hash of both; assert match. Landing check: hash match logged to JSONL trace with timestamp; mismatch = immediate block. reversible.
---

# File round-trip test
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: file op — write test file with known content; read back; compute SHA-256 hash of both; assert match
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- hash match logged to JSONL trace with timestamp; mismatch = immediate block
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

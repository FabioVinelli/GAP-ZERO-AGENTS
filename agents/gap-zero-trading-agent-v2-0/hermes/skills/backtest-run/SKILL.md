---
name: backtest-run
description: Backtest Run via File op / orchestrator writes parameterized config; backtest engine executes. Landing check: Trade log written with full parameter set, strategy ID, timestamp, P&L summary. reversible.
---

# Backtest Run
Implementation status: STUB — the matching entry in src/tools.py is a TODO until wired.
Any run before wiring is a SIMULATION and must be labeled "SIMULATED — NOT LANDED".

## Procedure
1. Mechanism: File op / orchestrator writes parameterized config; backtest engine executes
2. Real actuation ONLY through the Python harness: `python -m src.main "<task>"` — never re-implement the mechanism conversationally.

## Verification — deterministic landing check
- Trade log written with full parameter set, strategy ID, timestamp, P&L summary
- No landing evidence = the action did NOT happen. Report failure; never report success on eloquence.

## Reversibility & escalation
- reversible. Rollback per mechanism class (see .hermes.md).

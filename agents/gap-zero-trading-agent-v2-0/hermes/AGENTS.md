# Agent roster — GAP/ZERO Trading Agent v2.0

# Worker
Executes the pipeline for outcome "% validated strategies reaching profitable paper P&L within risk limits". Uses the
wiring skills under hermes/skills/. Real actuation goes through the Python harness only.
Never grades its own work.

# Evaluator
Skeptical QA agent. Uses the gapzero-evaluator skill: runs the harness, reads the JSONL
trace, applies the 5 hard criteria. Separate from the Worker —
generator ≠ evaluator is structural, not stylistic. did_it_act is deterministic from the
trace: no landed action → FAIL, regardless of how good the prose is.

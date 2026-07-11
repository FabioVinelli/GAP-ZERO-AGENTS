# Closed-loop PoC — Hermes Transfer Probe v1
- Scope: One verification cycle per backend (Ollama qwen2.5-coder:7b + Anthropic cloud), MacBook Air M4 only, starting cycle 1
- Sprint contract: 2 complete cycles (one per backend) with full JSONL trace produced and Ko-reviewed before any other agent transferred to Hermes Desktop
- Duration: 1 week or 10 cycles whichever is earlier
- Success metric: 100% of 4 checks landed with evidence on at least one backend within sprint window
- KILL criteria (pre-committed): Local Ollama fails to produce a single valid tool call in 5 consecutive cycles OR trace file corrupted/unparseable on 2 separate cycles
- Scale criteria: 100% checks landed on both backends AND zero policy violations across all sprint cycles
- Review trigger: After 10 cycles OR first policy escalation whichever is earlier — Ko mandatory gate review before cycle 11 or any further agent transfer

## Cycle log (accountability ledger — evidence, not prose)

### Cycle 1 — 2026-07-11, Anthropic cloud backend — PASS
- Host: Mac.lan (MacBook Air M4) · model_id: claude-sonnet-4-6 · python 3.14.0
- Trace: `traces/run-e378200c2808.jsonl` — 4/4 actuations `landed: true`, 4/4 policy decisions `allow`, evaluator `verdict: PASS`, `did_it_act: true`
- Verified against source: artifact contents, trace event shapes, and evaluator criteria wording all cross-checked against the shipped harness code (loop.py, policy.py, evaluator.py) and blueprint.json — not accepted on prose alone. Full audit: Google Antigravity (Gemini) fact-check, `final_accuracy_report_probe_v1.pdf`.
- Open item: report claimed "13 JSON objects" but table lists 12 — recheck `wc -l` on the raw trace to reconcile before closing the sprint.
- **1 of 2 sprint cycles complete.** Remaining: one cycle on the second declared backend (Ollama qwen2.5-coder:7b, local) before any other agent is promoted for transfer.

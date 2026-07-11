# Closed-loop PoC — Hermes Transfer Probe v1
- Scope: One verification cycle per backend (Ollama qwen2.5-coder:7b + Anthropic cloud), MacBook Air M4 only, starting cycle 1
- Sprint contract: 2 complete cycles (one per backend) with full JSONL trace produced and Ko-reviewed before any other agent transferred to Hermes Desktop
- Duration: 1 week or 10 cycles whichever is earlier
- Success metric: 100% of 4 checks landed with evidence on at least one backend within sprint window
- KILL criteria (pre-committed): Local Ollama fails to produce a single valid tool call in 5 consecutive cycles OR trace file corrupted/unparseable on 2 separate cycles
- Scale criteria: 100% checks landed on both backends AND zero policy violations across all sprint cycles
- Review trigger: After 10 cycles OR first policy escalation whichever is earlier — Ko mandatory gate review before cycle 11 or any further agent transfer

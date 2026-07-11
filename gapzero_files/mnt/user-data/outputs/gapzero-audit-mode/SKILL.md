---
name: gapzero-audit-mode
description: Audit existing AI agents, pilots, automations, or agentic frameworks for action gaps and produce a remediated blueprint. Use this skill whenever the user provides or references an existing agent, bot, pilot, POC, workflow, framework, or spec and wants it evaluated, reviewed, scored, fixed, improved, de-risked, or asks why it isn't delivering ROI — even phrased casually ("is this agent any good", "why is our pilot stuck", "review my agent setup"). Scores friction, time-to-action, trust, and decision quality; lists gaps by severity with remediations; issues a binary APPROVE/DEFER/REJECT verdict.
---

# GAP/ZERO Audit Mode

Measure the distance between what an existing agent knows and what it actually causes to happen. Locate every point where an insight dies in a report, a queue, or a human acting as middleware — then prescribe the fix. The deliverable is a **gap ledger + remediated blueprint**, never a commentary.

## Audit rubric (score each 0–25, sum = Action Gap Score /100)

1. **Friction (0–25).** Count unintegrated systems and humans required per insight-to-action path. 0 handoffs = 25. Each manual system hop or human relay subtracts.
2. **Time-to-action (0–25).** Elapsed time between the agent's insight and the executed remediation. Automated same-cycle execution = 25; insights parked in dashboards or weekly reviews score near 0.
3. **Trust / unmodified acceptance (0–25).** Is the % of recommendations executed without modification measured, and is it high for the right reason? Unmeasured = max 10. Note: near-100% acceptance with no sampling review is a rubber-stamping risk, not trust — cap at 18 and flag.
4. **Decision quality & governance (0–25).** KPIs measure decision quality (not volume); accountability for wrong actions is named; error detection and rollback exist; a kill/scale criterion exists. Missing accountability caps this dimension at 8.

## Workflow

1. **Reconstruct the pipeline.** From the provided spec, map 5–7 insight→action nodes (`insight` | `system` | `human` | `action`), marking each WIRED or GAP. Never assume an integration exists if the spec doesn't state its mechanism.
2. **Score the four rubric dimensions.** Cite the specific evidence (or absence) driving each score.
3. **Ledger the gaps.** Max 5, each with severity and remediation:
   - `critical` — insight cannot reach action without manual work; no accountability for autonomous errors; output is a report/dashboard only.
   - `major` — human used as middleware mid-pipeline; volume-only KPIs; pilot with no kill criteria; unmeasured acceptance rate.
   - `minor` — missing review trigger; observability thin; KPI targets undefined.
4. **Detect anti-patterns explicitly** and name them if present: *POC purgatory* (pilot with no success/kill metric), *report factory* (terminal output is passive information), *human middleware* (person bridging systems the agent should touch), *rubber stamp* (unexamined 100% acceptance), *volume theater* (KPIs count motion, not judgment).
5. **Remediate.** Emit the corrected blueprint using Build Mode's output structure (pipeline, friction fixes, wiring, human touchpoint & accountability, KPIs, closed-loop PoC). If `gapzero-build-mode/SKILL.md` is available, follow its format exactly.
6. **Verdict.** APPROVE (≥ 75, no critical gaps), DEFER (45–74 or any critical gap — list what must close first and the opportunity cost of proceeding anyway), REJECT (< 45, or the agent's only output is reporting). Binary, no hedging.

## Output format

```
AGENT AUDITED: <name>
VERDICT: APPROVE | DEFER | REJECT   ·   ACTION GAP SCORE: <0-100>/100
  friction <x>/25 · time-to-action <x>/25 · trust <x>/25 · quality+governance <x>/25

PIPELINE (as-is)
  <node> [type] [WIRED|GAP] → ...

GAP LEDGER (≤5)
  [CRITICAL|MAJOR|MINOR] <gap> → <remediation>

ANTI-PATTERNS DETECTED
  <named pattern(s) or "none">

REMEDIATED BLUEPRINT
  <Build Mode structure: friction fixes, wiring, human touchpoint & accountability, KPIs, PoC with kill criteria>

NEXT ACTION: <highest-severity remediation executable today>
```

Terse phrases. If asked for JSON, emit: `agentName, verdict, actionGapScore, subscores{friction,timeToAction,trust,qualityGovernance}, pipeline[], gaps[{gap,severity,remediation}], antiPatterns[], blueprint{...build-mode fields}, nextAction`.

## Refusals and blocks

- Spec too thin to reconstruct the pipeline → do not score; list the exact missing facts (systems touched, output destinations, human roles, metrics) and stop.
- Request to "approve" without audit → refuse; run the rubric first.
- Audit reveals critical accountability gap but user wants to scale anyway → DEFER, state the cost: autonomous errors with no named owner or rollback path.

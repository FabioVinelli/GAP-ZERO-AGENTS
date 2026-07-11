---
name: gapzero-build-mode
description: Design gap-free AI agents that convert every insight into an executed, measurable action. Use this skill whenever the user wants to create, design, spec, plan, or blueprint a new agent, automation, copilot, or agentic workflow — even if they only describe a use case, a business problem, or an outcome ("build an agent for churn", "automate invoice triage", "I want an agent that..."). Also use it when converting audit findings into a rebuilt agent design. Produces a complete blueprint: insight→action pipeline, friction inventory, execution wiring, human touchpoint with accountability, decision-quality KPIs, and a closed-loop PoC with kill criteria.
---

# GAP/ZERO Build Mode

Design agents where the distance between an insight and a value-driving executed action is zero. The deliverable is a **blueprint**, never a report: every element must name what executes, through which mechanism, and how success is measured.

## Doctrine constraints

- Friction = unintegrated systems + humans needed to act on an insight. Count it, then design it out.
- Humans are endpoints, not middleware: one final validation step maximum, with named accountability for agent errors.
- Outputs trigger workflows. If a step's output is "a report" or "a dashboard," redesign it.
- KPIs bias to decision quality, unmodified acceptance rate, and time-from-insight-to-action. Never volume metrics.
- No blueprint without a PoC that has explicit kill criteria and a review trigger.

## Workflow

1. **Pin the outcome.** Extract the single business outcome and its metric. If absent, stop and ask: "What outcome do you want to change?" Do not proceed without it.
2. **Map the insight→action chain.** List 5–7 pipeline nodes from the triggering insight to the final executed action. Type each node: `insight` | `system` | `human` | `action`. Mark each as wired (execution path known and automated) or gap.
3. **Inventory friction.** For every gap node: name the friction point and the concrete fix (API, RPA, orchestration layer, workflow redesign, or role change).
4. **Wire execution.** For each step, specify the mechanism (e.g., "CRM write via REST API", "agent triggers billing credit through orchestration layer with policy check"). Unknown mechanism = declared gap, never assumed.
5. **Design the human touchpoint.** One final validation step where valuable; define what the human sees, what they can veto, and **who is accountable when the agent acts wrongly** — including error detection and rollback.
6. **Set KPIs.** Max 4: at least one decision-quality metric, one time-to-action metric, one trust metric (% recommendations executed unmodified). Volume metrics only if paired with a quality gate.
7. **Define the closed-loop PoC.** Scope (one use case, reversible, low-stakes first), duration, success metric with threshold, kill criteria, scale criteria, review trigger (after N executions or T time).
8. **Score and verdict.** Action Gap Score 0–100 (100 = fully wired). Verdict: APPROVE (score ≥ 75 and outcome + governance defined), DEFER (45–74 or missing governance — state what must be resolved), REJECT (< 45, no outcome, or humans designed as middleware). State opportunity cost when deferring/rejecting.

## Output format

```
AGENT: <name>
VERDICT: APPROVE | DEFER | REJECT   ·   ACTION GAP SCORE: <0-100>/100

PIPELINE (insight → action)
  <node> [type] [WIRED|GAP] → ...

FRICTION INVENTORY (≤4)
  <point> → <fix>

EXECUTION WIRING (≤4)
  <step> → <mechanism>

HUMAN TOUCHPOINT & ACCOUNTABILITY
  Design: <final-step validation>
  If agent acts wrongly: <owner, detection, rollback>

KPIs (≤4, decision-quality first)
  <name> → <target>

POC — CLOSED LOOP
  Scope / Duration / Success metric / Kill criteria / Review trigger

NEXT ACTION: <one concrete step executable today>
```

Terse phrases throughout. If asked for JSON, emit the same fields as minified JSON with keys: `agentName, verdict, actionGapScore, pipeline[], friction[], wiring[], humanTouchpoint{design,accountability}, kpis[], poc{scope,duration,successMetric,killCriteria,reviewTrigger}, nextAction`.

## Refusals and blocks

- No defined outcome → block generation, ask for the outcome.
- Request for 5+ simultaneous agents/pilots → build one, explicitly deprioritize the rest, cite POC-purgatory risk.
- Irreversible high-stakes actuation (payments, deletions, legal notices) in a first PoC → DEFER; require a reversible pilot first.

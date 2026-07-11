# GAP/ZERO AGENT BUILD STANDARD — v2.0
**Remediated Agent Build Blueprint · Platform-agnostic · Model-agnostic · Use-case-agnostic**

Doctrine: Craig Le Clair (Forrester), *Mind The Agentic Action Gap* · Anthropic Labs harness design (generator–evaluator) · Claude Platform loop engineering · Enforced by GAP/ZERO build + audit modes.

**v2.0 changes**: maturity classification (L0) · policy engine + agent lifecycle (L2) · loop mechanics contract (L2) · generator–evaluator separation, sprint contracts, principle-based eval criteria, harness depreciation review (L4) · redesign backlog (L4) · operational prompt library (§10) · domain overlays (§11) · expanded gap taxonomy + certification to 12 gates.

---

## ARCHITECTURE

```
L0 OUTCOME CONTRACT & MATURITY CLASSIFICATION
  → L1 HARNESS (working + procedural/semantic/episodic memory, write governance)
  → L2 LOOP, ORCHESTRATION & ACTUATION (loop contract, actuation registry, policy engine, lifecycle)
  → L3 HUMAN TOUCHPOINT & ACCOUNTABILITY (single validation endpoint, owner/detection/rollback)
  ↺ L4 LLM OPS (trace → eval [generator≠evaluator] → observe → diagnose → gate → release → redesign backlog)
  ⊢ L5 CLOSED-LOOP PoC PROTOCOL (sprint contracts, kill/scale criteria, review triggers)
```

An agent is not buildable, shippable, or scalable until every layer passes its binary gate (§8). Applies to any model, any harness framework, any use case.

---

## §1 · LAYER 0 — OUTCOME CONTRACT & MATURITY CLASSIFICATION

**1.1 Outcome Contract** (precondition; no harness, memory, or wiring until it exists):

- **Outcome**: the single business metric this agent moves.
- **Baseline → target → deadline**.
- **Dominant loop** served; side use cases explicitly deprioritized.
- **Actuation boundary**: systems the agent may write to vs read-only.
- **Owner**: named person accountable for the outcome and for agent errors (feeds L3).

**Block rule**: no nameable outcome → build stops. "What outcome do you want to change?"

**1.2 Maturity classification** (two axes: ambition × level of action/orchestration). Classify before building or auditing:

| State | Signature | Ruling |
|---|---|---|
| Stagnation | No agents in workflow, or shelved pilots | Start one wired use case |
| Narrow efficiency | Low-ambition automation, no orchestration | Acceptable only as PoC cycle 1 |
| POC purgatory | Many pilots, reports, no executed actions, no kill criteria | Phase 0: stop/kill weak pilots before any new build |
| Agentic ROI zone | Agents execute, humans validate, outcome metric moving | Target state; scale per L5 |

**1.3 Use-case scoring** (screen every candidate, 0–10 each): outcome clarity · execution readiness · integration readiness · observability readiness · ROI measurability · risk controllability. Reject: no measurable outcome, or output is report/recommendation only. Defer: execution path requires humans as middleware.

---

## §2 · LAYER 1 — HARNESS (context + memory)

**2.1 Working memory / Context RAM** — assembled per run: user prompt · chat history · system prompt · retrieved memory. Keep minimal; retrieval only when the task requires it.

**2.2 Context lifecycle policy** (long-running tasks): prefer **context resets with structured handoffs** (state + next steps carried forward) over compaction when the model shows context anxiety (premature wrap-up near perceived limits); compaction preserves continuity but not a clean slate. Inter-agent communication via files: one agent writes, the next reads and responds in place — auditable by design.

**2.3 Three memory stores, three retrieval policies**

| Store | Contains | Storage | Retrieval | Write policy (mandatory) |
|---|---|---|---|---|
| Procedural | Skills, SOPs, how-to-act | Versioned files (skill.md) | Skill retrieval by task match | Changes ship only via L4 release gate |
| Semantic | Durable facts, user/org profile | Vector store | RAG top-k | Writes only via Summarizer consolidation with provenance (source run ID) |
| Episodic | Dated events, past runs, messages | SQL + vector store | SQL recency + top-k relevance | Auto-append post-run; immutable; every executed action logged |

**2.4 Summarizer agent** — cheaper model; episodic → semantic after N runs; provenance on every distilled fact; contradictions route to the L3 validation endpoint, never auto-overwrite.

**2.5 Accountability ledger** — episodic memory stores insight, action taken, mechanism, landing-check result, policy decision, and validator per record. Memory is evidence, not just context.

---

## §3 · LAYER 2 — LOOP, ORCHESTRATION & ACTUATION

Think → Act → Observe → Guardrail. Terminal node is an executed action, never a bare report.

**3.1 Loop mechanics contract** (implementation-agnostic; canonical pattern: model requests tools → system executes → results return → repeat):

- **Exit taxonomy** — every loop exit is one of: `task-complete` (no further tool request + landing check passed) · `max-iterations` · `budget-exhausted` (tokens/cost/time) · `paused` (server/turn cap — resume, work unfinished) · `refusal/error`. Each maps to a defined handler; none exits silently.
- **Bounds**: max iterations · timeout · retry ceiling per tool · token/cost budget per run. Exhaustion → explicit block with notification, not degraded output.
- **Tool errors are recoverable data**: returned to the agent flagged as errors for retry/replan; crash only on policy violation. Retries logged.
- **Cost control**: every iteration re-sends history + tool definitions — cache large tool results, keep working memory scoped; latency and token burn are deployability constraints.

**3.2 Actuation Registry.** Every tool entry declares:

- **Mechanism class**: `API/REST` · `MCP tool` · `DB write` · `webhook` · `RPA/UI automation` · `file op` · `orchestrator call` (API preferred over UI automation; validate availability, never assume)
- **Reversibility**: reversible / compensable / irreversible
- **Landing check**: deterministic verification the action executed (record ID returned, event exists, status = settled)
- **Permission tier**: read / write / write-with-validation (L3)
- **Schema**: validated inputs/outputs

**Rule**: unknown mechanism or missing landing check = declared GAP; does not ship.

**3.3 Policy Engine** *(new)* — evaluates every write-action pre-execution: inputs = action type, risk class, actor role, context; output = **allow / block / escalate-to-L3**; every decision logged with rule trace. High-risk classes (financial, health, legal, security, irreversible) always escalate. No policy trace = action blocked.

**3.4 Orchestration & lifecycle** *(new; mandatory once >1 agent or >3 tools)*:

- **Agent registry** + **tool registry**: who exists, what they may call, permission model.
- **Lifecycle states**: draft → test → pilot → approved → deprecated → retired. Only `approved` agents get write permissions; transitions pass through the L4 gate.
- Retry/exception handling, human escalation hooks, rollback hooks, audit trail — orchestrator-level, not per-agent improvisation.
- Multi-agent role pattern (compose as needed): Planner (ambitious on scope, silent on implementation detail — spec errors cascade) · Worker/Generator (executes in sprints against contracts) · Evaluator (separate agent, see §5.2) · Policy/Risk · Observability · Redesign.

**3.5 Terminal node contract.** The loop ends in exactly one of:

1. **Executed action** — mechanism fired, policy passed, landing check passed, receipt to user.
2. **Validated handoff** — action package to the single L3 endpoint (one click execute, one click veto).
3. **Explicit block** — named missing input/permission/policy, escalated with notification; never silent idle.

Information-only output is a failure unless the Outcome Contract defines the deliverable as information delivered *into a workflow* — still an actuation, still landing-checked.

**3.6 End-loop guardrail contract**: stop conditions enumerated up front — task-complete · clarification-needed · validation-required · policy-blocked · budget-exhausted · paused-resume.

---

## §4 · LAYER 3 — HUMAN TOUCHPOINT & ACCOUNTABILITY

Humans are endpoints, never middleware. Max one validation step per pipeline. Necessary judgment stays human; unnecessary task execution does not (the middleware test: copy/paste, manual lookup, system switching, data bridging = eliminate; risk judgment = keep).

- **Validation endpoint**: human sees proposed action + evidence + reversibility class + policy trace; can approve / veto / modify. Modifications logged — they feed the trust KPI.
- **Redesigned human roles** (agent-centric operating model): final approver · exception handler · agent supervisor · knowledge curator · quality reviewer. Operating cadence: exception queue daily, audit + KPI review weekly, redesign sprint per review trigger.
- **Accountability, named per agent**: **Owner** (accountable when agent acts wrongly) · **Detection** (landing-check failures and eval regressions page owner within one cycle) · **Rollback** (per mechanism class: compensating call, DB restore, config revert; irreversible actions require pre-execution validation, always).
- **Rubber-stamp control**: acceptance near 100% → sample-audit 5% of approvals.

**Gate**: no named owner + rollback per write mechanism → no write permissions. Period.

---

## §5 · LAYER 4 — LLM OPS (trace · eval · observe · diagnose · gate · release · redesign)

**5.1 Trace** — one trace per run (Langfuse, LangSmith, OTel, custom). Event tree: prompt version · retrieved memory (provenance) · tool calls · **actuation events + landing-check results** · policy decisions · validator decisions · retries · latency · tokens · errors · model/version. Invisible tool calls or unrecorded policy checks = deployment blocked.

**5.2 Eval — generator ≠ evaluator** *(structural rule, not preference)*:

- The agent that produced the work never decides whether it is done. Self-assessment fails structurally: agents praise their own mediocre output and talk themselves into approving flagged issues. Tune a standalone skeptical evaluator instead.
- **Two questions, both mandatory**: *Was it good?* — separate evaluator agent scores decision quality against **principle-based, gradable criteria** ("does this follow our principles" not "is this good"), hard threshold per criterion, any single failure fails the run. *Did it act?* — deterministic checks: action executed, landed, within boundary, policy-clean. Eloquent output with a failed landing check scores zero.
- **Evaluator calibration**: few-shot examples with score breakdowns; read evaluator logs, find divergence from your judgment, update its prompt; weight criteria toward what the model does poorly by default. Criteria wording shapes output — audit it.
- **Test like a user**: evaluator exercises the live system (browser/API/DB), probes edge cases — never grades static artifacts alone. Note modality blind spots: verification depth sets the autonomy ceiling.
- **Evaluator economics**: conditional investment — worth the cost when the task sits beyond what the current model does reliably solo; overhead inside that boundary. Re-decide per model generation.

**5.3 Observe** — tokens, latency, error rate, tool-failure rate, retries. Health signals only; never success metrics.

**5.4 Diagnose** — locate the failing layer before touching prompts: memory/retrieval → prompt → tool/mechanism → policy → orchestration → model.

**5.5 Gate** — release passes only if: both eval questions pass · no open critical gap · Action Gap Score ≥ 75 · accountability current · policy traces present.

**5.6 Release** — versioned, atomic, reversible: prompt version · model config (any vendor) · tool/mechanism changes · policy rules · memory/RAG parameters. Ships as configuration into the harness, never undocumented tweaks. Logged against the Outcome Contract metric (expected vs actual ROI).

**5.7 Redesign backlog** *(new)* — every failed eval, audit gap, and post-action review becomes a prioritized remediation task (rank: ROI impact × risk reduction ÷ effort). Test failures are backlog items, not anecdotes.

**5.8 Harness depreciation review** *(new)* — every harness component encodes an assumption about what the model cannot do alone; scaffolding is a depreciating asset. On every model upgrade: strip one component at a time, measure against baseline, remove what is no longer load-bearing, and reinvest the headroom in tasks previously out of reach. Simplify methodically — radical cuts destroy causal visibility.

---

## §6 · LAYER 5 — CLOSED-LOOP PoC PROTOCOL

Every new agent or major change deploys under this.

- **Phase 0**: kill weak pilots first — no new builds atop POC purgatory.
- **Scope**: one use case; reversible actions only in cycle 1; irreversible actuation earns its way in after review trigger.
- **Sprint contracts** *(new)*: before each work chunk, worker and evaluator negotiate what "done" looks like — deliverables constrained, methods open (early spec errors cascade downstream). Build proceeds only after contract agreement; the contract becomes the eval checklist.
- **Duration**: fixed window or N executions, whichever first.
- **Success metric**: the Outcome Contract metric, explicit threshold.
- **Kill criteria**: pre-committed (decision-quality < X, landing-check failures > Y%, owner overrides > Z%) → retire or rebuild, never extend.
- **Scale criteria**: threshold met + zero unresolved critical gaps → expand actuation boundary, promote lifecycle state.
- **Review trigger**: N executions or T time or defined signal — whichever first. Also triggered anytime the agent cannot execute through its wiring, cannot log decisions, needs humans to bridge systems, or produces reports without action.

A pilot without kill criteria is POC purgatory. One wired use case beats thirty report-producing pilots.

---

## §7 · KPI STANDARD (max 4, this order)

1. **Decision quality** — evaluator rubric score on action appropriateness.
2. **Time from insight to executed action** — insight timestamp → landing-check pass (target: same cycle).
3. **Unmodified acceptance rate** — % of proposed actions executed without modification (measured always; sampled against rubber-stamping).
4. **Outcome metric delta / ROI** — expected vs actual movement of the L0 metric.

Volume metrics permitted only as denominators. Friction target: **0–1 unresolved manual handoffs per pipeline**.

---

## §8 · GAP/ZERO CERTIFICATION — 12 binary gates

| # | Gate | Y/N |
|---|------|-----|
| 1 | Outcome Contract with baseline → target → owner |  |
| 2 | Maturity state classified; no new build atop POC purgatory |  |
| 3 | Every pipeline node typed and WIRED (no assumed integrations) |  |
| 4 | Every write-tool: mechanism class + landing check + reversibility + schema |  |
| 5 | Policy engine evaluates every write pre-execution, decisions logged |  |
| 6 | Terminal node = executed action / validated handoff / explicit block |  |
| 7 | ≤ 1 human validation step; middleware test passed (no manual bridging) |  |
| 8 | Named owner + detection + rollback per write mechanism |  |
| 9 | Trace covers actuation events, landing checks, policy + validator decisions |  |
| 10 | Evaluator is a separate agent; both eval questions enforced with hard thresholds |  |
| 11 | KPIs match §7; friction ≤ 1 manual handoff |  |
| 12 | PoC has sprint contracts, kill criteria, scale criteria, review trigger |  |

**Scoring** (audit rubric): friction /25 · time-to-action /25 · trust /25 · quality+governance /25. **APPROVE** ≥ 75 with all 12 gates YES · **DEFER** 45–74 or any critical gap · **REJECT** < 45 or report-only output.

---

## §9 · INSTANTIATION TEMPLATE (any use case, platform, model)

```
AGENT: <name>                       LIFECYCLE STATE: draft|test|pilot|approved
L0 OUTCOME: <metric> from <baseline> to <target> by <date> · OWNER: <name>
MATURITY STATE: stagnation | narrow efficiency | POC purgatory | agentic ROI zone
MODEL: <any — selected after control requirements are fixed>
HARNESS PLATFORM: <any>

PIPELINE (5–7 nodes, insight → action)
  <node> [insight|system|human|action] [WIRED|GAP] → ...

FRICTION INVENTORY (≤4)   <point> → <fix: API | MCP | RPA/UI | orchestration | role change>
EXECUTION WIRING (≤4)     <step> → <mechanism + landing check>
POLICY RULES              <risk class → allow/block/escalate>
HUMAN TOUCHPOINT          Design: <what validator sees/vetoes>
                          Accountability: <owner / detection / rollback>
EVALUATOR                 <separate agent; criteria + hard thresholds + calibration set>
KPIs (≤4, §7 order)       <name> → <target>
POC                       Scope / Sprint contract / Duration / Success / Kill / Scale / Review
NEXT ACTION:              <one step executable today>
```

---

## §10 · OPERATIONAL PROMPT LIBRARY (mapped to layers)

Run these as agents/prompts at each layer; each ends in APPROVE / DEFER / REJECT or a scored register.

| Prompt | Function | Layer |
|---|---|---|
| P1 Action Gap Audit | Classify maturity, count friction, map time-to-action + adoption, gap register | L0 / audit |
| P2 Use Case Selector | Score candidates on the 6×0–10 rubric; reject report-only agents | L0 |
| P3 Execution Blueprint | Decompose workflow to atomic steps; label agent-executable / API-needed / UI-needed / human / blocked; rollback + escalation | L2 |
| P4 Framework Generator | Full module spec: registries, planning, execution, policy, approval, observability, memory, eval, backlog | L1–L4 |
| P5 Orchestration Layer | Agent/tool registries, permissions, lifecycle, escalation, rollback hooks, audit | L2 |
| P6 Operating Model | Eliminate human middleware, redefine roles, cadence, skills program | L3 |
| V1 Test Harness | 12 tests: insight-to-action trace, friction, time, middleware, tools, policy, approval, observability, rollback, ROI, recovery, redesign | L4 / pre-gate |
| V2 POC Purgatory Detector | Portfolio flag: no production workflow, report-only output, no owner, no kill criteria | L5 |
| V3 Middleware Elimination | Find manual bridges; separate judgment from task execution | L3 |
| V4 Observability & Governance | 13-point audit trail check; reject if actions unauditable | L4 |
| V5 Redesign Path | Group gaps → tasks → phases 0–6 (kill pilots → measure → blueprint → orchestrate → govern → pilot → scale/reject) | L4/L5 |

---

## §11 · DOMAIN OVERLAYS (mandatory extra gates for regulated/high-risk domains)

- **Software/platform**: no agent approved that only generates reports; every insight maps to an action, every action to a tool, every workflow logs decisions/tools/errors/outcomes; UI prioritizes action queues over dashboards.
- **Healthcare/compliance**: PHI minimum-necessary access · role-based permissions · clinical/admin approval gates · no autonomous clinical decisions · recommendation vs draft vs final action distinguished · audit schema + compliance test suite before pilot.
- **Trading/financial**: default mode research/backtest/paper only · live execution requires authority, credentials, risk limits, max loss, position sizing, stop conditions, and human approval · every signal maps to evidence, rule, timeframe, instrument, risk policy · every recommendation carries invalidation logic + audit record · kill switch defined · verdicts: RESEARCH / PAPER / BLOCK LIVE / APPROVE CONTROLLED LIVE.

---

## APPENDIX A — Gap taxonomy (audit against all 12)

Workflow integration · ROI · POC purgatory · Friction · Time-to-action · Trust/adoption · Observability · KPI (volume theater) · Framework (single-prompt agents can't plan/execute) · Orchestration (isolated unmanaged agents) · Skills (humans lack oversight capability) · Operating model (humans as middleware).

## APPENDIX B — Decision logic (standing rules)

No outcome → no agent (DEFER) · No execution path → no pilot (BLOCK) · >2 systems/humans between insight and action → redesign · Time-to-action beyond tolerance → automate or escalate · Frequent human edits → trust remediation · High-risk action → gated execution · No logs/traces → block deployment · Many pilots, no ROI → portfolio reset · Human copies data between systems → automation backlog.

## APPENDIX C — Anti-pattern watchlist

**Report factory** · **Human middleware** · **POC purgatory** · **Rubber stamp** · **Volume theater** · **Assumed wiring** · **Prompt-first debugging** · **Memory landfill** · **Self-grading generator** *(new — producer approves its own work)* · **Context anxiety** *(new — premature wrap-up near context limits; fix with resets + structured handoffs)* · **Stale scaffolding** *(new — harness components outlived by model capability; fix via §5.8 depreciation review)* · **Runaway loop** *(new — no max iterations/budget; fix via §3.1 contract)*.

---

*GAP/ZERO Agent Build Standard v2.0 · 2026-07-08 · Supersedes v1.0. Sources integrated: Le Clair action-gap report reconstruction (P1–P6, V1–V5), Anthropic Labs harness design, Claude Platform loop engineering, Agent Build Blueprint diagram + transcription. Review trigger: first certified agent completes its PoC window, 30 days, or next model generation (run §5.8), whichever first.*

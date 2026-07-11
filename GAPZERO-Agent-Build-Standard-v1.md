# GAP/ZERO AGENT BUILD STANDARD — v1.0
**Remediated Agent Build Blueprint · Platform-agnostic · Model-agnostic · Use-case-agnostic**
Doctrine: Craig Le Clair (Forrester), Agentic Action Gap · Enforced by GAP/ZERO audit + build modes

---

## PART A — AUDIT OF THE ORIGINAL AGENT BUILD BLUEPRINT

```
AGENT AUDITED: Agent Build Blueprint (Harness / Loop / LLM Ops diagram)
VERDICT: DEFER   ·   ACTION GAP SCORE: 46/100
  friction 18/25 · time-to-action 15/25 · trust 6/25 · quality+governance 7/25
```

### Pipeline (as-is)

```
User Prompt [insight] [WIRED]
→ Working Memory assembly (procedural/semantic/episodic retrieval) [system] [WIRED]
→ LLM Agent Core [system] [WIRED]
→ Tool Calls (APIs, files, apps, DBs) [action] [WIRED — mechanisms exemplified, not contracted]
→ End-Loop Guardrails [system] [GAP — trigger conditions undefined]
→ Reply / Action [action] [GAP — "Reply" is a terminal report; action not verified]
→ Run saved → Trace → Eval → Diagnose → Gate → Release [system] [PARTIAL — quality loop wired, accountability absent]
```

### Gap ledger

| # | Severity | Gap | Remediation |
|---|----------|-----|-------------|
| 1 | CRITICAL | No named accountability, error detection, or rollback anywhere in the architecture. Agent writes to CRM/payments with no owner when it acts wrongly. | Add Layer 3 (Human Touchpoint & Accountability) — mandatory, see Part B §4 |
| 2 | CRITICAL | Terminal node is "Reply." A reply is a report. Nothing verifies the intended action executed and landed in the target system. | Terminal node becomes **Executed Action + deterministic landing check**; reply is a receipt, not the deliverable |
| 3 | MAJOR | KPIs are health/volume metrics only (tokens, latency, errors, quality scores undefined). No decision-quality, no unmodified-acceptance, no time-from-insight-to-action. | Replace with the 4-KPI standard (§7) |
| 4 | MAJOR | No PoC discipline: no kill criteria, no scale criteria, no review trigger → POC purgatory risk on every deployment. | Closed-Loop PoC Protocol mandatory before any build (§6) |
| 5 | MINOR | End-loop guardrails and consolidation thresholds named but unspecified; observability lacks action-level events. | Guardrail contract (§3.4) + trace schema with actuation events (§5.1) |

### Anti-patterns detected
- **Report factory** — "Reply" as terminal output.
- **Volume theater** — Observe metrics (tokens/latency/errors) standing in for decision quality.
- **POC purgatory** — release loop with no kill/scale criteria.
- Human middleware: not present — but only because humans are absent entirely, which is the accountability gap, not a virtue.

### Why DEFER, not REJECT
Execution wiring is the blueprint's core strength (agentic tools inside the loop, same-cycle actuation). Two critical gaps block approval. Opportunity cost of proceeding as-is: autonomous writes to business systems with no owner, no rollback, and no proof any action landed.

---

## PART B — THE GAP/ZERO AGENT BUILD STANDARD (remediated blueprint)

Six layers. An agent is not buildable, shippable, or scalable until every layer passes its binary gate (§8). Applies to any model (GPT, Claude, Gemini, Llama, local), any harness framework (LangGraph, Agent SDK, Pydantic-AI, custom), any use case.

```
L0 OUTCOME CONTRACT  →  L1 HARNESS  →  L2 LOOP & ACTUATION  →  L3 HUMAN TOUCHPOINT & ACCOUNTABILITY
                                     ↑__________________ L4 LLM OPS (trace→eval→diagnose→gate→release) _________↓
                                                L5 CLOSED-LOOP PoC PROTOCOL (governs first deployment)
```

---

### §1 · LAYER 0 — OUTCOME CONTRACT *(new; precondition for everything)*

No harness, no memory design, no tool wiring until this exists. One page, four fields:

- **Outcome**: the single business metric this agent moves (e.g., refund resolution time, churn-save rate, invoice cycle time).
- **Baseline → target**: current value, target value, deadline.
- **Dominant loop**: which system loop this serves; side use cases explicitly deprioritized.
- **Actuation boundary**: which systems the agent may write to, and which are read-only.

**Block rule**: if the outcome cannot be named, the build stops. "What outcome do you want to change?"

---

### §2 · LAYER 1 — HARNESS (context + memory)

Retained from the original blueprint, hardened with write governance.

**2.1 Working memory / Context RAM** — assembled per run from: user prompt · chat history · system prompt · retrieved memory. Keep minimal; retrieval only when the task requires it (latency and token cost are deployability constraints).

**2.2 Three memory stores, three retrieval policies**

| Store | Contains | Storage | Retrieval | Write policy (mandatory) |
|---|---|---|---|---|
| Procedural | Skills, SOPs, how-to-act instructions | Files (skill.md), versioned | Skill retrieval by task match | Version-controlled; changes ship only via L4 release gate |
| Semantic | Durable facts, user/org profile | Vector store | RAG top-k | Writes only via Summarizer consolidation with provenance field (source run ID) |
| Episodic | Dated events, past runs, messages | SQL + vector store | SQL recency + top-k relevance | Auto-append post-run; immutable; every executed action logged as event |

**2.3 Summarizer agent** — cheaper model; consolidates episodic → semantic after N runs; every distilled fact carries provenance; noisy-accumulation gate: facts contradicting existing semantic memory route to human validation endpoint (L3), never auto-overwrite.

**2.4 GAP/ZERO addition**: episodic memory doubles as the **accountability ledger** — each record stores insight, action taken, mechanism, landing-check result, and validator (if any). Memory is not just context; it is evidence.

---

### §3 · LAYER 2 — LOOP & ACTUATION

Think → Act → Observe → Guardrail. Retained; terminal node redefined.

**3.1 Actuation Registry (replaces the loose tool list).** Every tool entry declares:

- **Mechanism class** (platform-agnostic): `API/REST` · `MCP tool` · `DB write` · `webhook` · `RPA` · `file op` · `orchestrator call`
- **Reversibility**: reversible / compensable / irreversible
- **Landing check**: the deterministic verification that the action executed (e.g., CRM record ID returned, calendar event exists, payment status = settled)
- **Permission tier**: read / write / write-with-validation (L3)

**Rule**: a tool with unknown mechanism or no landing check is a declared GAP — it does not ship. Never assume an integration exists.

**3.2 Terminal node contract.** The loop ends in exactly one of:

1. **Executed action** — wired mechanism fired, landing check passed, receipt to user.
2. **Validated handoff** — irreversible action packaged for the single L3 validation endpoint (one click to execute, one to veto).
3. **Explicit block** — named missing input/permission, escalated with notification (never silent idle).

A reply containing only information is a failure mode unless the Outcome Contract defines the deliverable as information delivered into a workflow (e.g., posted into the system where the next actor works — still an actuation, still landing-checked).

**3.3 Loop bounds**: max iterations · timeout · retry ceiling · token budget per run. Exhaustion → explicit block, not degraded output.

**3.4 End-loop guardrail contract** (replaces the undefined box): stop conditions enumerated up front — task-complete (landing check passed) · clarification-needed · validation-required (route to L3) · blocked (notify human, e.g., hook/webhook alert) · budget-exhausted.

---

### §4 · LAYER 3 — HUMAN TOUCHPOINT & ACCOUNTABILITY *(new; closes critical gap #1)*

Humans are endpoints, never middleware. Maximum one validation step per pipeline.

- **Validation endpoint design**: what the human sees (proposed action + evidence + reversibility class), what they can do (approve / veto / modify — modifications are logged, they feed the trust KPI).
- **Accountability (named, per agent)**: **Owner** — accountable when the agent acts wrongly. **Detection** — landing-check failures and eval regressions page the owner within one cycle. **Rollback** — per mechanism class: compensating API call, DB restore, versioned-config revert; irreversible actions require pre-execution validation, always.
- **Rubber-stamp control**: if unmodified acceptance approaches 100%, sample-audit 5% of approvals; unexamined 100% acceptance is a risk, not trust.

**Gate**: no named owner + rollback path per write-mechanism → agent does not receive write permissions. Period.

---

### §5 · LAYER 4 — LLM OPS (evaluate · observe · diagnose · gate · release)

Retained structure; upgraded from answer-quality loop to action-quality loop.

**5.1 Trace** — one trace per run (any platform: Langfuse, LangSmith, OTel-based, custom). Event tree must include: prompt version · retrieved memory (with provenance) · tool calls · **actuation events + landing-check results** · validator decision · latency · tokens · errors.

**5.2 Eval — two questions, both mandatory**

- *Was it good?* LLM-as-judge on decision quality (right action for the insight), rubric-scored.
- *Did it act?* Deterministic checks: action executed, landed, within actuation boundary. An eloquent reply with a failed landing check scores zero.

**5.3 Observe** — tokens, latency, error rate, tool-failure rate. Health signals only; never presented as success metrics.

**5.4 Diagnose** — locate failure layer before touching prompts: memory/retrieval → prompt → tool/mechanism → orchestration → model. Fix causes, not symptoms.

**5.5 Gate** — release passes only if: evals pass (both questions) · no open critical gap · Action Gap Score ≥ 75 · accountability fields current. Failed → fix, re-run, re-trace, re-eval.

**5.6 Release** — versioned, atomic, reversible: prompt version · model config (any vendor) · tool/mechanism changes · memory/RAG parameters. Ships back into the harness as configuration, never as undocumented manual tweaks. Every release logged against the Outcome Contract metric.

---

### §6 · LAYER 5 — CLOSED-LOOP PoC PROTOCOL

Every new agent or major change deploys under this. No exceptions.

- **Scope**: one use case, reversible actions only in cycle 1 (irreversible actuation earns its way in after review trigger).
- **Duration**: fixed window (e.g., 2–4 weeks) or N executions, whichever first.
- **Success metric**: the Outcome Contract metric, with explicit threshold.
- **Kill criteria**: pre-committed (e.g., decision-quality eval < X, landing-check failure > Y%, owner overridden > Z% of runs) → agent is retired or rebuilt, not extended.
- **Scale criteria**: threshold met + zero unresolved critical gaps → expand actuation boundary.
- **Review trigger**: after N executions or T time or a defined signal — whichever first.

A pilot without kill criteria is POC purgatory. One wired use case beats thirty report-producing pilots.

---

### §7 · KPI STANDARD (max 4, this order)

1. **Decision quality** — eval-rubric score on action appropriateness (target set per Outcome Contract).
2. **Time from insight to executed action** — insight timestamp → landing-check pass (target: same cycle).
3. **Unmodified acceptance rate** — % of proposed actions the validator executes without modification (measured always; sampled for rubber-stamping).
4. **Outcome metric delta** — movement of the L0 business metric.

Volume metrics (runs, tickets, calls) permitted only as denominators, never as success.

---

### §8 · GAP/ZERO CERTIFICATION — binary gates

An agent is GAP/ZERO-certified when all ten answer YES:

| # | Gate | Y/N |
|---|------|-----|
| 1 | Outcome Contract exists with baseline → target |  |
| 2 | Every pipeline node typed and marked WIRED (no assumed integrations) |  |
| 3 | Every write-tool has mechanism class + landing check + reversibility class |  |
| 4 | Terminal node is executed action / validated handoff / explicit block — never a bare report |  |
| 5 | ≤ 1 human validation step; humans nowhere mid-pipeline |  |
| 6 | Named owner + detection + rollback per write mechanism |  |
| 7 | Trace includes actuation events and landing-check results |  |
| 8 | Evals answer both "was it good" and "did it act" |  |
| 9 | KPIs match §7 (no volume theater) |  |
| 10 | PoC has kill criteria, scale criteria, review trigger |  |

**Scoring**: Action Gap Score per audit rubric (friction /25 · time-to-action /25 · trust /25 · quality+governance /25). APPROVE ≥ 75 with all ten gates YES · DEFER 45–74 or any critical gap · REJECT < 45 or report-only output.

---

### §9 · INSTANTIATION TEMPLATE (any use case, any platform, any model)

Copy per agent; fill every field; unknowns are declared GAPs.

```
AGENT: <name>
L0 OUTCOME: <metric> from <baseline> to <target> by <date>
MODEL: <any — provider-agnostic; selected after control requirements are fixed>
HARNESS PLATFORM: <any — LangGraph / Agent SDK / custom / other>

PIPELINE (5–7 nodes, insight → action)
  <node> [insight|system|human|action] [WIRED|GAP] → ...

FRICTION INVENTORY (≤4)   <point> → <fix: API | MCP | RPA | orchestration | role change>
EXECUTION WIRING (≤4)     <step> → <mechanism + landing check>
HUMAN TOUCHPOINT          Design: <what validator sees/vetoes>
                          Accountability: <owner / detection / rollback>
KPIs (≤4, §7 order)       <name> → <target>
POC                       Scope / Duration / Success metric / Kill / Scale / Review trigger
NEXT ACTION:              <one step executable today>
```

---

### Appendix — Anti-pattern watchlist

**Report factory** (terminal output is passive info) · **Human middleware** (person bridging systems the agent should touch) · **POC purgatory** (no kill/scale metric) · **Rubber stamp** (unexamined 100% acceptance) · **Volume theater** (KPIs count motion, not judgment) · **Assumed wiring** (integration claimed without mechanism) · **Prompt-first debugging** (tuning prompts before diagnosing the failing layer) · **Memory landfill** (consolidation without provenance or contradiction gates).

---

*GAP/ZERO Agent Build Standard v1.0 · 2026-07-08 · Supersedes the Agent Build Blueprint diagram as the build reference. Review trigger: after the first certified agent completes its PoC window, or after 30 days, whichever first.*

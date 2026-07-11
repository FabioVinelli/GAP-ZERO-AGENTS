# GAP/ZERO AGENT BUILD STANDARD — v2.1 (IDE-AGENT BUILD EDITION)
**Platform-agnostic · Model-agnostic · Use-case-agnostic · Executable by Claude Code / Cursor Composer**

Doctrine: Craig Le Clair (Forrester), *Mind The Agentic Action Gap* · Anthropic Labs harness design (generator–evaluator) · Claude Platform loop engineering.

**v2.1 changes**: adds **PART C — IDE AGENT BUILD SPEC**: a paste-ready master prompt + sprint plan + file-by-file spec + verification commands so a coding agent (Claude Code, Cursor Composer/Agent) can build the GAP/ZERO Studio app end-to-end inside the IDE. Parts A–B (the standard itself) unchanged from v2.0.

**How to use this file in Cursor**: drop it at the repo root as `GAPZERO-STANDARD.md` (Claude Code also reads it if referenced from `CLAUDE.md`; Cursor picks it up as context or via `@GAPZERO-STANDARD.md`). Then paste the §C.2 master prompt into Composer/Agent chat. The agent builds sprint by sprint; each sprint has a contract and a verification command — do not let it advance past a failing verification.

---

# PART A — THE STANDARD (normative)

## Architecture

```
L0 OUTCOME CONTRACT & MATURITY CLASSIFICATION
  → L1 HARNESS (working + procedural/semantic/episodic memory, write governance)
  → L2 LOOP, ORCHESTRATION & ACTUATION (loop contract, actuation registry, policy engine, lifecycle)
  → L3 HUMAN TOUCHPOINT & ACCOUNTABILITY (single validation endpoint, owner/detection/rollback)
  ↺ L4 LLM OPS (trace → eval [generator≠evaluator] → observe → diagnose → gate → release → redesign backlog)
  ⊢ L5 CLOSED-LOOP PoC PROTOCOL (sprint contracts, kill/scale criteria, review triggers)
```

## §1 · L0 — Outcome Contract & Maturity

- Outcome: single business metric · baseline → target → deadline · dominant loop · actuation boundary · **named owner**.
- Block rule: no nameable outcome → build stops. "What outcome do you want to change?"
- Maturity (ambition × action level): stagnation | narrow efficiency | POC purgatory | agentic ROI zone. No new build atop POC purgatory — kill weak pilots first (Phase 0).
- Use-case screen (0–10 each): outcome clarity · execution readiness · integration readiness · observability readiness · ROI measurability · risk controllability. Reject report-only agents; defer human-middleware paths.

## §2 · L1 — Harness

- Working memory assembled per run: user prompt · chat history · system prompt · retrieved memory. Keep minimal.
- Context lifecycle: prefer context resets + structured handoffs over compaction under context anxiety; file-based inter-agent communication (auditable).
- Three stores: **Procedural** (versioned skill files; changes only via release gate) · **Semantic** (vector, writes only via consolidation with provenance) · **Episodic** (SQL+vector, immutable, auto-append; doubles as **accountability ledger**: insight, action, mechanism, landing check, policy decision, validator per record).
- Summarizer (cheaper model), consolidation after N runs; contradictions route to L3, never auto-overwrite.

## §3 · L2 — Loop, Orchestration & Actuation

- **Loop contract**: exit taxonomy `task-complete | max-iterations | budget-exhausted | paused | error` — every exit has a handler, none silent. Bounds: max iterations, timeout, retry ceiling, token/cost budget. Tool errors = recoverable data returned to the model. Cache large tool results.
- **Actuation Registry** — per tool: mechanism class (`API/REST · MCP · DB write · webhook · RPA/UI · file op · orchestrator`) · reversibility (reversible/compensable/irreversible) · **deterministic landing check** · permission tier · schema. Unknown mechanism or missing landing check = declared GAP; does not ship.
- **Policy Engine**: every write pre-execution → allow | block | escalate; decisions logged with rule trace; high-risk/irreversible always escalates.
- **Orchestration** (>1 agent or >3 tools): agent+tool registries, lifecycle draft→test→pilot→approved→deprecated→retired (only `approved` writes), retries/escalation/rollback hooks at orchestrator level. Roles: Planner (ambitious scope, no implementation detail) · Worker · Evaluator (separate) · Policy · Observability · Redesign.
- **Terminal contract**: executed action (landing-checked) | validated handoff | explicit block. A bare report is a failure mode.

## §4 · L3 — Human Touchpoint & Accountability

- Humans are endpoints, never middleware. Max ONE validation step. Middleware test: copy/paste, manual lookup, system bridging = eliminate; risk judgment = keep.
- Validator sees action + evidence + reversibility + policy trace; approve/veto/modify (modifications feed trust KPI).
- Named per agent: **Owner** · **Detection** (failures page owner within one cycle) · **Rollback** (per mechanism class; irreversible requires pre-execution validation, always).
- Rubber-stamp control: acceptance ≈100% → sample-audit 5%.
- Gate: no owner + rollback → no write permissions.

## §5 · L4 — LLM Ops

- **Trace**: one per run — prompt version, retrieved memory (provenance), tool calls, actuation events + landing results, policy + validator decisions, retries, latency, tokens, model/version.
- **Eval, generator ≠ evaluator** (structural): separate skeptical evaluator; principle-based gradable criteria; hard threshold per criterion (one failure fails the run); few-shot calibration; test like a user on the live system; criteria wording shapes output; evaluator = conditional investment, re-decide per model generation. Two questions: *Was it good?* + *Did it act?* (deterministic). Eloquent output + failed landing check = zero.
- **Observe** (health only): tokens, latency, errors, tool failures. **Diagnose** before prompt-tuning: memory→prompt→tool→policy→orchestration→model.
- **Gate**: both eval questions pass · no critical gap · score ≥ 75 · accountability current. **Release**: versioned, atomic, reversible (prompt/model/tools/policy/RAG params), logged vs outcome metric.
- **Redesign backlog**: every failure becomes a ranked remediation task. **Harness depreciation review**: on each model upgrade strip one component at a time; scaffolding is a depreciating asset.

## §6 · L5 — Closed-Loop PoC

Phase 0 kill weak pilots · one use case, reversible-only cycle 1 · **sprint contracts** (worker+evaluator agree "done" before building; deliverables constrained, methods open) · fixed duration/N executions · success threshold · **pre-committed kill criteria** · scale criteria · review trigger (N runs / T time / signal / wiring failure). No kill criteria = POC purgatory.

## §7 · KPI Standard (max 4, in order)

decision quality · time from insight to executed action · unmodified acceptance rate · outcome delta/ROI. Volume only as denominators. Friction target: 0–1 manual handoffs.

## §8 · Certification — 12 binary gates

1 outcome contract+owner · 2 maturity classified · 3 pipeline typed+wired · 4 write-tools: mechanism+landing+reversibility+schema · 5 policy engine logs every write · 6 terminal = action/handoff/block · 7 ≤1 human step, no middleware · 8 owner+detection+rollback · 9 trace covers actuation+policy+validator · 10 separate evaluator, hard thresholds · 11 KPI standard, friction ≤1 · 12 PoC: sprint contract+kill+scale+review.

**Scoring**: friction /25 · time-to-action /25 · trust /25 · quality+governance /25. APPROVE ≥75 + all 12 gates · DEFER 45–74 or any critical gap · REJECT <45 or report-only.

# PART B — OPERATIONAL LIBRARY (informative)

- **Prompt chain**: P1 gap audit · P2 use-case selector · P3 execution blueprint · P4 framework generator · P5 orchestration layer · P6 operating model. **Validators**: V1 test harness (12 tests) · V2 POC-purgatory detector · V3 middleware elimination · V4 observability/governance · V5 redesign path (phases 0–6).
- **Domain overlays**: software (action queues over dashboards) · healthcare (PHI minimums, no autonomous clinical decisions) · trading (research/paper default; live requires authority, risk limits, stops, human approval, kill switch; verdicts RESEARCH / PAPER / BLOCK LIVE / APPROVE CONTROLLED LIVE).
- **Anti-patterns**: report factory · human middleware · POC purgatory · rubber stamp · volume theater · assumed wiring · prompt-first debugging · memory landfill · self-grading generator · context anxiety · stale scaffolding · runaway loop.

---

# PART C — IDE AGENT BUILD SPEC (Claude Code / Cursor Composer)

Builds **GAP/ZERO Studio**: a local web app (runs in Cursor's Simple Browser) that BUILDS, AUDITS, and SCAFFOLDS agents per Parts A–B. Target machine: macOS (iMac i5/32GB), Node 18+, Python 3.10+.

## C.1 · Sprint protocol for the coding agent

Work in the 5 sprints below, **in order**. Each sprint has a CONTRACT (definition of done) and a VERIFY command. Rules for the agent:

- Do not start a sprint until the previous VERIFY passes. Do not mark done on failing verification.
- Constrain deliverables, not methods: match the file specs' behavior exactly; internal style is yours.
- Never put the API key in frontend code. Never invent an npm package not listed in C.3.
- After Sprint 5, run the full acceptance gate (C.7) and report each gate PASS/FAIL.

## C.2 · Master prompt (paste this into Claude Code / Cursor Composer)

```
You are building GAP/ZERO Studio per GAPZERO-STANDARD.md (in this repo), Part C.
Execute sprints S0→S4 in order. Each sprint: build to the CONTRACT, run the VERIFY
command, show me the output, and stop for my go-ahead before the next sprint.
Never advance past a failing VERIFY. Never place the Anthropic API key in browser
code. Use only the dependencies in §C.3. When all sprints pass, run the §C.7
acceptance gates and output a PASS/FAIL table with evidence. Begin with S0.
```

## C.3 · Stack (fixed)

- Frontend: Vite 5 + React 18, single-page, inline styles, no UI framework.
- Backend: Express 4 + dotenv on port 8787; Vite dev server 5173 proxies `/api` → 8787.
- deps: `express dotenv react react-dom` · devDeps: `vite @vitejs/plugin-react concurrently`.
- `.env`: `ANTHROPIC_API_KEY`, `MODEL` (default `claude-sonnet-4-6`), `PORT=8787`. Model string is user-switchable in the UI header (model-agnostic).
- Scripts: `dev` = concurrently server+client · `server` · `client` · `build`.

## C.4 · Repo layout (fixed)

```
gapzero-studio/
├── package.json  vite.config.js  index.html  .env.example  .gitignore  README.md
├── server/
│   ├── index.js     Express: GET /api/health · POST /api/run · POST /api/scaffold
│   ├── engine.js    SYSTEM_RULES_V2, schemaFor(mode), buildTask, parseEngineJSON
│   └── scaffold.js  generateScaffold(blueprint, outRoot) → Python project
├── src/
│   ├── main.jsx
│   └── App.jsx      Studio UI
└── generated/       scaffolded agents land here (gitignored)
```

## C.5 · Sprints

**S0 — Scaffold.** package.json, vite.config.js (proxy /api→8787), index.html, main.jsx, .env.example, .gitignore (node_modules, dist, .env, generated/).
CONTRACT: `npm install` clean; `npx vite build` succeeds with a placeholder App.
VERIFY: `npm install && npx vite build`

**S1 — Engine + server.** `engine.js`: system prompt encoding Part A doctrine (friction, terminal contract, generator≠evaluator, policy engine, loop taxonomy, 12 gates, verdict bands) + the C.6 JSON schema + robust JSON extractor (strip fences, slice first `{` to last `}`). `index.js`: `/api/health` → `{ok, keyConfigured, model}` · `/api/run {mode:"build"|"audit", input, model?}` → calls `https://api.anthropic.com/v1/messages` (headers `x-api-key`, `anthropic-version: 2023-06-01`, max_tokens 4000) → `{blueprint}`; 400 on bad input, 502 on API error, 500 with actionable message when key missing.
CONTRACT: server boots without key (health reports keyConfigured:false); /api/run validates input.
VERIFY: `node --check server/index.js && node --check server/engine.js`

**S2 — Studio UI.** Two-column layout. Left console: BUILD/AUDIT toggle, model `<select>` (any Anthropic model strings), textarea, run button, engine-ready indicator from /api/health. Right results, rendered from the C.6 blueprint: dark scoreboard (score/100 color-banded ≥75 green, 45–74 amber, <45 red; verdict chip; maturity; gates x/12; 4 subscore bars /25) · NEXT ACTION banner · insight→action rail (wired solid / GAP dashed-pulsing; diamond = human node) · 12-gate grid (✓/✗) · gap ledger (audit mode, severity-colored) · anti-pattern chips · panels: friction, wiring (mechanism + landing check + reversibility), policy rules (ALLOW/ESCALATE/BLOCK), human touchpoint (design/owner/detection/rollback), evaluator criteria + threshold, KPIs, PoC (scope, sprint contract, duration, success, kill, scale, review) · COPY JSON + SCAFFOLD buttons (scaffold visually flagged when verdict ≠ APPROVE).
CONTRACT: `npm run dev` serves the app at :5173 inside Cursor's Simple Browser; missing-key state shows a readable error, not a blank screen.
VERIFY: `npx vite build`

**S3 — Python scaffold generator.** `scaffold.js` exports `generateScaffold(bp, outRoot)` writing `generated/<slug>/`:
`README.md` (outcome contract, layer table) · `blueprint.json` · `poc.md` (kill/scale/review from bp) · `requirements.txt` (anthropic, python-dotenv) · `.env.example` · `.gitignore` · `skills/blueprint.skill.md` (procedural memory: boundary + stop conditions) · `src/gapzero/`: `trace.py` (JSONL, one file per run) · `registry.py` (ToolSpec: mechanism, reversibility, permission, landing_check callable; asserts on missing mechanism/landing check) · `policy.py` (RULES from bp.policyRules; irreversible→escalate; every decision traced) · `touchpoint.py` (single CLI validation stand-in; logs approve/veto/modify) · `memory.py` (sqlite episodic ledger + semantic w/ provenance + procedural from skills/) · `loop.py` (anthropic tool loop: max_iterations, token budget, exit taxonomy, tool errors as `is_error` results, landing check after every execute) · `evaluator.py` (separate model call, criteria from bp, hard thresholds, `did_it_act` deterministic from trace: no landed action → FAIL) · `harness.py` (wires all; system prompt = terminal contract + skills) · `src/tools.py` (one ToolSpec per bp.wiring entry with TODO mechanism + TODO landing check) · `src/main.py` (CLI entry).
CONTRACT: every generated .py compiles.
VERIFY: `node -e "import('./server/scaffold.js').then(async m=>{const r=await m.generateScaffold({agentName:'Smoke Test',verdict:'APPROVE',actionGapScore:80,wiring:[{step:'update record',mechanism:'API/REST',landingCheck:'id returned',reversibility:'reversible'}],policyRules:[{riskClass:'low',decision:'allow'}],evaluator:{criteria:['acted'],threshold:'all'},humanTouchpoint:{},poc:{},outcome:{}}, './generated');console.log(r.files.length,'files')})" && find generated -name "*.py" -exec python3 -m py_compile {} \; && echo PY-OK`

**S4 — README + polish.** README: setup, Cursor Simple Browser instructions (`Cmd+Shift+P → Simple Browser: Show → http://localhost:5173`), scaffolded-agent run guide, doctrine summary. Loading/error states everywhere; no console errors.
VERIFY: `npm run build && node --check server/index.js`

## C.6 · Engine blueprint schema (both modes; `gaps[]` audit-only)

```json
{"agentName":"str","verdict":"APPROVE|DEFER|REJECT","actionGapScore":0,
"subscores":{"friction":0,"timeToAction":0,"trust":0,"qualityGovernance":0},
"maturityState":"stagnation|narrow efficiency|POC purgatory|agentic ROI zone",
"outcome":{"metric":"","baseline":"","target":"","owner":""},
"pipeline":[{"label":"<=3 words","type":"insight|system|human|action","wired":true}],
"friction":[{"point":"","fix":""}],
"wiring":[{"step":"","mechanism":"","landingCheck":"","reversibility":"reversible|compensable|irreversible"}],
"policyRules":[{"riskClass":"","decision":"allow|block|escalate"}],
"humanTouchpoint":{"design":"","owner":"","detection":"","rollback":""},
"evaluator":{"criteria":["3-5 principle-based"],"threshold":""},
"kpis":[{"name":"","target":""}],
"poc":{"scope":"","sprintContract":"","duration":"","successMetric":"","killCriteria":"","scaleCriteria":"","reviewTrigger":""},
"gates":[{"id":1,"name":"<=5 words","pass":true}],
"antiPatterns":["..."],
"gaps":[{"gap":"","severity":"critical|major|minor","remediation":""}],
"nextAction":"one step executable today"}
```

Pipeline: 5–7 nodes, insight first, action last. Gates: exactly 12, §8 order. Engine responds minified JSON only, no fences, no prose.

## C.7 · Acceptance gates (the app audited by its own standard)

| # | Gate | Evidence |
|---|------|----------|
| 1 | `npm run dev` → app renders in Cursor Simple Browser at :5173 | screenshot/load |
| 2 | API key only in `.env`; grep of `src/` finds no `sk-ant` and no `api.anthropic.com` | grep output |
| 3 | BUILD run returns parseable v2 blueprint; all panels render | sample run |
| 4 | AUDIT run adds severity-colored gap ledger + anti-patterns | sample run |
| 5 | Missing-key state: readable error, no blank screen | kill .env test |
| 6 | Scaffold from APPROVE blueprint → generated project, all `.py` compile | py_compile |
| 7 | Generated agent enforces doctrine: landing checks, policy escalate on irreversible, evaluator FAILs when no action landed | code inspection |
| 8 | Model switchable via UI select; any model string accepted server-side | run with 2 models |

Report PASS/FAIL per gate. Any FAIL → fix before declaring done (no self-grading: show the command output as evidence).

---

*GAP/ZERO Agent Build Standard v2.1 (IDE build edition) · 2026-07-09 · Supersedes v2.0 by addition of Part C; Parts A–B normative content unchanged. Review trigger: first Studio build completes C.7, or next model generation (harness depreciation review §5), whichever first.*

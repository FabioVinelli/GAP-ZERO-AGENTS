## Part 1 — User guide: GAP/ZERO Studio

**Run it:** `npm run dev` in `GAP-ZERO-AGENTS/gapzero-studio 2/` → open `http://localhost:5173`. The header shows a red `● no API key (.env)` until you `cp .env.example .env` and add `ANTHROPIC_API_KEY` — without it, BUILD/AUDIT will error but the UI still loads.

### The three actions

**1. BUILD** — describe a use case in plain language → the engine returns a full v2.0 blueprint (score, gates, wiring, policy, PoC, etc.) and grades it against the standard itself.

**2. AUDIT** — paste an existing agent's spec/code summary → same blueprint schema, plus a severity-ranked gap ledger and detected anti-patterns.

**3. SCAFFOLD** — turns any blueprint into a runnable Python project under `generated/<slug>/` (harness, loop, actuation registry, policy engine, evaluator, PoC doc). The button works on any verdict, but it's visually flagged amber unless verdict is `APPROVE` — a nudge that gaps remain, not a hard block.

### Reading the results

| Element | What it tells you |
|---|---|
| **Action Gap Score** /100 + verdict chip | `APPROVE` ≥75 · `DEFER` 45–74 · `REJECT` <45 |
| **4 subscores** /25 each | friction · time-to-action · trust · quality+governance |
| **Insight→Action rail** | Diamond = human node. Solid line = wired. Dashed pulsing red = declared gap. |
| **12-gate grid** | ✓/✗ per certification gate (see list below) |
| **Gap ledger** (audit only) | severity-colored: critical/major/minor + remediation |
| **Wiring panel** | mechanism, landing check, reversibility per write action |
| **Policy panel** | allow/escalate/block per risk class |
| **PoC panel** | scope, kill criteria, scale criteria, review trigger |

Other controls: model dropdown (3 presets; the server accepts any model string via API, but the UI itself only exposes those three — say the word if you want a free-text option added), and a light/dark toggle in the header (persists via localStorage).

### The 12 gates (what your prompt needs to satisfy to hit APPROVE)

1 outcome+owner · 2 maturity classified · 3 pipeline typed+wired · 4 write-tools have mechanism+landing+reversibility · 5 policy engine logs every write · 6 terminal = action/handoff/block · 7 ≤1 human step, no middleware · 8 owner+detection+rollback named · 9 trace covers actuation+policy+validator · 10 separate evaluator w/ hard thresholds · 11 KPI standard + friction ≤1 · 12 PoC has sprint contract+kill+scale+review.

---

## Part 2 — Best prompt format

The engine's response schema is **fixed** (`server/engine.js`) — no matter what you ask for, it always returns the same JSON shape and renders it into the same panels. So the highest-leverage move is feeding it the specific facts each schema field needs, rather than describing desired *output structure*.

**BUILD template — fill every bracket, delete nothing:**

```
Agent: [one-line purpose]
Outcome metric: [the single number that must move] — baseline [X] → target [Y] by [deadline]
Owner: [named person/role accountable for this agent's errors]

Trigger / insight source: [what starts the loop, and cadence]
Steps insight → action (3-6): [step 1] → [step 2] → ... → [final action]

For each write/action step, give:
  - mechanism: API/REST | MCP | DB write | webhook | RPA/UI | file op | orchestrator
  - landing check: [deterministic proof the action actually happened]
  - reversibility: reversible | compensable | irreversible

Risk classes needing escalation vs auto-allow: [e.g. financial→escalate, read-only→allow]
Human touchpoint: [validation design] — owner [name], detection [how failures page them], rollback [per mechanism]
Evaluator criteria (3-5, pass/fail, checkable by someone who didn't build this): [...]
KPIs (max 4, decision quality first, not volume): [...]

PoC: scope [cycle-1 boundary] · duration [N runs or T time] · success metric [...] ·
kill criteria (pre-committed) [...] · scale criteria [...] · review trigger [...]
```

**AUDIT template:** paste the spec/code, then explicitly state what it currently detects, what it currently outputs, which systems it touches today, where a human sits in the loop today, and what KPIs (if any) it tracks. The more of these you supply, the fewer fields the engine has to guess — guessed fields are where DEFER verdicts and shallow gap ledgers come from.

---

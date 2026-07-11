# GAP/ZERO Studio — Agent Build Standard v2.0

Build, audit, and scaffold gap-free AI agents from a local web app running inside Cursor.

- **BUILD** — describe a use case → get a v2.0 blueprint: Action Gap Score, 4 subscores, maturity state, insight→action rail, 12 certification gates, policy rules, evaluator criteria, KPIs, closed-loop PoC, next action.
- **AUDIT** — paste an existing agent/project/spec → gap ledger by severity + anti-patterns + remediated blueprint.
- **SCAFFOLD** — one click turns an APPROVE blueprint into a runnable Python agent project under `generated/<agent-name>/` with all six GAP/ZERO layers wired: harness + memory, bounded loop with exit taxonomy, actuation registry with landing checks, policy engine, human touchpoint, separate evaluator, JSONL traces, and a PoC contract with kill criteria.

Model-agnostic: pick any Anthropic model in the header; the doctrine lives in the engine prompt, and scaffolds are plain Python you can point at any LLM.

## Setup (Cursor, macOS — runs fine on an i5/32GB iMac)

Requires Node 18+ (`node -v`; if missing: `brew install node`).

```bash
cd gapzero-studio
npm install
cp .env.example .env        # paste your ANTHROPIC_API_KEY
npm run dev                 # starts Express proxy (8787) + Vite (5173) together
```

Open the app **inside the Cursor editor window**:
1. `Cmd+Shift+P` → **Simple Browser: Show**
2. Enter `http://localhost:5173`

(Or open it in any external browser at the same URL.)

Your API key stays in `.env` on the server side — it never reaches the browser.

## Project layout

```
gapzero-studio/
├── server/
│   ├── index.js      Express proxy: /api/run (build|audit), /api/scaffold, /api/health
│   ├── engine.js     GAP/ZERO v2.0 system rules + JSON schema
│   └── scaffold.js   Python project generator (from blueprint JSON)
├── src/
│   ├── App.jsx       Studio UI (rail, gates, subscores, policy, evaluator, PoC)
│   └── main.jsx
├── generated/        Scaffolded agent projects land here (gitignored)
└── .env              ANTHROPIC_API_KEY, MODEL, PORT
```

## Launch & test agents from the Studio

Scaffolded agents can be smoke-tested without leaving the app. The left console shows a
**LAUNCH & TEST — GENERATED AGENTS** panel whenever `generated/` contains at least one
agent: pick the agent, give it a task, hit LAUNCH TEST RUN. The server creates the
agent's `.venv` on first run (takes a minute), injects the Studio's API key (never the
browser), runs `python -m src.main "<task>"`, and reports back the loop exit reason,
the separate evaluator's PASS/FAIL, whether any action actually landed, and the JSONL
trace path. Non-interactive runs auto-veto anything the policy engine escalates — no
validator present means no approval, per doctrine.

## Hermes export & GitHub transfer (test on another machine)

Every scaffold now includes a \`hermes/\` layer generated from the **same blueprint** as the
Python code, so the two runtimes cannot drift: \`.hermes.md\` (project doctrine), \`AGENTS.md\`
(Worker/Evaluator roster), \`HERMES_TEST.md\` (Tier 0–5 checklist + GitHub transfer commands +
pre-committed kill criteria), and one \`skills/<step>/SKILL.md\` per wiring entry.

Gap-free enforcement: \`/api/scaffold\` **rejects** any blueprint failing the completeness
validator (missing gates, owner, kill criteria, landing checks, …) — a declared GAP does not
ship. The UI shows the gap list right after a BUILD/AUDIT run. Authority order everywhere:
blueprint.json > .hermes.md > conversation; Python trace beats Hermes on any disagreement.

To move an agent to another machine, copy it out of \`generated/\` (which is gitignored here)
into its own repo — exact commands are in each agent's \`hermes/HERMES_TEST.md\`. The scaffold's
\`.gitignore\` already keeps \`.env\`, \`.venv/\`, and \`traces/\` out of git.

## Running a scaffolded agent manually

```bash
cd generated/<agent-name>
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # key for the agent's own loop + evaluator
python -m src.main "your task"
```

Then finish the `TODO`s in `src/tools.py` — real mechanisms and deterministic landing checks — and run the PoC per `poc.md`. A pilot without kill criteria is POC purgatory.

## Doctrine (what the engine enforces)

Insight must end in a landing-checked action · humans are endpoints, never middleware (max 1 validation step, named owner + rollback) · generator never grades its own work · policy engine gates every write · reports and dashboards are failure modes · KPIs measure decision quality, not volume · APPROVE ≥ 75/100 with all 12 gates, DEFER 45–74, REJECT < 45.

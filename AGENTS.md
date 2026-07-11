# AGENTS.md — GAP-ZERO-AGENT BUILDER & AUDITOR (local implementation)

> Project: `/Users/ko-firm/Agentic-Future/GAP-ZERO-AGENTS`
> Mission: build the local, runnable home of **GAP/ZERO — gap-free agent builder & auditor · insight must end in action.**
> You (Cursor Agent) are building an agent harness. Hold yourself to its own doctrine: every task you complete must end in a verified, runnable result — never a report of what you would do.

---

## 1. Source of truth — files already in this directory

Treat these as canonical. Do not rewrite their doctrine; wire around them.

| File | Role |
|---|---|
| `gap-free-agent-builder.jsx` | The frontend. Single React component (GapZero). This is the app's home screen. |
| `gapzero-system-prompt.md` | Orchestrator system prompt. Loaded at runtime, never hardcoded. |
| `gapzero-build-mode/SKILL.md` | Build Mode skill. Loaded at runtime per request. |
| `gapzero-audit-mode/SKILL.md` | Audit Mode skill. Loaded at runtime per request. |

Rule: the `.md` files are the single source of truth for engine behavior. If prompt logic needs to change, edit the `.md` files — never duplicate their text into JS constants. The inline `SYSTEM_RULES` constant currently inside the `.jsx` must be replaced by file loading (see §3).

## 2. Target architecture

Scaffold a Vite + React app with a thin local API layer:

```
GAP-ZERO-AGENTS/
├── AGENTS.md                      (this file)
├── gapzero-system-prompt.md       (existing — do not move)
├── gapzero-build-mode/SKILL.md    (existing)
├── gapzero-audit-mode/SKILL.md    (existing)
├── src/
│   ├── GapZero.jsx                (moved from gap-free-agent-builder.jsx, adapted per §3)
│   ├── main.jsx
│   └── lib/schema.js              (zod blueprint schema, shared client/server)
├── server/
│   ├── engine.js                  (POST /api/engine — the only place the API key is used)
│   └── runs.js                    (GET/POST /api/runs — persistence + score diffs)
├── runs/                          (gitignored; one JSON per engine run)
├── .env.example                   (ANTHROPIC_API_KEY= — committed)
├── .env                           (gitignored; KO fills the key in manually)
├── vite.config.js                 (proxy /api → localhost:8787)
└── package.json
```

Stack: `vite`, `react`, `express`, `zod`, `dotenv`, `@anthropic-ai/sdk`. Node 20+. No database, no auth, no Docker — this is a local single-operator tool. Block any scope beyond this list.

## 3. Implementation instructions

### 3.1 Frontend (`src/GapZero.jsx`)
- Port `gap-free-agent-builder.jsx` as-is: keep the design tokens, the insight→action Rail, the scoreboard, panels, and verdict chips. It is the approved UI.
- Change exactly one thing about its engine call: replace the direct `fetch("https://api.anthropic.com/v1/messages")` with `fetch("/api/engine", { method: "POST", body: JSON.stringify({ mode, input }) })`. Remove `SYSTEM_RULES` and `schemaFor` from the frontend — they move server-side.
- Add a **Runs** strip under the results column: fetch `/api/runs`, list prior runs (timestamp · agentName · mode · score · verdict), and when a run with the same agentName exists, show the score delta (e.g. `62 → 78 ▲16`). Re-audit improvement is the product's core loop; it must be visible.

### 3.2 Engine (`server/engine.js`)
- On each request: read `gapzero-system-prompt.md` + the SKILL.md matching `mode` (`build` → build-mode, `audit` → audit-mode) from disk, concatenate as the system prompt, append the JSON output contract from the skill's "Output format" section.
- Call Anthropic via `@anthropic-ai/sdk` with `process.env.ANTHROPIC_API_KEY`, model `claude-sonnet-4-6`, max_tokens 2000 (local has headroom; keep the terse-JSON instruction anyway).
- Validate the response against the zod schema in `src/lib/schema.js` (fields: agentName, verdict, actionGapScore, pipeline[], friction[], wiring[], humanTouchpoint, kpis[], poc, and gaps[]+subscores when mode=audit). On parse/validation failure: retry once with the validation error appended to the prompt; on second failure return 422 with the raw text so the UI can show a real error, not a silent fallback.
- Persist every successful run to `runs/<ISO-timestamp>-<mode>.json` (input, output, mode, model, duration ms).
- Never log or echo the API key. If `ANTHROPIC_API_KEY` is missing, return 503 with: "Add ANTHROPIC_API_KEY to .env" — do not prompt for the key, do not accept it via the UI.

### 3.3 IDE-leverage refinements (do these, they are in scope)
- `npm run dev` starts server + Vite concurrently; `npm run check` runs lint + zod schema unit test + a smoke test that boots the server and hits `/api/engine` with a mocked SDK.
- Create `.cursor/rules/gapzero.mdc` containing one rule: "Prompt/doctrine changes go in the .md skill files, never in JS strings. Every PR-sized change must pass `npm run check`."
- Git: init if absent; `.gitignore` must cover `.env`, `runs/`, `node_modules/`.

## 4. Verification loop — your definition of done

Do not report completion until all pass:
1. `npm install && npm run check` exits 0.
2. `npm run dev` serves the UI; both mode toggles render; missing-key state shows the 503 message cleanly.
3. With a key present: one Build run and one Audit run each produce a validated blueprint, render the Rail, and write a file into `runs/`.
4. A second Audit of the same agent shows a score delta in the Runs strip.

Kill criteria for this build: if the runtime skill-file loading cannot be made to work in under ~1 hour of effort, stop and flag — do not fall back to hardcoded prompt strings, that recreates the exact gap this tool exists to close.

## 5. Doctrine constraints on YOUR behavior (Cursor Agent)

- Every working session ends in a runnable state or an explicit block with the reason. No "next steps" lists without executed steps.
- Small irreversible steps: commit after each passing verification stage with message prefix `gapzero:`.
- Do not add features beyond §2–§3 (no auth, themes, deployment, extra pages). Flag the opportunity cost instead.
- If existing files referenced in §1 are missing from the directory, stop and ask KO to add them — do not regenerate them from memory.

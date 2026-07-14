# MCP Regression Results — 2026-07-14

Automated matrix from `node server/mcp-regression.mjs` (PR-D).

| Case | Result | Detail |
|------|--------|--------|
| probe: auto decision enabled | PASS | 4 wiring steps (>= 3); external mechanism: Environment fingerprint; external mechanism: File round-trip test; external mechanism: Structured echo test |
| probe: mcp tree present | PASS | 36 files |
| probe: harness file set unchanged vs force-off | PASS | 28 harness files match |
| one-tool: auto decision disabled | PASS | no auto MCP triggers |
| one-tool: no mcp files | PASS |  |
| h3: auto decision enabled | PASS | 4 wiring steps (>= 3); external mechanism: graph evidence retrieval; external mechanism: evidence bundle build; external mechanism: appeal draft generation; external mechanism: recovery action write-back |
| h3: write-back excluded from tools.include | PASS |  |
| h3: write-back in approval-gated section | PASS |  |
| h3: safe read tools in include | PASS |  |
| force-off: no mcp dir | PASS |  |
| override-wins: mcp on despite mcpRequired false | PASS |  |
| smoke: py_compile all .py | PASS |  |
| smoke: FastMCP import + registry tool count | PASS | tools 4 |
| smoke: tool count matches wiring | PASS | expected 4, got tools 4 |

## Manual follow-ups (operator)

1. **MCP Inspector** — `npx @modelcontextprotocol/inspector python mcp_server/server.py` inside probe agent dir after `pip install -r requirements.txt`
2. **Hermes Tier 4b** — paste `mcp-configs/hermes.config.yaml`, fix absolute paths, `/reload-mcp`, confirm `mcp_<server>_<tool>` discovery
3. **H3-IDRR** — re-scaffold from full blueprint in Studio; confirm write-back stays approval-gated in Hermes config

## Fixtures

- Hermes Transfer Probe: `GAP-ZERO-AGENTS/agents/hermes-transfer-probe-v1/blueprint.json` (loaded via `PROBE_BP_PATH` in `server/mcp-regression.mjs` — **must exist on the machine running `npm run test:mcp`**; it is the transferred agent copy, not under `generated/`)
- H3-style: inline fixture in `server/mcp-regression.mjs` (4 wiring steps, `requiresApproval` on write-back)

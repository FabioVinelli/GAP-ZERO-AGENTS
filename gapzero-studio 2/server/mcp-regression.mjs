#!/usr/bin/env node
/**
 * MCP scaffolding regression matrix (PR-D).
 * Run: node server/mcp-regression.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deriveMcpDecision } from "./engine.js";
import { generateScaffold, mcpToolNames } from "./scaffold.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROBE_BP_PATH = path.resolve(ROOT, "../agents/hermes-transfer-probe-v1/blueprint.json");

const HARNESS_PREFIXES = ["src/", "hermes/", "skills/", "blueprint.json", "poc.md", "requirements.txt", "README.md", ".env.example", ".gitignore"];

const MCP_PATH_PREFIXES = ["mcp_server/", "mcp-configs/", "MCP_DEPLOY.md"];

function harnessFiles(files) {
  return files.filter((f) => HARNESS_PREFIXES.some((p) => f === p || f.startsWith(p)) && !MCP_PATH_PREFIXES.some((m) => f.startsWith(m)));
}

function hasMcpTree(files) {
  return MCP_PATH_PREFIXES.every((prefix) => files.some((f) => f === prefix || f.startsWith(prefix)));
}

function run(cmd, args, opts, timeoutMs = 120000) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    const t = setTimeout(() => {
      p.kill("SIGKILL");
      resolve({ code: -1, out, err: err + "\nTIMEOUT", timedOut: true });
    }, timeoutMs);
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => {
      clearTimeout(t);
      resolve({ code: -1, out, err: err + e.message, timedOut: false });
    });
    p.on("close", (code) => {
      clearTimeout(t);
      resolve({ code, out, err, timedOut: false });
    });
  });
}

async function loadProbeBlueprint() {
  return JSON.parse(await fs.readFile(PROBE_BP_PATH, "utf8"));
}

function oneToolBlueprint() {
  return {
    agentName: "One Tool Read Agent",
    verdict: "APPROVE",
    actionGapScore: 80,
    subscores: { friction: 20, timeToAction: 20, trust: 20, qualityGovernance: 20 },
    maturityState: "pilot",
    outcome: { metric: "reads", baseline: "0", target: "1", owner: "test" },
    pipeline: [
      { label: "insight", type: "insight", wired: true },
      { label: "read", type: "action", wired: true },
    ],
    friction: [],
    wiring: [{ step: "fetch status", mechanism: "orchestrator", landingCheck: "status ok", reversibility: "reversible" }],
    policyRules: [{ riskClass: "low", decision: "allow" }],
    humanTouchpoint: { design: "cli", owner: "test", detection: "trace", rollback: "none" },
    evaluator: { criteria: ["Action landed"], threshold: "all pass" },
    kpis: [],
    poc: {
      scope: "one read",
      sprintContract: "1 run",
      duration: "1d",
      successMetric: "1 read",
      killCriteria: "fail",
      scaleCriteria: "pass",
      reviewTrigger: "after 1",
    },
    gates: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `G${i + 1}`, pass: true })),
    antiPatterns: [],
    nextAction: "smoke",
  };
}

function h3StyleBlueprint() {
  return {
    agentName: "H3 IDRR Regression Fixture",
    verdict: "APPROVE",
    actionGapScore: 88,
    subscores: { friction: 22, timeToAction: 22, trust: 22, qualityGovernance: 22 },
    maturityState: "agentic ROI zone",
    outcome: { metric: "appeal drafts approved", baseline: "0%", target: "60%", owner: "Ko" },
    pipeline: [
      { label: "denial", type: "insight", wired: true },
      { label: "retrieve", type: "action", wired: true },
      { label: "bundle", type: "action", wired: true },
      { label: "draft", type: "action", wired: true },
      { label: "write-back", type: "action", wired: true },
    ],
    friction: [],
    wiring: [
      { step: "graph evidence retrieval", mechanism: "MCP", landingCheck: "rows + node ids", reversibility: "reversible" },
      { step: "evidence bundle build", mechanism: "file op", landingCheck: "bundle hash", reversibility: "reversible" },
      { step: "appeal draft generation", mechanism: "file op", landingCheck: "draft exists", reversibility: "reversible" },
      {
        step: "recovery action write-back",
        mechanism: "MCP",
        landingCheck: "read confirms node",
        reversibility: "reversible",
        requiresApproval: true,
      },
    ],
    policyRules: [
      { riskClass: "low", decision: "allow" },
      { riskClass: "requires-validator-approval", decision: "escalate" },
    ],
    humanTouchpoint: { design: "single approval", owner: "Ko", detection: "PHI scan", rollback: "DETACH DELETE run_id" },
    evaluator: { criteria: ["Cited assertions", "No PHI", "Write confirmed"], threshold: "any fail fails run" },
    kpis: [],
    poc: {
      scope: "one payer class",
      sprintContract: "10 drafts",
      duration: "2w",
      successMetric: "60% approved",
      killCriteria: "PHI hit",
      scaleCriteria: "metric met",
      reviewTrigger: "20 runs",
    },
    gates: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `G${i + 1}`, pass: true })),
    antiPatterns: [],
    nextAction: "wire Neo4j MCP",
  };
}

async function pyCompileAgent(agentDir) {
  const r = await run("find", [".", "-name", "*.py", "-exec", "python3", "-m", "py_compile", "{}", ";"], { cwd: agentDir }, 60000);
  return r.code === 0 ? { ok: true } : { ok: false, error: r.err || r.out };
}

async function mcpImportSmoke(agentDir) {
  const py = path.join(agentDir, ".venv/bin/python");
  const pip = path.join(agentDir, ".venv/bin/pip");
  if (!(await exists(py))) {
    const v = await run("python3", ["-m", "venv", ".venv"], { cwd: agentDir });
    if (v.code !== 0) return { ok: false, error: "venv failed" };
  }
  const pipR = await run(pip, ["install", "-q", "-r", "requirements.txt"], { cwd: agentDir }, 180000);
  if (pipR.code !== 0) return { ok: false, error: "pip install failed: " + pipR.err.slice(0, 500) };
  const importR = await run(
    py,
    [
      "-c",
      "import sys; sys.path.insert(0, '.'); from mcp.server.fastmcp import FastMCP; import mcp_server.server as s; print('tools', len(s._build_registry().tools))",
    ],
    { cwd: agentDir },
    30000,
  );
  return importR.code === 0
    ? { ok: true, detail: importR.out.trim() }
    : { ok: false, error: (importR.err || importR.out).slice(0, 800) };
}

const exists = (p) => fs.access(p).then(() => true, () => false);

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  const tmp = await fs.mkdtemp(path.join(ROOT, ".mcp-regression-"));
  console.log(`Regression workspace: ${tmp}\n`);

  // Case 1: Hermes Transfer Probe — auto → MCP yes
  const probe = await loadProbeBlueprint();
  const probeAuto = deriveMcpDecision(probe);
  record("probe: auto decision enabled", probeAuto.enabled, probeAuto.reasons.join("; "));
  const probeOut = await generateScaffold(probe, tmp, { mcpEnabled: "auto" });
  record("probe: mcp tree present", hasMcpTree(probeOut.files), `${probeOut.files.length} files`);
  const probeHarnessOnly = harnessFiles(probeOut.files);
  const probeOff = await generateScaffold(probe, path.join(tmp, "probe-off"), { mcpEnabled: false });
  record(
    "probe: harness file set unchanged vs force-off",
    JSON.stringify(harnessFiles(probeOff.files).sort()) === JSON.stringify(probeHarnessOnly.sort()),
    `${probeHarnessOnly.length} harness files match`,
  );

  // Case 2: 1-tool read agent — auto → MCP no
  const oneTool = oneToolBlueprint();
  const oneAuto = deriveMcpDecision(oneTool);
  record("one-tool: auto decision disabled", !oneAuto.enabled, oneAuto.reasons.join("; "));
  const oneOut = await generateScaffold(oneTool, tmp, { mcpEnabled: "auto" });
  record("one-tool: no mcp files", !oneOut.files.some((f) => f.startsWith("mcp") || f === "MCP_DEPLOY.md"));

  // Case 3: H3-style — auto yes; write-back gated in Hermes config
  const h3 = h3StyleBlueprint();
  const h3Auto = deriveMcpDecision(h3);
  record("h3: auto decision enabled", h3Auto.enabled, h3Auto.reasons.join("; "));
  const h3Out = await generateScaffold(h3, tmp, { mcpEnabled: "auto" });
  const hermesYaml = await fs.readFile(path.join(h3Out.dir, "mcp-configs/hermes.config.yaml"), "utf8");
  const deployMd = await fs.readFile(path.join(h3Out.dir, "MCP_DEPLOY.md"), "utf8");
  const writeBackSlug = "recovery_action_write_back";
  record("h3: write-back excluded from tools.include", !hermesYaml.includes(writeBackSlug));
  record("h3: write-back in approval-gated section", deployMd.includes(writeBackSlug) || deployMd.includes("recovery action write-back"));
  record("h3: safe read tools in include", hermesYaml.includes("graph_evidence_retrieval"));

  // Case 4: Force off
  record("force-off: no mcp dir", !probeOff.mcp && !probeOff.files.some((f) => f.startsWith("mcp_server")));

  // Case 5: Override wins
  const overrideBp = { ...probe, mcpRequired: false };
  const overrideOut = await generateScaffold(overrideBp, tmp, { mcpEnabled: true });
  record("override-wins: mcp on despite mcpRequired false", overrideOut.mcp && hasMcpTree(overrideOut.files));

  // Smoke: py_compile + MCP import on probe scaffold
  const compileR = await pyCompileAgent(probeOut.dir);
  record("smoke: py_compile all .py", compileR.ok, compileR.error);
  const importR = await mcpImportSmoke(probeOut.dir);
  record("smoke: FastMCP import + registry tool count", importR.ok, importR.detail || importR.error);
  if (importR.ok) {
    const expected = mcpToolNames(probe.wiring).length;
    record("smoke: tool count matches wiring", importR.detail.includes(String(expected)), `expected ${expected}, got ${importR.detail}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.error("\nFailed cases:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.detail || ""}`));
    process.exit(1);
  }

  // Write results doc
  const docPath = path.join(ROOT, "docs/MCP-REGRESSION-RESULTS.md");
  const stamp = new Date().toISOString().slice(0, 10);
  const body = `# MCP Regression Results — ${stamp}

Automated matrix from \`node server/mcp-regression.mjs\` (PR-D).

| Case | Result | Detail |
|------|--------|--------|
${results.map((r) => `| ${r.name} | ${r.pass ? "PASS" : "FAIL"} | ${(r.detail || "").replace(/\|/g, "\\|")} |`).join("\n")}

## Manual follow-ups (operator)

1. **MCP Inspector** — \`npx @modelcontextprotocol/inspector python mcp_server/server.py\` inside probe agent dir after \`pip install -r requirements.txt\`
2. **Hermes Tier 4b** — paste \`mcp-configs/hermes.config.yaml\`, fix absolute paths, \`/reload-mcp\`, confirm \`mcp_<server>_<tool>\` discovery
3. **H3-IDRR** — re-scaffold from full blueprint in Studio; confirm write-back stays approval-gated in Hermes config

## Fixtures

- Hermes Transfer Probe: \`GAP-ZERO-AGENTS/agents/hermes-transfer-probe-v1/blueprint.json\`
- H3-style: inline fixture in \`server/mcp-regression.mjs\` (4 wiring steps, \`requiresApproval\` on write-back)
`;
  await fs.writeFile(docPath, body, "utf8");
  console.log(`\nWrote ${docPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// GAP/ZERO agent test runner: launches a scaffolded agent from generated/
// inside its own venv and reports the run per the loop's exit taxonomy.
// The Studio's API key is injected into the child env — it never touches the browser.

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export async function listAgents(genRoot) {
  let entries;
  try {
    entries = await fs.readdir(genRoot, { withFileTypes: true });
  } catch {
    return [];
  }
  const agents = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(genRoot, e.name);
    try {
      const bp = JSON.parse(await fs.readFile(path.join(dir, "blueprint.json"), "utf8"));
      agents.push({
        name: e.name,
        agentName: bp.agentName || e.name,
        verdict: bp.verdict || "UNKNOWN",
        score: bp.actionGapScore ?? null,
        ready: await exists(path.join(dir, ".venv", "bin", "python")),
      });
    } catch {
      // no blueprint.json → not a scaffolded agent, skip
    }
  }
  return agents;
}

const exists = (p) => fs.access(p).then(() => true, () => false);

function run(cmd, args, opts, timeoutMs) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "", timedOut = false;
    const t = setTimeout(() => { timedOut = true; p.kill("SIGKILL"); }, timeoutMs);
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => { clearTimeout(t); resolve({ code: -1, out, err: err + e.message, timedOut }); });
    p.on("close", (code) => { clearTimeout(t); resolve({ code, out, err, timedOut }); });
  });
}

const tail = (s, n = 8000) => (s.length > n ? "…" + s.slice(-n) : s);

export async function runAgentTest(agentDir, task, env) {
  const py = path.join(agentDir, ".venv", "bin", "python");
  const pip = path.join(agentDir, ".venv", "bin", "pip");
  const steps = [];

  if (!(await exists(py))) {
    let r = await run("python3", ["-m", "venv", ".venv"], { cwd: agentDir }, 120000);
    steps.push({ step: "create venv", code: r.code });
    if (r.code !== 0) return { ok: false, steps, error: "venv creation failed", output: tail(r.err || r.out) };
    r = await run(pip, ["install", "-q", "-r", "requirements.txt"], { cwd: agentDir }, 300000);
    steps.push({ step: "pip install", code: r.code });
    if (r.code !== 0) return { ok: false, steps, error: "pip install failed", output: tail(r.err || r.out) };
  }

  const started = Date.now();
  const r = await run(py, ["-m", "src.main", task], {
    cwd: agentDir,
    env: { ...process.env, ...env, PYTHONUNBUFFERED: "1" },
  }, 240000);
  const output = r.out + (r.err ? "\n--- stderr ---\n" + r.err : "");

  // main.py prints: exit: …, eval verdict: … | did_it_act: …, trace: …
  const exit = /exit:\s*(\S+)/.exec(r.out)?.[1] ?? (r.timedOut ? "timeout" : null);
  const verdict = /eval verdict:\s*(\w+)/.exec(r.out)?.[1] ?? null;
  const didAct = /did_it_act:\s*(\w+)/.exec(r.out)?.[1] === "True";
  const trace = /trace:\s*(\S+)/.exec(r.out)?.[1] ?? null;

  return {
    ok: r.code === 0 && verdict !== null,
    exit, verdict, didAct, trace, steps,
    durationMs: Date.now() - started,
    output: tail(output),
  };
}

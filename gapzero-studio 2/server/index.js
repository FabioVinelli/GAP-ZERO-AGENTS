import dotenv from "dotenv";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SYSTEM_RULES_V2, schemaFor, buildTask, parseEngineJSON, validateBlueprint, deriveMcpDecision, collectMcpWarnings } from "./engine.js";
import { generateScaffold } from "./scaffold.js";
import { listAgents, runAgentTest } from "./runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });
const PORT = process.env.PORT || 8787;

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.MODEL || "claude-sonnet-4-6",
  });
});

// ---- Build / Audit engine run (key stays server-side) ----
async function callEngine(model, mode, messages) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      system: SYSTEM_RULES_V2 + "\n" + schemaFor(mode),
      messages,
    }),
  });
  const raw = await r.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("Anthropic returned a non-JSON response"), { status: 502 });
  }
  if (!r.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || `Anthropic HTTP ${r.status}`), { status: 502 });
  }
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  if (!text.trim()) throw Object.assign(new Error("Empty engine response from Anthropic"), { status: 502 });
  return { data, text };
}

app.post("/api/run", async (req, res) => {
  const { mode, input, model } = req.body || {};
  if (!["build", "audit"].includes(mode) || !input?.trim()) {
    return res.status(400).json({ error: "mode must be build|audit and input non-empty" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY missing. Copy .env.example to .env and set it." });
  }
  const modelId = model || process.env.MODEL || "claude-sonnet-4-6";
  const messages = [{ role: "user", content: buildTask(mode, input) }];
  try {
    let { data, text } = await callEngine(modelId, mode, messages);
    let blueprint;
    try {
      blueprint = parseEngineJSON(text);
    } catch (e) {
      const hint = data.stop_reason === "max_tokens" ? " Response was truncated — shorten the spec and retry." : "";
      return res.status(502).json({ error: `Could not parse engine JSON: ${e.message}.${hint}` });
    }
    // Auto-repair: an incomplete blueprint is recoverable data, not a final answer.
    // One corrective round-trip with the validator's gap list, then re-validate.
    let warnings = validateBlueprint(blueprint);
    let repaired = false;
    if (warnings.length) {
      messages.push(
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            `VALIDATION FAILED — your JSON is missing required fields:\n- ${warnings.join("\n- ")}\n` +
            `Respond again with the COMPLETE minified JSON object. Every schema field is mandatory: ` +
            `gates (exactly 12, standard order), antiPatterns (array, may be empty), nextAction, ` +
            `pipeline starting with an insight node and ending with an action node. No fences, no prose.`,
        },
      );
      try {
        const second = await callEngine(modelId, mode, messages);
        const secondBp = parseEngineJSON(second.text);
        const secondWarnings = validateBlueprint(secondBp);
        if (secondWarnings.length < warnings.length) {
          blueprint = secondBp;
          warnings = secondWarnings;
          data = second.data;
          repaired = true;
        }
      } catch {
        // repair attempt failed — return the first blueprint with its warnings
      }
    }
    res.json({
      blueprint,
      warnings,
      mcpWarnings: collectMcpWarnings(blueprint),
      mcpRecommendation: deriveMcpDecision(blueprint),
      repaired,
      usage: data.usage || null,
      stopReason: data.stop_reason || null,
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: `Engine run failed: ${e.message}. Shorten the spec and retry.` });
  }
});

// ---- Scaffold: emit a full GAP/ZERO Python agent project from an approved blueprint ----
app.post("/api/scaffold", async (req, res) => {
  const { blueprint, mcpEnabled = "auto" } = req.body || {};
  if (!blueprint?.agentName) return res.status(400).json({ error: "blueprint with agentName required" });
  const gaps = validateBlueprint(blueprint);
  if (gaps.length) {
    return res.status(400).json({
      error: `Blueprint is not gap-free — scaffold blocked (a declared GAP does not ship). ${gaps.length} gap(s): ${gaps.slice(0, 3).join(" · ")}${gaps.length > 3 ? " · …" : ""}. Re-run BUILD until complete.`,
      gaps,
    });
  }
  try {
    const generatedRoot = path.join(ROOT, "generated");
    const result = await generateScaffold(blueprint, generatedRoot, { mcpEnabled });
    if (result.mcp) {
      result.mcpSnippets = {
        hermes: await fs.readFile(path.join(result.dir, "mcp-configs/hermes.config.yaml"), "utf8"),
        cursor: await fs.readFile(path.join(result.dir, "mcp-configs/cursor-mcp.json"), "utf8"),
      };
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: `Scaffold failed: ${e.message}` });
  }
});

// ---- Launch & test scaffolded agents (same environment as the Studio) ----
app.get("/api/agents", async (_req, res) => {
  res.json({ agents: await listAgents(path.join(ROOT, "generated")) });
});

app.post("/api/agents/test", async (req, res) => {
  const { name, task, model } = req.body || {};
  const agents = await listAgents(path.join(ROOT, "generated"));
  const agent = agents.find((a) => a.name === name); // whitelist: no path traversal
  if (!agent) return res.status(400).json({ error: `Unknown agent "${name}". Scaffold one first.` });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY missing. Copy .env.example to .env and set it." });
  }
  try {
    const result = await runAgentTest(path.join(ROOT, "generated", name), task?.trim() || "Run a smoke test of the pipeline.", {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      MODEL: model || process.env.MODEL || "claude-sonnet-4-6",
      EVALUATOR_MODEL: process.env.EVALUATOR_MODEL || "claude-haiku-4-5-20251001",
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: `Test run failed: ${e.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`GAP/ZERO engine proxy on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn("WARNING: ANTHROPIC_API_KEY not set — /api/run will fail.");
});

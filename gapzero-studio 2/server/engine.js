// GAP/ZERO AGENT BUILD STANDARD v2.0 — engine prompt + response schema.
// Model-agnostic: any model string works; the doctrine lives in the prompt, not the model.

export const SYSTEM_RULES_V2 = `You are GAP/ZERO v2.0, an agent harness engine enforcing the GAP/ZERO AGENT BUILD STANDARD v2.0.
Doctrine (Craig Le Clair / Forrester "Agentic Action Gap" + Anthropic harness design + loop engineering):
- Intelligence without actuation is worthless. Every insight must be wired to an executed, landing-checked action.
- Friction = unintegrated systems + humans needed to act on an insight. Target 0-1 unresolved manual handoffs.
- Humans are endpoints, never middleware. Max ONE final validation step, with named owner, error detection, rollback.
- Reports and dashboards are failure modes. Terminal node = executed action | validated handoff | explicit block.
- Generator NEVER evaluates its own work: a separate skeptical evaluator with principle-based, hard-threshold criteria is mandatory.
- Policy engine gates every write pre-execution: allow | block | escalate. High-risk (financial, health, legal, irreversible) always escalates.
- Loop mechanics: max iterations, token/cost budget, exit taxonomy (task-complete | max-iterations | budget-exhausted | paused | error), tool errors returned as recoverable data.
- KPIs: decision quality, time-from-insight-to-action, unmodified acceptance rate, outcome delta. Volume metrics only as denominators.
- Every blueprint ships a closed-loop PoC: sprint contract, kill criteria, scale criteria, review trigger. No kill criteria = POC purgatory.
- Classify maturity: stagnation | narrow efficiency | POC purgatory | agentic ROI zone.
- Never invent integrations: unknown mechanism = GAP, not wired.
- The 12 certification gates: 1 outcome contract+owner, 2 maturity classified, 3 pipeline fully typed/wired, 4 write-tools have mechanism+landing check+reversibility, 5 policy engine logs every write decision, 6 terminal node is action/handoff/block, 7 <=1 human validation + no middleware, 8 owner+detection+rollback named, 9 trace covers actuation+policy+validator, 10 separate evaluator w/ hard thresholds, 11 KPI standard + friction <=1, 12 PoC has sprint contract+kill+scale+review.
- Verdict: APPROVE (score>=75, all critical gates pass) | DEFER (45-74 or any critical gap; state opportunity cost) | REJECT (<45, no outcome, or report-only output).
- Set mcpRequired:true when wiring has 3+ steps or external mechanisms (API/REST, MCP, DB write, webhook, RPA/UI, file op). Optional wiring.requiresApproval for validator-gated reversible writes.
Respond ONLY with minified JSON. No markdown fences, no prose. Terse phrases, not sentences.`;

const EXTERNAL_MECHANISM = /API\/REST|MCP|DB write|webhook|RPA\/UI|file op/i;
const APPROVAL_RISK_CLASS = "requires-validator-approval";

export const schemaFor = (mode) => `JSON schema (all fields required unless noted):
{"agentName":str,"verdict":"APPROVE"|"DEFER"|"REJECT","actionGapScore":0-100,
"subscores":{"friction":0-25,"timeToAction":0-25,"trust":0-25,"qualityGovernance":0-25},
"maturityState":"stagnation"|"narrow efficiency"|"POC purgatory"|"agentic ROI zone",
"outcome":{"metric":str,"baseline":str,"target":str,"owner":str},
"pipeline":[{"label":str(<=3 words),"type":"insight"|"system"|"human"|"action","wired":bool}] (5-7 nodes, insight first, action last),
"friction":[{"point":str,"fix":str}] (max 4),
"wiring":[{"step":str,"mechanism":str,"landingCheck":str,"reversibility":"reversible"|"compensable"|"irreversible","requiresApproval":bool?}] (max 4),
"mcpRequired":bool? (optional; true=force MCP scaffold, false=skip, omit=auto),
"platformConstraints":{"wsl2":bool?,"remoteBackend":bool?,"restrictedFilesystem":bool?} (optional),
"mcpReusable":bool? (optional),
"policyRules":[{"riskClass":str,"decision":"allow"|"block"|"escalate"}] (max 4),
"humanTouchpoint":{"design":str,"owner":str,"detection":str,"rollback":str},
"evaluator":{"criteria":[str] (3-5 principle-based gradable criteria),"threshold":str},
"kpis":[{"name":str,"target":str}] (max 4: decision quality, time-to-action, unmodified acceptance, outcome delta),
"poc":{"scope":str,"sprintContract":str,"duration":str,"successMetric":str,"killCriteria":str,"scaleCriteria":str,"reviewTrigger":str},
"gates":[{"id":1-12,"name":str(<=5 words),"pass":bool}] (exactly 12, in standard order),
"antiPatterns":[str] (detected: report factory, human middleware, POC purgatory, rubber stamp, volume theater, assumed wiring, self-grading generator, runaway loop, stale scaffolding — or empty),
${mode === "audit" ? `"gaps":[{"gap":str,"severity":"critical"|"major"|"minor","remediation":str}] (max 5),` : ""}
"nextAction":str (one concrete step executable today)}`;

export function buildTask(mode, input) {
  return mode === "build"
    ? `BUILD MODE. Design a gap-free agent blueprint per GAP/ZERO Standard v2.0 for this use case:\n${input}`
    : `AUDIT MODE. Audit this existing agent/project/spec against GAP/ZERO Standard v2.0 (score the 4 rubric dimensions, ledger gaps by severity, detect anti-patterns) and produce the remediated blueprint:\n${input}`;
}

// Blueprint completeness validator — a blueprint with gaps does not ship (scaffold blocked).
// Returns [] when gap-free; otherwise a list of declared gaps mapped to the standard's gates.
export function validateBlueprint(bp) {
  const gaps = [];
  if (!bp?.agentName) gaps.push("agentName missing");
  if (!["APPROVE", "DEFER", "REJECT"].includes(bp?.verdict)) gaps.push("verdict missing or invalid");
  if (!bp?.outcome?.metric) gaps.push("outcome.metric missing (L0: no nameable outcome, build stops)");
  if (!bp?.outcome?.owner) gaps.push("outcome.owner missing (gate 1: no named owner)");
  if (!Array.isArray(bp?.pipeline) || bp.pipeline.length < 2) {
    gaps.push("pipeline missing or too short (gate 3)");
  } else {
    if (bp.pipeline[0]?.type !== "insight") gaps.push("pipeline must start with an insight node");
    if (bp.pipeline[bp.pipeline.length - 1]?.type !== "action") gaps.push("pipeline must end with an action node (terminal contract)");
  }
  if (!(bp?.wiring || []).length) gaps.push("wiring empty — no actuation declared (gate 4)");
  (bp?.wiring || []).forEach((w, i) => {
    if (!w.mechanism) gaps.push(`wiring "${w.step || i}": mechanism missing (gate 4)`);
    if (!w.landingCheck) gaps.push(`wiring "${w.step || i}": landing check missing (gate 4)`);
    if (!["reversible", "compensable", "irreversible"].includes(w.reversibility)) gaps.push(`wiring "${w.step || i}": reversibility missing (gate 4)`);
  });
  if (!(bp?.policyRules || []).length) gaps.push("policyRules empty (gate 5: policy engine gates every write)");
  if (!bp?.humanTouchpoint?.owner) gaps.push("humanTouchpoint.owner missing (gate 8)");
  if (!bp?.humanTouchpoint?.rollback) gaps.push("humanTouchpoint.rollback missing (gate 8: no rollback → no write permissions)");
  if (!(bp?.evaluator?.criteria || []).length) gaps.push("evaluator.criteria empty (gate 10: separate evaluator)");
  if (!bp?.evaluator?.threshold) gaps.push("evaluator.threshold missing (gate 10)");
  if (!bp?.poc?.killCriteria) gaps.push("poc.killCriteria missing (no kill criteria = POC purgatory)");
  if (!Array.isArray(bp?.gates) || bp.gates.length !== 12) gaps.push(`gates must be exactly 12, got ${(bp?.gates || []).length} (certification incomplete)`);
  if (!Array.isArray(bp?.antiPatterns)) gaps.push("antiPatterns missing (empty array is valid; absent is not)");
  if (!bp?.nextAction) gaps.push("nextAction missing");
  return gaps;
}

/** Non-blocking MCP / approval warnings (separate from validateBlueprint gaps). */
export function collectMcpWarnings(bp) {
  const warnings = [];
  const rules = bp?.policyRules || [];
  (bp?.wiring || []).forEach((w, i) => {
    if (!w.requiresApproval) return;
    if (w.reversibility === "irreversible") return;
    const covered = rules.some(
      (r) =>
        r.decision === "escalate" &&
        (r.riskClass === APPROVAL_RISK_CLASS ||
          /validator approval|requires approval/i.test(String(r.riskClass || "")))
    );
    if (!covered) {
      warnings.push(
        `wiring "${w.step || i}": requiresApproval set but no escalate policy for ${APPROVAL_RISK_CLASS}`
      );
    }
  });
  return warnings;
}

function autoMcpReasons(bp) {
  const reasons = [];
  const wiring = bp?.wiring || [];
  if (wiring.length >= 3) reasons.push(`${wiring.length} wiring steps (>= 3)`);
  wiring.forEach((w) => {
    if (EXTERNAL_MECHANISM.test(String(w.mechanism || ""))) {
      reasons.push(`external mechanism: ${w.step || w.mechanism}`);
    }
  });
  const pc = bp?.platformConstraints || {};
  if (pc.wsl2) reasons.push("platformConstraints.wsl2");
  if (pc.remoteBackend) reasons.push("platformConstraints.remoteBackend");
  if (pc.restrictedFilesystem) reasons.push("platformConstraints.restrictedFilesystem");
  if (bp?.mcpReusable === true) reasons.push("mcpReusable flag");
  return reasons;
}

/**
 * Decide whether MCP server scaffolding should be generated.
 * userOverride: true | false | "auto" (default)
 */
export function deriveMcpDecision(bp, userOverride = "auto") {
  if (userOverride === true) {
    return { enabled: true, reasons: ["user override: force MCP on"] };
  }
  if (userOverride === false) {
    return { enabled: false, reasons: ["user override: force MCP off"] };
  }
  if (bp?.mcpRequired === true) {
    return { enabled: true, reasons: ["blueprint mcpRequired: true"] };
  }
  if (bp?.mcpRequired === false) {
    return { enabled: false, reasons: ["blueprint mcpRequired: false"] };
  }
  const reasons = autoMcpReasons(bp);
  return { enabled: reasons.length > 0, reasons: reasons.length ? reasons : ["no auto MCP triggers"] };
}

// Robust JSON extraction: strip fences, then parse the first balanced JSON object.
export function parseEngineJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  if (start === -1) throw new Error("No JSON object in engine response");

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < clean.length; i++) {
    const ch = clean[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(clean.slice(start, i + 1));
    }
  }
  throw new Error("Incomplete JSON object in engine response");
}

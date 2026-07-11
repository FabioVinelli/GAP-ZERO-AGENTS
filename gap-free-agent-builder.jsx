import React, { useState } from "react";

// ---------- Design tokens ----------
const T = {
  paper: "#ECF0F1",
  panel: "#FFFFFF",
  ink: "#0F1E26",
  slate: "#5A6B75",
  line: "#CBD5DA",
  action: "#0B7A6B",
  actionSoft: "#E0F0ED",
  gap: "#C22B1F",
  gapSoft: "#F9E7E4",
  defer: "#9A6A12",
  deferSoft: "#F5ECD8",
};

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
@keyframes railpulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes rise { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none; } }
.rise { animation: rise .35s ease both; }
textarea:focus, input:focus, button:focus-visible { outline: 2px solid ${T.action}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .rise, .pulse { animation: none !important; } }
`;

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const disp = { fontFamily: "'Archivo', sans-serif" };

// ---------- Prompt ----------
const SYSTEM_RULES = `You are GAP/ZERO, an agent harness engine built on Forrester's "Agentic Action Gap" doctrine (Craig Le Clair):
- Intelligence without actuation is worthless. Every insight must be wired to an executed action.
- Friction = count of unintegrated systems + humans needed to act on an insight. Minimize it.
- Measure: friction count, time-from-insight-to-action, % recommendations executed unmodified (trust), decision QUALITY over volume.
- Humans must not be middleware. Design agents that orchestrate execution, pausing humans only at a final validation step — but preserve accountability, error recovery, and contextual expertise (the Le Clair blindspots).
- Reports and dashboards are failure modes. Outputs must trigger workflows.
- Every blueprint needs governance (who is accountable when the agent acts wrongly), a PoC with kill/scale criteria, and a review trigger.
Respond ONLY with minified JSON, no markdown fences, no prose. Be terse: short phrases, not sentences, so the full JSON fits your token budget.`;

const schemaFor = (mode) => `JSON schema:
{"agentName":str,"verdict":"APPROVE"|"DEFER"|"REJECT","actionGapScore":0-100 (100 = zero gap, fully wired),
"pipeline":[{"label":str(<=3 words),"type":"insight"|"system"|"human"|"action","wired":bool}] (5-7 nodes, insight first, action last),
"friction":[{"point":str,"fix":str}] (max 4),
"wiring":[{"step":str,"mechanism":str}] (max 4),
"humanTouchpoint":{"design":str,"accountability":str},
"kpis":[{"name":str,"target":str}] (max 4, decision-quality biased),
"poc":{"scope":str,"duration":str,"successMetric":str,"killCriteria":str,"reviewTrigger":str}${
  mode === "audit" ? `,\n"gaps":[{"gap":str,"severity":"critical"|"major"|"minor","remediation":str}] (max 5)` : ""
}}`;

// ---------- API call ----------
async function runEngine(mode, input, setState) {
  setState({ status: "loading", data: null, error: null });
  const task =
    mode === "build"
      ? `BUILD MODE. Design a gap-free agent blueprint for this use case:\n${input}`
      : `AUDIT MODE. Audit this existing agent/framework spec for action gaps and produce a remediated blueprint:\n${input}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_RULES + "\n" + schemaFor(mode),
        messages: [{ role: "user", content: task }],
      }),
    });
    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    setState({ status: "done", data: parsed, error: null });
  } catch (e) {
    setState({ status: "error", data: null, error: "Engine run failed. Shorten the spec and run again." });
  }
}

// ---------- Small components ----------
const Label = ({ children, color = T.slate }) => (
  <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 8 }}>
    {children}
  </div>
);

const VerdictChip = ({ v }) => {
  const map = {
    APPROVE: { bg: T.actionSoft, fg: T.action },
    DEFER: { bg: T.deferSoft, fg: T.defer },
    REJECT: { bg: T.gapSoft, fg: T.gap },
  };
  const c = map[v] || map.DEFER;
  return (
    <span style={{ ...mono, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", background: c.bg, color: c.fg, padding: "6px 12px", borderRadius: 3 }}>
      {v}
    </span>
  );
};

// Signature element: the insight→action rail
const Rail = ({ nodes }) => {
  if (!nodes?.length) return null;
  const typeColor = (n) => (n.type === "action" ? T.action : n.type === "insight" ? T.ink : n.wired ? T.action : T.gap);
  return (
    <div style={{ overflowX: "auto", padding: "18px 2px 6px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", minWidth: nodes.length * 110 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96, flexShrink: 0 }}>
              <div
                style={{
                  width: 14, height: 14, borderRadius: n.type === "human" ? 0 : 999,
                  background: n.wired || n.type === "insight" ? typeColor(n) : T.panel,
                  border: `2.5px solid ${typeColor(n)}`,
                  transform: n.type === "human" ? "rotate(45deg)" : "none",
                }}
              />
              <div style={{ ...mono, fontSize: 10.5, color: T.ink, marginTop: 8, textAlign: "center", lineHeight: 1.35 }}>{n.label}</div>
              <div style={{ ...mono, fontSize: 9, color: n.wired ? T.action : T.gap, marginTop: 2, letterSpacing: "0.08em" }}>
                {n.type === "insight" || n.type === "action" ? n.type.toUpperCase() : n.wired ? "WIRED" : "GAP"}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div
                className={!nodes[i + 1].wired ? "pulse" : ""}
                style={{
                  flex: 1, minWidth: 24, height: 0, marginTop: 7,
                  borderTop: nodes[i + 1].wired || nodes[i + 1].type === "action"
                    ? `2.5px solid ${T.action}`
                    : `2.5px dashed ${T.gap}`,
                  animation: !nodes[i + 1].wired && nodes[i + 1].type !== "action" ? "railpulse 1.6s ease-in-out infinite" : "none",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Panel = ({ title, children, accent }) => (
  <div className="rise" style={{ background: T.panel, border: `1px solid ${T.line}`, borderTop: accent ? `3px solid ${accent}` : `1px solid ${T.line}`, borderRadius: 4, padding: "16px 18px" }}>
    <Label>{title}</Label>
    {children}
  </div>
);

const Row = ({ left, right, danger }) => (
  <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.paper}`, fontSize: 13.5, lineHeight: 1.45 }}>
    <div style={{ flex: 1, color: danger ? T.gap : T.ink, fontWeight: 500 }}>{left}</div>
    <div style={{ flex: 1.2, color: T.slate }}>{right}</div>
  </div>
);

// ---------- Main ----------
export default function GapZero() {
  const [mode, setMode] = useState("build");
  const [input, setInput] = useState("");
  const [run, setRun] = useState({ status: "idle", data: null, error: null });
  const [copied, setCopied] = useState(false);

  const d = run.data;
  const score = d?.actionGapScore ?? 0;
  const scoreColor = score >= 75 ? T.action : score >= 45 ? T.defer : T.gap;

  const copyBlueprint = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(d, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div style={{ ...disp, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <style>{fontCSS}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.line}`, background: T.panel, padding: "14px 24px", display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
          GAP<span style={{ color: T.action }}>/</span>ZERO
        </div>
        <div style={{ ...mono, fontSize: 11.5, color: T.slate }}>Gap-free agent builder & auditor · insight must end in action</div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 22 }}>
        {/* Console */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", border: `1px solid ${T.line}`, borderRadius: 4, overflow: "hidden" }}>
            {["build", "audit"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  ...mono, flex: 1, padding: "11px 0", fontSize: 12, letterSpacing: "0.12em", cursor: "pointer", border: "none",
                  background: mode === m ? T.ink : T.panel, color: mode === m ? "#fff" : T.slate, fontWeight: 600,
                }}
              >
                {m === "build" ? "BUILD AGENT" : "AUDIT AGENT"}
              </button>
            ))}
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 4, padding: 16 }}>
            <Label>{mode === "build" ? "Use case → outcome" : "Existing agent / framework spec"}</Label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={9}
              placeholder={
                mode === "build"
                  ? "e.g. Churn-prevention agent for a telecom: detect at-risk accounts, act inside CRM + billing, retention lift is the metric…"
                  : "Paste the agent's spec: what it detects, what it outputs, which systems it touches, where humans intervene…"
              }
              style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 3, padding: 12, fontSize: 13.5, ...disp, resize: "vertical", background: T.paper, color: T.ink }}
            />
            <button
              onClick={() => input.trim() && runEngine(mode, input, setRun)}
              disabled={run.status === "loading" || !input.trim()}
              style={{
                ...mono, marginTop: 12, width: "100%", padding: "13px 0", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.12em",
                background: run.status === "loading" ? T.slate : T.action, color: "#fff", border: "none", borderRadius: 3,
                cursor: run.status === "loading" || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              {run.status === "loading" ? "WIRING INSIGHT → ACTION…" : mode === "build" ? "GENERATE GAP-FREE BLUEPRINT" : "RUN GAP AUDIT"}
            </button>
          </div>

          <div style={{ ...mono, fontSize: 10.5, color: T.slate, lineHeight: 1.7, padding: "0 4px" }}>
            SCORING · friction count · time-to-action · unmodified acceptance · decision quality. Dashboards are treated as failure modes. Every blueprint ships with governance + PoC kill criteria.
          </div>
        </section>

        {/* Results */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {run.status === "idle" && (
            <div style={{ border: `1.5px dashed ${T.line}`, borderRadius: 4, padding: "60px 30px", textAlign: "center", color: T.slate }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No blueprint yet</div>
              <div style={{ fontSize: 13 }}>Describe a use case or paste an agent spec, then run the engine.</div>
            </div>
          )}

          {run.status === "error" && (
            <div style={{ background: T.gapSoft, color: T.gap, border: `1px solid ${T.gap}`, borderRadius: 4, padding: 16, fontSize: 13.5 }}>{run.error}</div>
          )}

          {run.status === "done" && d && (
            <>
              {/* Scoreboard */}
              <div className="rise" style={{ background: T.ink, borderRadius: 4, padding: "18px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.14em", color: "#8FA3AD" }}>ACTION GAP SCORE</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}<span style={{ fontSize: 16, color: "#8FA3AD" }}>/100</span></div>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{d.agentName}</div>
                  <div style={{ height: 6, background: "#2A3B45", borderRadius: 99, marginTop: 8 }}>
                    <div style={{ width: `${score}%`, height: "100%", background: scoreColor, borderRadius: 99, transition: "width .6s ease" }} />
                  </div>
                </div>
                <VerdictChip v={d.verdict} />
              </div>

              {/* Rail */}
              <Panel title="Insight → Action rail" accent={T.action}>
                <Rail nodes={d.pipeline} />
              </Panel>

              {mode === "audit" && d.gaps?.length > 0 && (
                <Panel title="Gaps found" accent={T.gap}>
                  {d.gaps.map((g, i) => (
                    <Row
                      key={i}
                      danger={g.severity === "critical"}
                      left={<><span style={{ ...mono, fontSize: 10, color: g.severity === "critical" ? T.gap : g.severity === "major" ? T.defer : T.slate, letterSpacing: "0.1em" }}>{g.severity.toUpperCase()}</span><br />{g.gap}</>}
                      right={g.remediation}
                    />
                  ))}
                </Panel>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                <Panel title="Friction inventory">
                  {(d.friction || []).map((f, i) => <Row key={i} left={f.point} right={f.fix} />)}
                </Panel>
                <Panel title="Execution wiring">
                  {(d.wiring || []).map((w, i) => <Row key={i} left={w.step} right={w.mechanism} />)}
                </Panel>
                <Panel title="Human touchpoint & accountability">
                  <Row left="Design" right={d.humanTouchpoint?.design} />
                  <Row left="If the agent acts wrongly" right={d.humanTouchpoint?.accountability} />
                </Panel>
                <Panel title="KPIs — decision quality first">
                  {(d.kpis || []).map((k, i) => <Row key={i} left={k.name} right={k.target} />)}
                </Panel>
              </div>

              <Panel title="Proof of concept — closed loop" accent={T.defer}>
                <Row left="Scope" right={d.poc?.scope} />
                <Row left="Duration" right={d.poc?.duration} />
                <Row left="Success metric" right={d.poc?.successMetric} />
                <Row left="Kill criteria" right={d.poc?.killCriteria} danger />
                <Row left="Review trigger" right={d.poc?.reviewTrigger} />
              </Panel>

              <button
                onClick={copyBlueprint}
                style={{ ...mono, alignSelf: "flex-start", padding: "10px 18px", fontSize: 12, letterSpacing: "0.1em", background: T.panel, color: T.ink, border: `1px solid ${T.ink}`, borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
              >
                {copied ? "COPIED ✓" : "COPY BLUEPRINT JSON"}
              </button>
            </>
          )}
        </section>
      </main>

      <style>{`
        @media (max-width: 820px) {
          main { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

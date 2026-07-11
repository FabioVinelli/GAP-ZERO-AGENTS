import React, { useEffect, useState, useMemo, useContext, createContext } from "react";

// ================= GAP/ZERO Studio — Agent Build Standard v2.0 =================
// Build · Audit · Scaffold. Engine calls go through the local Express proxy (/api).

// ---------- Design tokens (light / dark) ----------
const LIGHT = {
  paper: "#ECF0F1", panel: "#FFFFFF", ink: "#0F1E26", slate: "#5A6B75", line: "#CBD5DA",
  action: "#0B7A6B", actionSoft: "#E0F0ED", gap: "#C22B1F", gapSoft: "#F9E7E4",
  defer: "#9A6A12", deferSoft: "#F5ECD8",
};

const DARK = {
  paper: "#0F1518", panel: "#182025", ink: "#EAF0F2", slate: "#8FA3AD", line: "#2B363C",
  action: "#2FBBA1", actionSoft: "#123029", gap: "#E5695C", gapSoft: "#3A1E1B",
  defer: "#E0B15C", deferSoft: "#3A2E14",
};

const ThemeContext = createContext(LIGHT);
const useT = () => useContext(ThemeContext);

const fontCSS = (T) => `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; } body { margin: 0; }
@keyframes railpulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes rise { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none; } }
.rise { animation: rise .35s ease both; }
textarea:focus, input:focus, select:focus, button:focus-visible { outline: 2px solid ${T.action}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .rise, .pulse { animation: none !important; } }
@media (max-width: 860px) { main { grid-template-columns: 1fr !important; } }
`;

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const disp = { fontFamily: "'Archivo', sans-serif" };

const MODELS = ["claude-sonnet-4-6", "claude-opus-4-8", "claude-haiku-4-5-20251001"];

// ---------- API ----------
async function apiRun(mode, input, model) {
  const r = await fetch("/api/run", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, input, model }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Engine run failed");
  return data;
}

async function apiScaffold(blueprint) {
  const r = await fetch("/api/scaffold", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blueprint }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Scaffold failed");
  return data;
}

async function apiTestAgent(name, task, model) {
  const r = await fetch("/api/agents/test", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, task, model }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Test run failed");
  return data;
}

// ---------- Atoms ----------
const Label = ({ children, color }) => {
  const T = useT();
  return <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: color || T.slate, marginBottom: 8 }}>{children}</div>;
};

const Chip = ({ bg, fg, children }) => (
  <span style={{ ...mono, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", background: bg, color: fg, padding: "5px 10px", borderRadius: 3, whiteSpace: "nowrap" }}>{children}</span>
);

const VerdictChip = ({ v }) => {
  const T = useT();
  const map = {
    APPROVE: { bg: T.actionSoft, fg: T.action },
    DEFER: { bg: T.deferSoft, fg: T.defer },
    REJECT: { bg: T.gapSoft, fg: T.gap },
  };
  const c = map[v] || map.DEFER;
  return <Chip bg={c.bg} fg={c.fg}>{v}</Chip>;
};

const Panel = ({ title, children, accent }) => {
  const T = useT();
  return (
    <div className="rise" style={{ background: T.panel, border: `1px solid ${T.line}`, borderTop: accent ? `3px solid ${accent}` : `1px solid ${T.line}`, borderRadius: 4, padding: "16px 18px" }}>
      <Label>{title}</Label>
      {children}
    </div>
  );
};

const Row = ({ left, right, danger }) => {
  const T = useT();
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.paper}`, fontSize: 13.5, lineHeight: 1.45 }}>
      <div style={{ flex: 1, color: danger ? T.gap : T.ink, fontWeight: 500 }}>{left}</div>
      <div style={{ flex: 1.2, color: T.slate }}>{right}</div>
    </div>
  );
};

// ---------- Insight → Action rail ----------
const Rail = ({ nodes }) => {
  const T = useT();
  if (!nodes?.length) return null;
  const typeColor = (n) => (n.type === "action" ? T.action : n.type === "insight" ? T.ink : n.wired ? T.action : T.gap);
  return (
    <div style={{ overflowX: "auto", padding: "18px 2px 6px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", minWidth: nodes.length * 110 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96, flexShrink: 0 }}>
              <div style={{
                width: 14, height: 14, borderRadius: n.type === "human" ? 0 : 999,
                background: n.wired || n.type === "insight" ? typeColor(n) : T.panel,
                border: `2.5px solid ${typeColor(n)}`,
                transform: n.type === "human" ? "rotate(45deg)" : "none",
              }} />
              <div style={{ ...mono, fontSize: 10.5, color: T.ink, marginTop: 8, textAlign: "center", lineHeight: 1.35 }}>{n.label}</div>
              <div style={{ ...mono, fontSize: 9, color: n.wired ? T.action : T.gap, marginTop: 2, letterSpacing: "0.08em" }}>
                {n.type === "insight" || n.type === "action" ? n.type.toUpperCase() : n.wired ? "WIRED" : "GAP"}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className={!nodes[i + 1].wired ? "pulse" : ""} style={{
                flex: 1, minWidth: 24, height: 0, marginTop: 7,
                borderTop: nodes[i + 1].wired || nodes[i + 1].type === "action" ? `2.5px solid ${T.action}` : `2.5px dashed ${T.gap}`,
                animation: !nodes[i + 1].wired && nodes[i + 1].type !== "action" ? "railpulse 1.6s ease-in-out infinite" : "none",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------- Subscores strip ----------
// Lives inside the scoreboard panel, whose background is always dark regardless of theme.
const Subscores = ({ s }) => {
  const T = useT();
  if (!s) return null;
  const dims = [["friction", s.friction], ["time-to-action", s.timeToAction], ["trust", s.trust], ["quality+gov", s.qualityGovernance]];
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {dims.map(([k, v]) => (
        <div key={k} style={{ flex: 1, minWidth: 110 }}>
          <div style={{ ...mono, fontSize: 9.5, letterSpacing: "0.1em", color: "#8FA3AD", textTransform: "uppercase" }}>{k}</div>
          <div style={{ ...mono, fontSize: 18, fontWeight: 600, color: v >= 18 ? T.action : v >= 10 ? "#D9A94A" : "#E76B5C" }}>{v ?? "–"}<span style={{ fontSize: 11, color: "#8FA3AD" }}>/25</span></div>
          <div style={{ height: 4, background: "#2A3B45", borderRadius: 99, marginTop: 3 }}>
            <div style={{ width: `${((v ?? 0) / 25) * 100}%`, height: "100%", background: v >= 18 ? T.action : v >= 10 ? "#D9A94A" : "#E76B5C", borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- 12 certification gates ----------
const Gates = ({ gates }) => {
  const T = useT();
  if (!gates?.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
      {gates.map((g) => (
        <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: g.pass ? T.actionSoft : T.gapSoft, borderRadius: 3, border: `1px solid ${g.pass ? T.action : T.gap}22` }}>
          <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: g.pass ? T.action : T.gap }}>{g.pass ? "✓" : "✗"}</span>
          <span style={{ ...mono, fontSize: 10.5, color: T.ink, lineHeight: 1.3 }}>G{g.id} · {g.name}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Launch & test scaffolded agents ----------
const AgentTest = ({ model, refreshKey }) => {
  const T = useT();
  const [agents, setAgents] = useState([]);
  const [sel, setSel] = useState("");
  const [task, setTask] = useState("Run a smoke test of the pipeline.");
  const [test, setTest] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then((d) => {
      const list = d.agents || [];
      setAgents(list);
      setSel((cur) => (list.some((a) => a.name === cur) ? cur : list[0]?.name || ""));
    }).catch(() => setAgents([]));
  }, [refreshKey]);

  const launch = async () => {
    if (!sel || test.status === "loading") return;
    setTest({ status: "loading", data: null, error: null });
    try {
      const data = await apiTestAgent(sel, task, model);
      setTest({ status: "done", data, error: null });
    } catch (e) {
      setTest({ status: "error", data: null, error: e.message });
    }
  };

  if (!agents.length) return null;
  const d = test.data;
  const selAgent = agents.find((a) => a.name === sel);

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderTop: `3px solid ${T.ink}`, borderRadius: 4, padding: 16 }}>
      <Label>Launch & test — generated agents</Label>
      <select value={sel} onChange={(e) => { setSel(e.target.value); setTest({ status: "idle", data: null, error: null }); }}
        style={{ ...mono, width: "100%", fontSize: 11.5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink, marginBottom: 8 }}>
        {agents.map((a) => <option key={a.name} value={a.name}>{a.agentName} · {a.verdict}{a.score != null ? ` ${a.score}/100` : ""}</option>)}
      </select>
      <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task for the agent"
        style={{ ...mono, width: "100%", fontSize: 11.5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink, marginBottom: 8 }} />
      <button onClick={launch} disabled={test.status === "loading"} style={{
        ...mono, width: "100%", padding: "11px 0", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
        background: test.status === "loading" ? T.slate : T.ink, color: T.panel, border: "none", borderRadius: 3,
        cursor: test.status === "loading" ? "wait" : "pointer",
      }}>
        {test.status === "loading"
          ? (selAgent?.ready ? "RUNNING AGENT LOOP…" : "FIRST RUN: INSTALLING VENV…")
          : "LAUNCH TEST RUN"}
      </button>
      {test.status === "loading" && !selAgent?.ready && (
        <div style={{ ...mono, fontSize: 10, color: T.slate, marginTop: 6 }}>first run creates .venv + installs deps — may take a minute</div>
      )}
      {test.status === "error" && (
        <div style={{ background: T.gapSoft, color: T.gap, border: `1px solid ${T.gap}`, borderRadius: 3, padding: 10, fontSize: 12, marginTop: 10 }}>{test.error}</div>
      )}
      {test.status === "done" && d && (
        <div className="rise" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <Chip bg={d.verdict === "PASS" ? T.actionSoft : T.gapSoft} fg={d.verdict === "PASS" ? T.action : T.gap}>
              EVAL {d.verdict || "N/A"}
            </Chip>
            <Chip bg={d.didAct ? T.actionSoft : T.gapSoft} fg={d.didAct ? T.action : T.gap}>
              {d.didAct ? "ACTED ✓" : "NO LANDED ACTION"}
            </Chip>
            <Chip bg={T.deferSoft} fg={T.defer}>exit: {d.exit || "?"}</Chip>
            {d.durationMs != null && <Chip bg={T.paper} fg={T.slate}>{(d.durationMs / 1000).toFixed(1)}s</Chip>}
          </div>
          {d.trace && <div style={{ ...mono, fontSize: 10.5, color: T.slate, marginBottom: 6 }}>trace: {d.trace}</div>}
          <pre style={{ ...mono, fontSize: 10.5, color: T.ink, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 3, padding: 10, maxHeight: 220, overflow: "auto", whiteSpace: "pre-wrap", margin: 0 }}>
            {d.output || d.error || "(no output)"}
          </pre>
        </div>
      )}
    </div>
  );
};

// ---------- Main ----------
export default function App() {
  const [mode, setMode] = useState("build");
  const [model, setModel] = useState(MODELS[0]);
  const [input, setInput] = useState("");
  const [run, setRun] = useState({ status: "idle", data: null, error: null });
  const [scaffold, setScaffold] = useState({ status: "idle", data: null, error: null });
  const [health, setHealth] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("gapzero-theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const T = useMemo(() => (dark ? DARK : LIGHT), [dark]);

  useEffect(() => {
    localStorage.setItem("gapzero-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  const d = run.data;
  const score = d?.actionGapScore ?? 0;
  const scoreColor = score >= 75 ? T.action : score >= 45 ? T.defer : T.gap;
  const gatesPassed = (d?.gates || []).filter((g) => g.pass).length;

  const doRun = async () => {
    if (!input.trim() || run.status === "loading") return;
    setRun({ status: "loading", data: null, error: null });
    setScaffold({ status: "idle", data: null, error: null });
    try {
      const { blueprint, warnings } = await apiRun(mode, input, model);
      setRun({ status: "done", data: blueprint, warnings: warnings || [], error: null });
    } catch (e) {
      setRun({ status: "error", data: null, error: e.message });
    }
  };

  const doScaffold = async () => {
    if (!d || scaffold.status === "loading") return;
    setScaffold({ status: "loading", data: null, error: null });
    try {
      const result = await apiScaffold(d);
      setScaffold({ status: "done", data: result, error: null });
    } catch (e) {
      setScaffold({ status: "error", data: null, error: e.message });
    }
  };

  const copyBlueprint = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(d, null, 2));
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={T}>
    <div style={{ ...disp, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <style>{fontCSS(T)}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.line}`, background: T.panel, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
          GAP<span style={{ color: T.action }}>/</span>ZERO <span style={{ ...mono, fontSize: 11, color: T.slate, fontWeight: 500 }}>STUDIO · STANDARD v2.0</span>
        </div>
        <div style={{ ...mono, fontSize: 11.5, color: T.slate, flex: 1 }}>build · audit · scaffold — insight must end in action</div>
        <select value={model} onChange={(e) => setModel(e.target.value)}
          style={{ ...mono, fontSize: 11.5, padding: "7px 10px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink }}>
          {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={() => setDark((v) => !v)} aria-label="Toggle dark mode" title="Toggle dark mode" style={{
          ...mono, fontSize: 13, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink, cursor: "pointer",
        }}>
          {dark ? "☀" : "☾"}
        </button>
        <span style={{ ...mono, fontSize: 10.5, color: health?.keyConfigured ? T.action : T.gap }}>
          {health === null ? "…" : health?.keyConfigured ? "● engine ready" : "● no API key (.env)"}
        </span>
      </header>

      <main style={{ maxWidth: 1220, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 22 }}>
        {/* Console */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", border: `1px solid ${T.line}`, borderRadius: 4, overflow: "hidden" }}>
            {["build", "audit"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                ...mono, flex: 1, padding: "11px 0", fontSize: 12, letterSpacing: "0.12em", cursor: "pointer", border: "none",
                background: mode === m ? T.ink : T.panel, color: mode === m ? "#fff" : T.slate, fontWeight: 600,
              }}>
                {m === "build" ? "BUILD AGENT" : "AUDIT AGENT"}
              </button>
            ))}
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 4, padding: 16 }}>
            <Label>{mode === "build" ? "Use case → outcome" : "Existing agent / project / spec"}</Label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10}
              placeholder={mode === "build"
                ? "e.g. Churn-prevention agent for a telecom: detect at-risk accounts, act inside CRM + billing, retention lift is the metric, owner is Head of Retention…"
                : "Paste the agent's spec or code summary: what it detects, what it outputs, which systems it touches, where humans intervene, what KPIs it tracks…"}
              style={{ width: "100%", border: `1px solid ${T.line}`, borderRadius: 3, padding: 12, fontSize: 13.5, ...disp, resize: "vertical", background: T.paper, color: T.ink }} />
            <button onClick={doRun} disabled={run.status === "loading" || !input.trim()} style={{
              ...mono, marginTop: 12, width: "100%", padding: "13px 0", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.12em",
              background: run.status === "loading" ? T.slate : T.action, color: "#fff", border: "none", borderRadius: 3,
              cursor: run.status === "loading" || !input.trim() ? "not-allowed" : "pointer",
            }}>
              {run.status === "loading" ? "WIRING INSIGHT → ACTION…" : mode === "build" ? "GENERATE GAP-FREE BLUEPRINT" : "RUN GAP AUDIT"}
            </button>
          </div>

          <div style={{ ...mono, fontSize: 10.5, color: T.slate, lineHeight: 1.7, padding: "0 4px" }}>
            v2.0 · 12 certification gates · subscores: friction · time-to-action · trust · quality+governance.
            Generator ≠ evaluator. Policy engine gates every write. Dashboards are failure modes.
            Every blueprint ships sprint contract + kill criteria. APPROVE ≥ 75 · DEFER 45–74 · REJECT &lt; 45.
          </div>

          <AgentTest model={model} refreshKey={scaffold.data?.dir} />
        </section>

        {/* Results */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {run.status === "idle" && (
            <div style={{ border: `1.5px dashed ${T.line}`, borderRadius: 4, padding: "60px 30px", textAlign: "center", color: T.slate }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No blueprint yet</div>
              <div style={{ fontSize: 13 }}>Describe a use case (BUILD) or paste an agent spec (AUDIT), then run the engine.<br />APPROVE verdicts unlock the Python scaffold.</div>
            </div>
          )}

          {run.status === "error" && (
            <div style={{ background: T.gapSoft, color: T.gap, border: `1px solid ${T.gap}`, borderRadius: 4, padding: 16, fontSize: 13.5 }}>{run.error}</div>
          )}

          {run.status === "done" && d && (
            <>
              {/* Scoreboard */}
              <div className="rise" style={{ background: T.ink, borderRadius: 4, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.14em", color: "#8FA3AD" }}>ACTION GAP SCORE</div>
                    <div style={{ fontSize: 42, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}<span style={{ fontSize: 16, color: "#8FA3AD" }}>/100</span></div>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{d.agentName}</div>
                    <div style={{ ...mono, fontSize: 10.5, color: "#8FA3AD", marginTop: 2 }}>
                      maturity: {d.maturityState || "unclassified"} · gates {gatesPassed}/12
                      {d.outcome?.metric ? ` · outcome: ${d.outcome.metric}` : ""}
                    </div>
                    <div style={{ height: 6, background: "#2A3B45", borderRadius: 99, marginTop: 8 }}>
                      <div style={{ width: `${score}%`, height: "100%", background: scoreColor, borderRadius: 99, transition: "width .6s ease" }} />
                    </div>
                  </div>
                  <VerdictChip v={d.verdict} />
                </div>
                <Subscores s={d.subscores} />
              </div>

              {/* Blueprint completeness — scaffold + Hermes export blocked until gap-free */}
              {run.warnings?.length > 0 && (
                <div className="rise" style={{ background: T.deferSoft, border: `1px solid ${T.defer}`, borderRadius: 4, padding: "12px 16px" }}>
                  <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.12em", color: T.defer, fontWeight: 700, marginBottom: 6 }}>
                    BLUEPRINT NOT GAP-FREE — {run.warnings.length} GAP{run.warnings.length > 1 ? "S" : ""} · SCAFFOLD BLOCKED
                  </div>
                  {run.warnings.map((w, i) => (
                    <div key={i} style={{ ...mono, fontSize: 11, color: T.ink, padding: "2px 0" }}>✗ {w}</div>
                  ))}
                  <div style={{ fontSize: 12, color: T.slate, marginTop: 6 }}>Re-run BUILD until the engine returns every field — a declared GAP does not ship.</div>
                </div>
              )}

              {/* Next action */}
              {d.nextAction && (
                <div className="rise" style={{ background: T.actionSoft, border: `1px solid ${T.action}44`, borderRadius: 4, padding: "12px 16px", display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ ...mono, fontSize: 10.5, letterSpacing: "0.12em", color: T.action, fontWeight: 700 }}>NEXT ACTION</span>
                  <span style={{ fontSize: 13.5, color: T.ink }}>{d.nextAction}</span>
                </div>
              )}

              <Panel title="Insight → Action rail" accent={T.action}>
                <Rail nodes={d.pipeline} />
              </Panel>

              <Panel title="Certification — 12 gates" accent={gatesPassed === 12 ? T.action : T.defer}>
                <Gates gates={d.gates} />
              </Panel>

              {mode === "audit" && d.gaps?.length > 0 && (
                <Panel title="Gap ledger" accent={T.gap}>
                  {d.gaps.map((g, i) => (
                    <Row key={i} danger={g.severity === "critical"}
                      left={<><span style={{ ...mono, fontSize: 10, color: g.severity === "critical" ? T.gap : g.severity === "major" ? T.defer : T.slate, letterSpacing: "0.1em" }}>{g.severity.toUpperCase()}</span><br />{g.gap}</>}
                      right={g.remediation} />
                  ))}
                </Panel>
              )}

              {d.antiPatterns?.length > 0 && (
                <Panel title="Anti-patterns detected" accent={T.gap}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {d.antiPatterns.map((a, i) => <Chip key={i} bg={T.gapSoft} fg={T.gap}>{a}</Chip>)}
                  </div>
                </Panel>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                <Panel title="Friction inventory">
                  {(d.friction || []).map((f, i) => <Row key={i} left={f.point} right={f.fix} />)}
                </Panel>
                <Panel title="Execution wiring · landing checks">
                  {(d.wiring || []).map((w, i) => (
                    <Row key={i} left={<>{w.step}<br /><span style={{ ...mono, fontSize: 10, color: w.reversibility === "irreversible" ? T.gap : T.slate }}>{w.reversibility}</span></>}
                      right={<>{w.mechanism}<br /><span style={{ ...mono, fontSize: 10.5, color: T.action }}>✓ {w.landingCheck}</span></>} />
                  ))}
                </Panel>
                <Panel title="Policy engine — pre-execution">
                  {(d.policyRules || []).map((p, i) => (
                    <Row key={i} left={p.riskClass} danger={p.decision === "block"}
                      right={<span style={{ ...mono, fontSize: 11.5, color: p.decision === "allow" ? T.action : p.decision === "escalate" ? T.defer : T.gap, letterSpacing: "0.08em" }}>{p.decision.toUpperCase()}</span>} />
                  ))}
                </Panel>
                <Panel title="Human touchpoint & accountability">
                  <Row left="Validation design" right={d.humanTouchpoint?.design} />
                  <Row left="Owner" right={d.humanTouchpoint?.owner} />
                  <Row left="Detection" right={d.humanTouchpoint?.detection} />
                  <Row left="Rollback" right={d.humanTouchpoint?.rollback} danger />
                </Panel>
                <Panel title="Evaluator — separate agent">
                  {(d.evaluator?.criteria || []).map((c, i) => <Row key={i} left={`Criterion ${i + 1}`} right={c} />)}
                  <Row left="Threshold" right={d.evaluator?.threshold} danger />
                </Panel>
                <Panel title="KPIs — decision quality first">
                  {(d.kpis || []).map((k, i) => <Row key={i} left={k.name} right={k.target} />)}
                </Panel>
              </div>

              <Panel title="Proof of concept — closed loop" accent={T.defer}>
                <Row left="Scope" right={d.poc?.scope} />
                <Row left="Sprint contract" right={d.poc?.sprintContract} />
                <Row left="Duration" right={d.poc?.duration} />
                <Row left="Success metric" right={d.poc?.successMetric} />
                <Row left="Kill criteria" right={d.poc?.killCriteria} danger />
                <Row left="Scale criteria" right={d.poc?.scaleCriteria} />
                <Row left="Review trigger" right={d.poc?.reviewTrigger} />
              </Panel>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={copyBlueprint} style={{ ...mono, padding: "10px 18px", fontSize: 12, letterSpacing: "0.1em", background: T.panel, color: T.ink, border: `1px solid ${T.ink}`, borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>
                  {copied ? "COPIED ✓" : "COPY BLUEPRINT JSON"}
                </button>
                <button onClick={doScaffold} disabled={scaffold.status === "loading"} style={{
                  ...mono, padding: "10px 18px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 600, borderRadius: 3,
                  background: d.verdict === "APPROVE" ? T.action : T.defer, color: "#fff", border: "none",
                  cursor: scaffold.status === "loading" ? "wait" : "pointer",
                }}>
                  {scaffold.status === "loading" ? "SCAFFOLDING…" : `SCAFFOLD PYTHON AGENT${d.verdict !== "APPROVE" ? " (verdict ≠ APPROVE — close gaps first)" : ""}`}
                </button>
              </div>

              {scaffold.status === "error" && (
                <div style={{ background: T.gapSoft, color: T.gap, border: `1px solid ${T.gap}`, borderRadius: 4, padding: 14, fontSize: 13 }}>{scaffold.error}</div>
              )}
              {scaffold.status === "done" && scaffold.data && (
                <Panel title="Scaffold generated — open in Cursor" accent={T.action}>
                  <div style={{ ...mono, fontSize: 12, color: T.action, marginBottom: 8 }}>{scaffold.data.dir}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
                    {scaffold.data.files.map((f) => (
                      <div key={f} style={{ ...mono, fontSize: 11, color: T.slate, padding: "3px 0" }}>· {f}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: T.slate, marginTop: 10 }}>
                    Finish the TODOs in <span style={mono}>src/tools.py</span> (real mechanisms + landing checks), then run the PoC per <span style={mono}>poc.md</span>. Honor the kill criteria.
                  </div>
                </Panel>
              )}
            </>
          )}
        </section>
      </main>
    </div>
    </ThemeContext.Provider>
  );
}

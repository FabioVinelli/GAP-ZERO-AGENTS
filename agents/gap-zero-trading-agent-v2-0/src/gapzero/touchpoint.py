"""L3: Human touchpoint — single validation endpoint. Humans are endpoints, never middleware.
Owner: Head of Quantitative Trading · Detection: Stop-loss breach or invalidation trigger fires page within one intraday cycle; kill switch auto-arms pending owner response · Rollback: Flatten position via kill switch (live); discard fill record (paper); backtest artifacts retained for audit"""

class HumanTouchpoint:
    def __init__(self, trace):
        self.trace = trace

    def validate(self, tool_name: str, args: dict, evidence: str) -> bool:
        # CLI stand-in. Replace with your real channel (Slack, queue, webhook) — still ONE step.
        print(f"\n[VALIDATION REQUIRED] {tool_name} {args}\nEvidence: {evidence}")
        try:
            ans = input("approve? [y/N/modify] ").strip().lower()
        except EOFError:
            ans = ""  # non-interactive run: no validator present -> veto
        modified = ans.startswith("m")
        approved = ans.startswith("y") or modified
        self.trace.event("validator_decision", tool=tool_name, approved=approved, modified=modified,
                         noninteractive=(ans == ""))
        return approved

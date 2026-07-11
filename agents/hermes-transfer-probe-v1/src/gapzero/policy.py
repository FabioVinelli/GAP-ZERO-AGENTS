"""L2: Policy Engine — evaluates every write pre-execution: allow | block | escalate. Every decision logged."""
RULES = {
    "local reversible file/subprocess inside agent dir": "allow",
    "write operation outside agent directory": "block",
    "network call or credential access attempt": "escalate",
    "escalation event itself — occurrence is test failure": "block",
}

class PolicyEngine:
    def __init__(self, trace):
        self.trace = trace

    def check(self, tool_spec, args: dict) -> str:
        decision = "allow"
        if tool_spec.permission == "read":
            decision = "allow"
        elif tool_spec.reversibility == "irreversible":
            decision = "escalate"   # irreversible always requires pre-execution validation
        else:
            decision = RULES.get(tool_spec.risk_class, "allow")
        self.trace.event("policy_decision", tool=tool_spec.name, risk=tool_spec.risk_class,
                         reversibility=tool_spec.reversibility, decision=decision, rule_trace=str(RULES))
        return decision

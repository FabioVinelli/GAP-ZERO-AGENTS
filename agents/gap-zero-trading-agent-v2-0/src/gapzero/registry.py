"""L2: Actuation Registry — every tool declares mechanism, reversibility, landing check, permission tier.
Rule: unknown mechanism or missing landing check = declared GAP; the tool does not ship."""
from dataclasses import dataclass, field
from typing import Callable, Any

@dataclass
class ToolSpec:
    name: str
    description: str
    mechanism: str            # API/REST | MCP | DB write | webhook | RPA/UI | file op | orchestrator
    reversibility: str        # reversible | compensable | irreversible
    permission: str           # read | write | write-with-validation
    input_schema: dict
    execute: Callable[[dict], Any]
    landing_check: Callable[[dict, Any], bool]   # deterministic: did the action land?
    risk_class: str = "low"

@dataclass
class ActuationRegistry:
    tools: dict = field(default_factory=dict)

    def register(self, spec: ToolSpec):
        assert spec.mechanism and spec.landing_check, f"GAP: {spec.name} missing mechanism/landing check"
        self.tools[spec.name] = spec

    def api_schema(self):
        return [{"name": t.name, "description": t.description, "input_schema": t.input_schema}
                for t in self.tools.values()]

    def get(self, name: str) -> ToolSpec:
        return self.tools[name]

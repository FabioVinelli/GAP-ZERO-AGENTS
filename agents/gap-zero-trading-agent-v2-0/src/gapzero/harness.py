"""L1: harness — assembles working memory (system prompt = procedural skills + boundary) and runs the loop."""
from .memory import Memory
from .trace import Trace
from .registry import ActuationRegistry
from .policy import PolicyEngine
from .touchpoint import HumanTouchpoint
from .loop import LoopRunner
from .evaluator import Evaluator

class Harness:
    def __init__(self, register_tools):
        self.memory = Memory()
        self.trace = Trace()
        self.registry = ActuationRegistry()
        register_tools(self.registry)
        self.policy = PolicyEngine(self.trace)
        self.touchpoint = HumanTouchpoint(self.trace)
        self.loop = LoopRunner(self.registry, self.policy, self.touchpoint, self.trace, self.memory)
        self.evaluator = Evaluator(self.trace)

    def system_prompt(self) -> str:
        return ("You are GAP/ZERO Trading Agent v2.0. Serve the outcome: % validated strategies reaching profitable paper P&L within risk limits.\n"
                "Terminal contract: executed action (landing-checked) | validated handoff | explicit block. "
                "Never end with a bare report.\n\n" + self.memory.procedural())

    def execute(self, task: str) -> dict:
        result = self.loop.run(self.system_prompt(), task)
        events = [e for e in self._read_trace() if e.get("kind") == "actuation"]
        grade = self.evaluator.grade(task, result, events)
        return {"result": result, "grade": grade, "trace": str(self.trace.file)}

    def _read_trace(self):
        import json
        return [json.loads(l) for l in open(self.trace.file)]

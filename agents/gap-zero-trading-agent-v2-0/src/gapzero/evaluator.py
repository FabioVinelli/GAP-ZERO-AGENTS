"""L4: separate skeptical evaluator — the generator NEVER grades its own work.
Principle-based criteria, hard threshold per criterion: any single failure fails the run."""
import json, os
import anthropic

CRITERIA = [
    "Signal maps to logged evidence + rule + timeframe + instrument + risk policy — all five fields present",
    "Invalidation logic explicitly declared per trade before execution",
    "Backtest→paper→live ladder unbroken; no stage skipped per audit record",
    "Full audit record exists for every recommendation and action",
    "Position sizing and max-loss limits verified against pre-declared parameters; no inference"
]
THRESHOLD = "Any single criterion failure fails the run; no partial credit; evaluator is separate module, never the generator"

class Evaluator:
    def __init__(self, trace):
        self.trace = trace
        self.client = anthropic.Anthropic()
        self.model = os.environ.get("EVALUATOR_MODEL", os.environ.get("MODEL", "claude-sonnet-4-6"))

    def grade(self, task: str, run_result: dict, actuation_events: list) -> dict:
        """Two questions: was it good? (criteria) · did it act? (deterministic, from trace)."""
        acted = any(e for e in actuation_events if e.get("landed"))
        system = ("You are a skeptical QA evaluator. You did not produce this work. "
                  "Grade each criterion pass/fail with one-line evidence. Do not talk yourself into "
                  "approving flagged issues. Respond ONLY minified JSON: "
                  '{"criteria":[{"name":str,"pass":bool,"evidence":str}],"verdict":"PASS"|"FAIL"}')
        user = (f"Task: {task}\nExit: {run_result['exit']}\nReply: {run_result['reply'][:1500]}\n"
                f"Actions landed: {acted}\nCriteria: {json.dumps(CRITERIA)}\nThreshold: {THRESHOLD}")
        resp = self.client.messages.create(model=self.model, max_tokens=800, system=system,
                                           messages=[{"role": "user", "content": user}])
        text = "".join(b.text for b in resp.content if b.type == "text")
        graded = json.loads(text[text.index("{"):text.rindex("}") + 1])
        graded["did_it_act"] = acted
        if not acted:
            graded["verdict"] = "FAIL"  # eloquent reply + no landed action scores zero
        self.trace.event("eval", **graded)
        return graded

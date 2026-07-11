"""L4: separate skeptical evaluator — the generator NEVER grades its own work.
Principle-based criteria, hard threshold per criterion: any single failure fails the run."""
import json, os
import anthropic

CRITERIA = [
    "Every executed test has a corresponding JSONL trace entry with landed artifact reference — no trace entry means check does not exist",
    "No test marked passed without a verifiable on-disk artifact (file, hash, stdout capture) independently re-readable",
    "Policy engine emitted a logged decision record for every tool call in the cycle — gap in policy log = run failure",
    "Entire cycle produced zero file writes outside agent directory — verified by scanning trace write paths",
    "Trace JSONL is fully parseable end-to-end with no missing or malformed entries for the complete run"
]
THRESHOLD = "Any single criterion failure fails the entire run — partial pass not accepted"

class Evaluator:
    def __init__(self, trace):
        self.trace = trace
        self.client = anthropic.Anthropic()
        self.model = os.environ.get("EVALUATOR_MODEL", os.environ.get("MODEL", "claude-sonnet-4-6"))

    def grade(self, task: str, run_result: dict, trace_events: list) -> dict:
        """Two questions: was it good? (criteria) · did it act? (deterministic, from trace)."""
        acted = any(e.get("landed") for e in trace_events if e.get("kind") == "actuation")
        system = ("You are a skeptical QA evaluator. You did not produce this work. "
                  "Grade each criterion pass/fail with one-line evidence, judging from the trace "
                  "events (the accountability ledger) as ground truth — not from the reply prose. "
                  "Do not talk yourself into approving flagged issues. Respond ONLY minified JSON: "
                  '{"criteria":[{"name":str,"pass":bool,"evidence":str}],"verdict":"PASS"|"FAIL"}')
        user = (f"Task: {task}\nExit: {run_result['exit']}\nReply: {run_result['reply'][:1200]}\n"
                f"Actions landed: {acted}\n"
                f"Trace events (ground truth: actuation w/ landing results + outputs, policy decisions, validator decisions):\n"
                f"{json.dumps(trace_events, default=str)[:4000]}\n"
                f"Criteria: {json.dumps(CRITERIA)}\nThreshold: {THRESHOLD}")
        resp = self.client.messages.create(model=self.model, max_tokens=800, system=system,
                                           messages=[{"role": "user", "content": user}])
        text = "".join(b.text for b in resp.content if b.type == "text")
        graded = json.loads(text[text.index("{"):text.rindex("}") + 1])
        graded["did_it_act"] = acted
        if not acted:
            graded["verdict"] = "FAIL"  # eloquent reply + no landed action scores zero
        self.trace.event("eval", **graded)
        return graded

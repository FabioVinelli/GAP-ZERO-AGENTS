"""L2: loop mechanics contract — bounded Think→Act→Observe→Guardrail.
Exit taxonomy: task-complete | max-iterations | budget-exhausted | policy-blocked | error.
Tool errors are recoverable data returned to the model, never crashes."""
import json, os
import anthropic

class LoopRunner:
    def __init__(self, registry, policy, touchpoint, trace, memory,
                 max_iterations: int = 12, token_budget: int = 60000):
        self.registry, self.policy, self.touchpoint = registry, policy, touchpoint
        self.trace, self.memory = trace, memory
        self.max_iterations, self.token_budget = max_iterations, token_budget
        self.client = anthropic.Anthropic()
        self.model = os.environ.get("MODEL", "claude-sonnet-4-6")

    def run(self, system: str, user_task: str) -> dict:
        messages = [{"role": "user", "content": user_task}]
        tokens_used, exit_reason, final_text = 0, "max-iterations", ""
        for i in range(self.max_iterations):
            resp = self.client.messages.create(
                model=self.model, max_tokens=2048, system=system,
                tools=self.registry.api_schema(), messages=messages)
            tokens_used += resp.usage.input_tokens + resp.usage.output_tokens
            self.trace.event("model_turn", iteration=i, stop_reason=resp.stop_reason, tokens=tokens_used)
            messages.append({"role": "assistant", "content": resp.content})

            if resp.stop_reason != "tool_use":
                final_text = "".join(b.text for b in resp.content if b.type == "text")
                exit_reason = "task-complete"
                break
            if tokens_used > self.token_budget:
                exit_reason = "budget-exhausted"
                break

            results = []
            for block in resp.content:
                if block.type != "tool_use":
                    continue
                results.append(self._actuate(block))
            messages.append({"role": "user", "content": results})

        self.trace.event("loop_exit", reason=exit_reason)
        self.memory.remember(self.trace.run_id, "run", {"exit": exit_reason, "reply": final_text[:500]})
        return {"exit": exit_reason, "reply": final_text, "tokens": tokens_used}

    def _actuate(self, block) -> dict:
        spec = self.registry.get(block.name)
        decision = self.policy.check(spec, block.input)
        if decision == "block":
            return self._result(block, {"error": "policy-blocked"}, is_error=True)
        if decision == "escalate":
            if not self.touchpoint.validate(block.name, block.input, evidence=f"run {self.trace.run_id}"):
                return self._result(block, {"error": "vetoed-by-validator"}, is_error=True)
        try:
            out = spec.execute(block.input)
            landed = spec.landing_check(block.input, out)
            self.trace.event("actuation", tool=block.name, args=block.input,
                             mechanism=spec.mechanism, landed=landed)
            if not landed:
                return self._result(block, {"error": "landing-check-failed", "output": out}, is_error=True)
            return self._result(block, out)
        except Exception as e:  # recoverable data, not a crash
            self.trace.event("tool_error", tool=block.name, error=str(e))
            return self._result(block, {"error": str(e)}, is_error=True)

    @staticmethod
    def _result(block, content, is_error=False):
        return {"type": "tool_result", "tool_use_id": block.id,
                "content": json.dumps(content, default=str), "is_error": is_error}

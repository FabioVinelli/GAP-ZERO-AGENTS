"""L4: one JSONL trace per run — actuation events, policy + validator decisions included."""
import json, time, uuid
from pathlib import Path

class Trace:
    def __init__(self, run_dir: str = "traces"):
        self.run_id = uuid.uuid4().hex[:12]
        self.path = Path(run_dir); self.path.mkdir(exist_ok=True)
        self.file = self.path / f"run-{self.run_id}.jsonl"

    def event(self, kind: str, **data):
        rec = {"ts": time.time(), "run_id": self.run_id, "kind": kind, **data}
        with open(self.file, "a") as f:
            f.write(json.dumps(rec, default=str) + "\n")
        return rec

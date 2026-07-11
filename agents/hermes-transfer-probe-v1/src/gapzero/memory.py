"""L1: three stores, three retrieval policies. Episodic doubles as the accountability ledger."""
import json, sqlite3, time
from pathlib import Path

class Memory:
    def __init__(self, db: str = "memory.db", skills_dir: str = "skills"):
        self.conn = sqlite3.connect(db)
        self.conn.execute("""CREATE TABLE IF NOT EXISTS episodic
            (ts REAL, run_id TEXT, kind TEXT, payload TEXT)""")
        self.conn.execute("""CREATE TABLE IF NOT EXISTS semantic
            (fact TEXT, provenance TEXT, ts REAL)""")
        self.skills_dir = Path(skills_dir)

    def procedural(self) -> str:
        """Skills / SOPs — versioned files, changed only via release gate."""
        return "\n\n".join(p.read_text() for p in sorted(self.skills_dir.glob("*.md")))

    def remember(self, run_id: str, kind: str, payload: dict):
        self.conn.execute("INSERT INTO episodic VALUES (?,?,?,?)",
                          (time.time(), run_id, kind, json.dumps(payload, default=str)))
        self.conn.commit()

    def recent_episodes(self, n: int = 10):
        cur = self.conn.execute("SELECT ts, kind, payload FROM episodic ORDER BY ts DESC LIMIT ?", (n,))
        return cur.fetchall()

    def consolidate(self, fact: str, provenance: str):
        """Summarizer writes here — provenance mandatory; contradictions route to human validation."""
        self.conn.execute("INSERT INTO semantic VALUES (?,?,?)", (fact, provenance, time.time()))
        self.conn.commit()

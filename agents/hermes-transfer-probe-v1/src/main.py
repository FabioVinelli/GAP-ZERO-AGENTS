"""Entry point: python -m src.main "task" """
import sys
from dotenv import load_dotenv
from src.gapzero.harness import Harness
from src.tools import register_tools

def main():
    load_dotenv()
    task = " ".join(sys.argv[1:]) or "Run a smoke test of the pipeline."
    h = Harness(register_tools)
    out = h.execute(task)
    print("\n=== RESULT ===")
    print("exit:", out["result"]["exit"])
    print("reply:", out["result"]["reply"][:800])
    print("eval verdict:", out["grade"]["verdict"], "| did_it_act:", out["grade"]["did_it_act"])
    print("trace:", out["trace"])

if __name__ == "__main__":
    main()

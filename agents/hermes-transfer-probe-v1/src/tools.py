"""Actuation registry — WIRED. All four verification tools write only inside
test-output/ (agent directory), fully reversible: rollback = delete test-output/.
Every landing check is deterministic and re-verifiable from on-disk artifacts."""
import hashlib
import json
import os
import platform
import subprocess
import time
from pathlib import Path

from src.gapzero.registry import ToolSpec

OUT = Path("test-output")


def _outfile(name: str) -> Path:
    OUT.mkdir(exist_ok=True)
    return OUT / name


def register_tools(registry):
    # ---- 1. Environment fingerprint ----
    def environment_fingerprint_execute(args):
        expected = {
            "hostname": platform.node(),
            "python_version": platform.python_version(),
            "model_id": os.environ.get("MODEL", "unset"),
            "ts": time.time(),
        }
        p = _outfile("fingerprint.json")
        p.write_text(json.dumps(expected, sort_keys=True))
        readback = json.loads(p.read_text())
        return {"status": "landed", "artifact": str(p), "expected": expected, "readback": readback}

    def environment_fingerprint_landing(args, out):
        p = Path(out.get("artifact", ""))
        return p.exists() and json.loads(p.read_text()) == out.get("expected") == out.get("readback")

    registry.register(ToolSpec(
        name="environment_fingerprint",
        description="Write fingerprint.json (hostname, python_version, model_id) to test-output/, read back, assert identical. Landing check: file present, parsed, fields match.",
        mechanism="file op — write fingerprint.json to agent dir; read back and assert byte-identical hostname+python_version+model_id",
        reversibility="reversible",
        permission="write",
        input_schema={"type": "object", "properties": {"payload": {"type": "string"}}, "required": []},
        execute=environment_fingerprint_execute,
        landing_check=environment_fingerprint_landing,
        risk_class="low",
    ))

    # ---- 2. File round-trip test ----
    def file_round_trip_test_execute(args):
        content = (args.get("payload") or "GAPZERO-ROUNDTRIP-" + str(time.time())).encode()
        p = _outfile("roundtrip.txt")
        p.write_bytes(content)
        readback = p.read_bytes()
        h_written = hashlib.sha256(content).hexdigest()
        h_read = hashlib.sha256(readback).hexdigest()
        return {"status": "landed", "artifact": str(p), "sha256_written": h_written, "sha256_read": h_read}

    def file_round_trip_test_landing(args, out):
        p = Path(out.get("artifact", ""))
        return (
            p.exists()
            and out.get("sha256_written") == out.get("sha256_read")
            and hashlib.sha256(p.read_bytes()).hexdigest() == out.get("sha256_written")
        )

    registry.register(ToolSpec(
        name="file_round_trip_test",
        description="Write a test file with known content into test-output/, read back, compare SHA-256 of both. Landing check: hash match, independently re-computed from disk.",
        mechanism="file op — write test file with known content; read back; compute SHA-256 hash of both; assert match",
        reversibility="reversible",
        permission="write",
        input_schema={"type": "object", "properties": {"payload": {"type": "string"}}, "required": []},
        execute=file_round_trip_test_execute,
        landing_check=file_round_trip_test_landing,
        risk_class="low",
    ))

    # ---- 3. Shell execution test ----
    def shell_execution_test_execute(args):
        r = subprocess.run(["/bin/echo", "HERMES_OK"], capture_output=True, text=True, timeout=10)
        p = _outfile("shell-exec.json")
        record = {"exit_code": r.returncode, "stdout": r.stdout.strip(), "stderr": r.stderr.strip()}
        p.write_text(json.dumps(record))
        return {"status": "landed", "artifact": str(p), **record}

    def shell_execution_test_landing(args, out):
        p = Path(out.get("artifact", ""))
        if not p.exists():
            return False
        rec = json.loads(p.read_text())
        return rec.get("exit_code") == 0 and "HERMES_OK" in rec.get("stdout", "")

    registry.register(ToolSpec(
        name="shell_execution_test",
        description="Run benign subprocess `echo HERMES_OK`, capture exit code + stdout to test-output/shell-exec.json. Landing check: exit code 0 AND stdout contains HERMES_OK, re-read from artifact.",
        mechanism="orchestrator subprocess call — run benign command echo HERMES_OK; capture exit code and stdout",
        reversibility="reversible",
        permission="write",
        input_schema={"type": "object", "properties": {"payload": {"type": "string"}}, "required": []},
        execute=shell_execution_test_execute,
        landing_check=shell_execution_test_landing,
        risk_class="low",
    ))

    # ---- 4. Structured echo test ----
    def structured_echo_test_execute(args):
        raw = args.get("payload") or json.dumps({"probe": "hermes", "n": 1, "ok": True})
        try:
            parsed = json.loads(raw)
            schema_valid = isinstance(parsed, (dict, list))
        except json.JSONDecodeError:
            return {"status": "TODO-FAILED", "error": "payload is not valid JSON", "payload": raw}
        echoed = json.dumps(parsed, sort_keys=True)
        reference = json.dumps(json.loads(echoed), sort_keys=True)
        p = _outfile("structured-echo.json")
        p.write_text(json.dumps({"sent": echoed, "returned": reference, "schema_valid": schema_valid}))
        return {"status": "landed", "artifact": str(p), "byte_identical": echoed == reference, "schema_valid": schema_valid}

    def structured_echo_test_landing(args, out):
        p = Path(out.get("artifact", ""))
        if not (p.exists() and out.get("byte_identical") and out.get("schema_valid")):
            return False
        rec = json.loads(p.read_text())
        return rec.get("sent") == rec.get("returned") and rec.get("schema_valid") is True

    registry.register(ToolSpec(
        name="structured_echo_test",
        description="Round-trip a JSON payload through serialize/parse/serialize; persist both sides to test-output/structured-echo.json. Landing check: byte-identical + schema-valid, re-read from artifact.",
        mechanism="file op — serialize known JSON payload; pass to tool; receive return; assert byte-identical + schema validation",
        reversibility="reversible",
        permission="write",
        input_schema={"type": "object", "properties": {"payload": {"type": "string"}}, "required": []},
        execute=structured_echo_test_execute,
        landing_check=structured_echo_test_landing,
        risk_class="low",
    ))

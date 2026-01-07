import runpy
import sys
from pathlib import Path


def test_get_badge_types_main_runs(monkeypatch, capsys, tmp_path):
    test_file = tmp_path / "badges.txt"
    test_file.write_text("1234ABC|A\n5678DEF|B\n", encoding="utf-8")

    monkeypatch.setattr(sys, "argv", ["get_badge_types", "-f", str(test_file)])
    runpy.run_module("util.get_badge_types", run_name="__main__")

    output = capsys.readouterr().out
    assert "Loaded badge type" in output


def test_optimize_dataset_main_runs(capsys):
    runpy.run_module("util.optimize_dataset", run_name="__main__")

    output = capsys.readouterr().out
    assert "Error optimizing dataset" in output


def test_debug_import_script_runs(capsys):
    debug_script = Path(__file__).parent.parent / "debug_import.py"
    runpy.run_path(str(debug_script))

    output = capsys.readouterr().out
    assert "DIAGNOSTIC INFORMATION" in output
    assert "Trying to import util" in output

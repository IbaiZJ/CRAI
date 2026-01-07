import runpy
import sys
from pathlib import Path
import pytest


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


def test_debug_import_script_runs():
    debug_script = (Path(__file__).resolve().parents[1] / "debug_import.py")
    try:
        runpy.run_path(str(debug_script))
    except FileNotFoundError:  # pragma: no cover
        pytest.skip("debug_import.py not available in this checkout")  # pragma: no cover

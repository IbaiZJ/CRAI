import os
from pathlib import Path
from unittest.mock import Mock

import yaml

from config.config import Config


def test_load_existing_config(tmp_path):
    cfg_path = tmp_path / "config.yaml"
    cfg_path.write_text("camera:\n  source: 7\nocr:\n  enabled: false\n", encoding="utf-8")

    cfg = Config(str(cfg_path))
    assert cfg.get("camera.source") == 7
    assert cfg.get("ocr.enabled") is False


def test_load_missing_config_uses_default(tmp_path):
    cfg = Config(str(tmp_path / "missing.yaml"))
    assert cfg.get("camera.source") == 1
    assert cfg.get("ocr.enabled") is True


def test_load_error_uses_default(monkeypatch, tmp_path):
    cfg_path = tmp_path / "broken.yaml"
    cfg_path.write_text(":::", encoding="utf-8")

    monkeypatch.setattr(yaml, "safe_load", Mock(side_effect=RuntimeError("bad")))
    cfg = Config(str(cfg_path))
    assert cfg.get("camera.source") == 1


def test_get_set_and_properties(tmp_path):
    cfg_path = tmp_path / "config.yaml"
    cfg_path.write_text("camera:\n  source: 2\n", encoding="utf-8")

    cfg = Config(str(cfg_path))
    cfg.set("display.window_name", "test")
    assert cfg.get("display.window_name") == "test"
    assert cfg.get("missing.path", default="x") == "x"
    assert cfg.camera_source == 2
    assert cfg.vehicle_model_path == "yolov8n.pt"
    assert cfg.vehicle_confidence == 0.5
    assert cfg.plate_model_path == "models/license_plate_detector.pt"
    assert cfg.plate_confidence == 0.3
    assert cfg.ocr_enabled is True
    assert cfg.ocr_languages == ["en"]
    assert cfg.ocr_confidence == 0.3
    assert cfg.debug_enabled is False


def test_save_and_reload(tmp_path):
    cfg_path = tmp_path / "config.yaml"
    cfg = Config(str(cfg_path))
    cfg.set("camera.source", 3)

    assert cfg.save(str(cfg_path)) is True
    assert cfg_path.exists()

    cfg_path.write_text("camera:\n  source: 9\n", encoding="utf-8")
    cfg.reload()
    assert cfg.get("camera.source") == 9


def test_save_failure(monkeypatch, tmp_path):
    cfg_path = tmp_path / "config.yaml"
    cfg = Config(str(cfg_path))

    monkeypatch.setattr(os, "makedirs", Mock(side_effect=OSError("nope")))
    assert cfg.save(str(cfg_path)) is False


def test_print_config(capsys, tmp_path):
    cfg_path = tmp_path / "config.yaml"
    cfg = Config(str(cfg_path))
    cfg.print_config()

    out = capsys.readouterr().out
    assert "CURRENT CONFIGURATION" in out

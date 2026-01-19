import runpy
import sys
import types
from pathlib import Path

import numpy as np


def test_ssd_load_script_runs(monkeypatch, tmp_path):
    class DummyDetector:
        def __init__(self, model_path=None):
            self.anchors = [0, 1, 2]

        def detect(self, img):
            return [{"confidence": 0.5, "bbox": [0, 0, 10, 10]}]

    fake_ssd = types.SimpleNamespace(SSDVehicleDetector=DummyDetector)
    monkeypatch.setitem(sys.modules, "detectors.ssd_detector", fake_ssd)

    fake_cv2 = types.SimpleNamespace()
    fake_cv2.imread = lambda path: np.zeros((10, 10, 3), dtype=np.uint8)
    monkeypatch.setitem(sys.modules, "cv2", fake_cv2)

    import glob

    monkeypatch.setattr(glob, "glob", lambda pattern: [str(tmp_path / "a.jpg")])
    monkeypatch.setattr("os.path.exists", lambda path: True)

    monkeypatch.chdir(tmp_path)

    script_path = Path(__file__).resolve().parents[1] / "src" / "test_ssd_load.py"
    runpy.run_path(str(script_path))

    assert (tmp_path / "test_output.txt").exists()

import io
import numpy as np
import tensorflow as tf
import sys
import types

from scripts import diagnose_ssd as diag
from scripts import train_ssd as train


def test_diagnose_check_model_files(monkeypatch):
    # Simula un modelo válido mayor de 5MB
    def fake_exists(path):
        return path.endswith("src/models") or path.endswith("notebooks/models") or path.endswith("model.keras")

    def fake_listdir(path):
        return ["model.keras"]

    def fake_getsize(path):
        return 6 * 1024 * 1024  # 6 MB

    monkeypatch.setattr(diag.os.path, "exists", fake_exists)
    monkeypatch.setattr(diag.os, "listdir", fake_listdir)
    monkeypatch.setattr(diag.os.path, "getsize", fake_getsize)

    assert diag.check_model_files() is True


def test_diagnose_check_dataset(monkeypatch):
    yaml_content = "nc: 4\nnames: [bus, car, truck, van]"

    def fake_exists(path):
        return path.endswith("data.yaml")

    def fake_open(path, mode="r", encoding=None):
        return io.StringIO(yaml_content)

    monkeypatch.setattr(diag.os.path, "exists", fake_exists)
    monkeypatch.setattr("builtins.open", fake_open)

    assert diag.check_dataset() is True


def test_diagnose_analyze_bbox_distribution(monkeypatch):
    label_text = "0 0.5 0.5 0.1 0.2\n1 0.4 0.4 0.05 0.05"

    def fake_exists(path):
        return path.endswith("labels")

    def fake_glob(pattern):
        return ["label1.txt", "label2.txt"]

    def fake_open(path, mode="r", encoding=None):
        return io.StringIO(label_text)

    monkeypatch.setattr(diag.os.path, "exists", fake_exists)
    monkeypatch.setattr(diag.glob, "glob", fake_glob)
    monkeypatch.setattr("builtins.open", fake_open)

    assert diag.analyze_bbox_distribution() is True


def test_train_generate_anchors_shape():
    anchors = train.generate_all_anchors()
    # Expected anchors: sum(fh*fw*len(ASPECT_RATIOS)) for each feature map
    expected = sum(fh * fw * len(train.ASPECT_RATIOS) for fh, fw in train.FEATURE_MAP_SIZES)
    assert int(tf.shape(anchors)[0].numpy()) == expected


def test_train_load_yolo_label(tmp_path):
    label_file = tmp_path / "sample.txt"
    label_file.write_text("0 0.5 0.5 0.2 0.1\n0 0.3 0.3 0.1 0.2")

    boxes, classes = train.load_yolo_label(str(label_file))
    assert boxes.shape == (2, 4)
    assert np.all(classes == 0)


def test_diagnose_check_dataset_missing(monkeypatch):
    monkeypatch.setattr(diag.os.path, "exists", lambda path: False)
    assert diag.check_dataset() is False


def test_diagnose_analyze_bbox_distribution_missing(monkeypatch):
    monkeypatch.setattr(diag.os.path, "exists", lambda path: False)
    assert diag.analyze_bbox_distribution() is False


def test_diagnose_model_loading_success(monkeypatch):
    class FakeLayer:
        name = "detect_conv"

        def get_weights(self):
            return [np.array([[0.02]]), np.array([0.0])]

    class FakeDetector:
        def __init__(self, conf_threshold=0.5):
            self.available = True
            self.anchors = [1, 2]
            self.conf_threshold = conf_threshold
            self.model = types.SimpleNamespace(layers=[FakeLayer()])

    detectors_pkg = types.ModuleType("detectors")
    ssd_mod = types.ModuleType("detectors.ssd_detector")
    ssd_mod.SSDVehicleDetector = FakeDetector
    monkeypatch.setitem(sys.modules, "detectors", detectors_pkg)
    monkeypatch.setitem(sys.modules, "detectors.ssd_detector", ssd_mod)

    assert diag.test_model_loading() is True


def test_diagnose_model_loading_failure(monkeypatch):
    class FailingDetector:
        def __init__(self, conf_threshold=0.5):
            raise RuntimeError("boom")

    detectors_pkg = types.ModuleType("detectors")
    ssd_mod = types.ModuleType("detectors.ssd_detector")
    ssd_mod.SSDVehicleDetector = FailingDetector
    monkeypatch.setitem(sys.modules, "detectors", detectors_pkg)
    monkeypatch.setitem(sys.modules, "detectors.ssd_detector", ssd_mod)

    assert diag.test_model_loading() is False


def test_diagnose_inference_without_detections(monkeypatch):
    class FakeDetector:
        def __init__(self, conf_threshold=0.3):
            self.available = True

        def detect(self, frame):
            return []

    class FakeCV2(types.SimpleNamespace):
        def imread(self, path):
            return None

    detectors_pkg = types.ModuleType("detectors")
    ssd_mod = types.ModuleType("detectors.ssd_detector")
    ssd_mod.SSDVehicleDetector = FakeDetector
    monkeypatch.setitem(sys.modules, "detectors", detectors_pkg)
    monkeypatch.setitem(sys.modules, "detectors.ssd_detector", ssd_mod)

    fake_cv2 = FakeCV2()
    monkeypatch.setitem(sys.modules, "cv2", fake_cv2)
    monkeypatch.setattr(diag.glob, "glob", lambda pattern: [])

    assert diag.test_inference() is True

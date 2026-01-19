import io
import numpy as np
import tensorflow as tf

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
    monkeypatch.setattr(diag, "open", fake_open)

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
    monkeypatch.setattr(diag, "open", fake_open)

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

import os
import types
from pathlib import Path

import numpy as np
import tensorflow as tf

from detectors import ssd_detector as ssd


class DummyLogger:
    def __init__(self):
        self.messages = []

    def info(self, msg, *args, **kwargs):
        self.messages.append(("info", msg))

    def warning(self, msg, *args, **kwargs):
        self.messages.append(("warning", msg))

    def error(self, msg, *args, **kwargs):
        self.messages.append(("error", msg))

    def debug(self, msg, *args, **kwargs):
        self.messages.append(("debug", msg))


class DummyLayer:
    def __init__(self, name):
        self.name = name
        self.weights = None

    def set_weights(self, weights):
        self.weights = weights


class DummyModel:
    def __init__(self, predictions=None):
        self._predictions = predictions
        self.load_calls = 0

    def predict(self, inputs, verbose=0):
        return self._predictions

    def load_weights(self, *args, **kwargs):
        self.load_calls += 1
        if self.load_calls == 1:
            raise RuntimeError("load failed")


def _fake_backbone(input_tensor):
    x = tf.keras.layers.Conv2D(1, (1, 1), name="block_6_expand_relu")(input_tensor)
    x = tf.keras.layers.Conv2D(1, (1, 1), name="block_13_expand_relu")(x)
    x = tf.keras.layers.Conv2D(1, (1, 1), name="out_relu")(x)
    return tf.keras.Model(inputs=input_tensor, outputs=x, name="fake_backbone")


def test_ssd_model_call_and_config():
    base = lambda inputs, training=False: ("base", inputs, training)
    model = ssd.SSDModel(base_model=base)
    assert model.call("x", training=True) == ("base", "x", True)

    cfg = model.get_config()
    cfg["base_model"] = "x"
    cfg["box_loss_fn"] = "y"
    cfg["class_loss_fn"] = "z"
    new_model = ssd.SSDModel.from_config(cfg)
    assert isinstance(new_model, ssd.SSDModel)


def test_generate_anchors_and_decode_boxes():
    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.ASPECT_RATIOS = [1.0, 2.0]
    anchors = det._generate_anchors_for_feature_map((1, 1), 0.1, 0.3)
    assert anchors.shape == (2, 4)

    anchors_tf = tf.constant(anchors, dtype=tf.float32)
    box_preds = tf.zeros((anchors.shape[0], 4), dtype=tf.float32)
    decoded = det._decode_boxes(box_preds, anchors_tf)
    assert decoded.shape[1] == 4


def test_non_maximum_suppression():
    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.nms_threshold = 0.5
    boxes = tf.constant([[0.5, 0.5, 0.2, 0.2], [0.52, 0.52, 0.2, 0.2]], dtype=tf.float32)
    scores = tf.constant([0.9, 0.8], dtype=tf.float32)
    selected = det._non_maximum_suppression(boxes, scores, max_output_size=2)
    assert int(tf.size(selected)) >= 1


def test_preprocess(monkeypatch):
    fake_cv2 = types.SimpleNamespace()
    fake_cv2.COLOR_BGR2RGB = 1

    def resize(img, size):
        return np.zeros((size[1], size[0], 3), dtype=np.uint8)

    def cvtColor(img, code):
        return img

    fake_cv2.resize = resize
    fake_cv2.cvtColor = cvtColor
    monkeypatch.setattr(ssd, "cv2", fake_cv2)

    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.IMG_WIDTH = 4
    det.IMG_HEIGHT = 2
    out = det._preprocess(np.zeros((1, 1, 3), dtype=np.uint8))
    assert out.shape == (1, 2, 4, 3)


def test_build_base_model_with_fallback(monkeypatch):
    calls = {"count": 0}

    def fake_mobilenet(*args, **kwargs):
        calls["count"] += 1
        if calls["count"] == 1:
            raise RuntimeError("no imagenet")
        return _fake_backbone(kwargs["input_tensor"])

    monkeypatch.setattr(ssd, "MobileNetV2", fake_mobilenet)

    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.logger = DummyLogger()
    model = det._build_base_model()
    assert model is not None


def test_init_loads_keras_model(monkeypatch):
    dummy_logger = DummyLogger()
    monkeypatch.setattr(ssd, "get_logger", lambda name: dummy_logger)

    class KerasModel:
        def predict(self, inputs, verbose=0):
            return {"boxes": np.zeros((1, 1, 4)), "classes": np.zeros((1, 1, 1))}

    monkeypatch.setattr(ssd.tf.keras.models, "load_model", lambda *args, **kwargs: KerasModel())
    monkeypatch.setattr(ssd.SSDVehicleDetector, "_generate_all_anchors", lambda self: tf.zeros((1, 4)))

    def fake_exists(path):
        return bool(path) and path.endswith(".keras")

    monkeypatch.setattr(ssd.os.path, "exists", fake_exists)

    det = ssd.SSDVehicleDetector(model_path="model.keras")
    assert det.available is True


def test_init_loads_weights_skip_mismatch(monkeypatch):
    dummy_logger = DummyLogger()
    monkeypatch.setattr(ssd, "get_logger", lambda name: dummy_logger)
    monkeypatch.setattr(ssd.tf.keras.models, "load_model", lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("nope")))

    def fake_exists(path):
        return bool(path) and path.endswith(".weights.h5")

    monkeypatch.setattr(ssd.os.path, "exists", fake_exists)

    def fake_build(self):
        return DummyModel()

    monkeypatch.setattr(ssd.SSDVehicleDetector, "_build_base_model", fake_build)
    monkeypatch.setattr(ssd.SSDVehicleDetector, "_generate_all_anchors", lambda self: tf.zeros((1, 4)))

    det = ssd.SSDVehicleDetector(weights_path="weights.weights.h5")
    assert det.available is True


def test_init_no_model_loaded(monkeypatch):
    dummy_logger = DummyLogger()
    monkeypatch.setattr(ssd, "get_logger", lambda name: dummy_logger)
    monkeypatch.setattr(ssd.tf.keras.models, "load_model", lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("nope")))
    monkeypatch.setattr(ssd.os.path, "exists", lambda path: False)
    monkeypatch.setattr(ssd.SSDVehicleDetector, "_build_base_model", lambda self: DummyModel())
    monkeypatch.setattr(ssd.SSDVehicleDetector, "_generate_all_anchors", lambda self: tf.zeros((1, 4)))

    det = ssd.SSDVehicleDetector()
    assert det.available is True


def test_load_weights_from_keras_file(tmp_path):
    import h5py
    import zipfile

    detector = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    detector.logger = DummyLogger()

    layer_names = [
        "detect_0_box_conv",
        "detect_1_box_conv",
        "detect_2_box_conv",
        "detect_0_class_conv",
        "detect_1_class_conv",
        "detect_2_class_conv",
    ]
    layers = {name: DummyLayer(name) for name in layer_names}

    class ModelWithLayers:
        def get_layer(self, name):
            return layers[name]

    detector.model = ModelWithLayers()

    weights_file = tmp_path / "model.weights.h5"
    with h5py.File(weights_file, "w") as f:
        for idx in range(35, 41):
            grp = f.create_group(f"base_model/base_model/layers/conv2d_{idx}/vars")
            grp.create_dataset("0", data=np.zeros((1, 1, 1, 1), dtype=np.float32))
            grp.create_dataset("1", data=np.zeros((1,), dtype=np.float32))

    keras_path = tmp_path / "model.keras"
    with zipfile.ZipFile(keras_path, "w") as zf:
        zf.write(weights_file, "model.weights.h5")

    assert detector._load_weights_from_keras_file(str(keras_path)) is True


def test_load_weights_from_keras_file_missing_weights(tmp_path):
    import zipfile

    detector = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    detector.logger = DummyLogger()
    detector.model = DummyModel()

    keras_path = tmp_path / "model.keras"
    with zipfile.ZipFile(keras_path, "w") as zf:
        zf.writestr("other.txt", "x")

    assert detector._load_weights_from_keras_file(str(keras_path)) is False


def test_detect_paths(monkeypatch):
    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.available = True
    det.conf_threshold = 0.5
    det.nms_threshold = 0.3
    det.logger = DummyLogger()
    det.anchors = tf.constant(
        [[0.5, 0.5, 0.2, 0.2], [0.1, 0.1, 0.05, 0.05], [0.5, 0.5, 0.95, 0.95]],
        dtype=tf.float32,
    )

    box_preds = np.zeros((3, 4), dtype=np.float32)
    class_preds = np.array([[0.9], [0.6], [0.7]], dtype=np.float32)
    det.model = DummyModel(predictions={"boxes": np.expand_dims(box_preds, 0), "classes": np.expand_dims(class_preds, 0)})

    monkeypatch.setattr(det, "_preprocess", lambda frame: np.zeros((1, 1, 1, 3), dtype=np.float32))
    monkeypatch.setattr(det, "_decode_boxes", lambda boxes, anchors: tf.constant(anchors.numpy(), dtype=tf.float32))
    monkeypatch.setattr(det, "_non_maximum_suppression", lambda boxes, scores: tf.constant([0]))

    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    detections = det.detect(frame)
    assert len(detections) == 1

    class_preds_multi = np.array(
        [[0.2, 0.9], [0.1, 0.2], [0.05, 0.3]],
        dtype=np.float32,
    )
    det.model = DummyModel(predictions=[np.expand_dims(box_preds, 0), np.expand_dims(class_preds_multi, 0)])
    monkeypatch.setattr(det, "_non_maximum_suppression", lambda boxes, scores: tf.constant([0]))
    detections = det.detect(frame)
    assert len(detections) == 1

    array_preds = np.zeros((1, 3, 5), dtype=np.float32)
    array_preds[0, :, 4] = 0.4
    det.model = DummyModel(predictions=array_preds)
    detections = det.detect(frame)
    assert detections == []


def test_detect_not_available():
    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    det.available = False
    assert det.detect(np.zeros((10, 10, 3), dtype=np.uint8)) == []


def test_draw_detections(monkeypatch):
    fake_cv2 = types.SimpleNamespace()
    fake_cv2.rectangle = lambda *args, **kwargs: None
    fake_cv2.putText = lambda *args, **kwargs: None
    fake_cv2.getTextSize = lambda *args, **kwargs: ((10, 10), None)
    fake_cv2.FONT_HERSHEY_SIMPLEX = 0
    monkeypatch.setattr(ssd, "cv2", fake_cv2)

    det = ssd.SSDVehicleDetector.__new__(ssd.SSDVehicleDetector)
    frame = np.zeros((20, 20, 3), dtype=np.uint8)
    detections = [{"bbox": [1, 2, 10, 12], "confidence": 0.9}]
    out = det.draw_detections(frame, detections)
    assert isinstance(out, np.ndarray)

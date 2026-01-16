import importlib
import sys
import types
import numpy as np
from unittest.mock import Mock


class DummyTensor:
    def __init__(self, arr):
        self._arr = np.array(arr, dtype=float)

    def cpu(self):
        return self

    def numpy(self):
        return self._arr


class DummyBox:
    def __init__(self, cls_id, xyxy, conf):
        self.cls = [cls_id]
        self.xyxy = [DummyTensor(xyxy)]
        self.conf = [conf]


class DummyResults:
    def __init__(self, boxes):
        self.boxes = boxes


class DummyModel:
    def __init__(self, results):
        self._results = results

    def __call__(self, frame, conf=0.5, verbose=False):
        return [self._results]


def _mock_cv2(monkeypatch, module):
    monkeypatch.setattr(module.cv2, "rectangle", Mock())
    monkeypatch.setattr(module.cv2, "putText", Mock())
    monkeypatch.setattr(module.cv2, "getTextSize", Mock(return_value=((10, 10), None)))
    monkeypatch.setattr(module.cv2, "FONT_HERSHEY_SIMPLEX", 0, raising=False)


def _load_vehicle_module(monkeypatch, model):
    fake_ultra = types.SimpleNamespace(YOLO=Mock(return_value=model))
    monkeypatch.setitem(sys.modules, "ultralytics", fake_ultra)
    return importlib.reload(importlib.import_module("detectors.vehicle_detector"))


def _load_plate_module(monkeypatch, model):
    fake_ultra = types.SimpleNamespace(YOLO=Mock(return_value=model))
    monkeypatch.setitem(sys.modules, "ultralytics", fake_ultra)
    return importlib.reload(importlib.import_module("detectors.plate_detector"))


def test_vehicle_detector_detect_and_draw(monkeypatch):
    boxes = [
        DummyBox(2, [1, 2, 3, 4], 0.9),  # car
        DummyBox(0, [5, 6, 7, 8], 0.8),  # non-vehicle
    ]
    model = DummyModel(DummyResults(boxes))
    vehicle_module = _load_vehicle_module(monkeypatch, model)
    _mock_cv2(monkeypatch, vehicle_module)

    det = vehicle_module.VehicleDetector(model_path="dummy.pt", conf_threshold=0.1)
    frame = np.zeros((10, 10, 3), dtype=np.uint8)
    detections = det.detect(frame)

    assert len(detections) == 1
    assert detections[0]["class_name"] == "car"

    out = det.draw_detections(frame, detections)
    assert isinstance(out, np.ndarray)


def test_plate_detector_detect_with_roi_and_draw(monkeypatch):
    boxes = [
        DummyBox(0, [5, 5, 15, 15], 0.7),
    ]
    model = DummyModel(DummyResults(boxes))
    plate_module = _load_plate_module(monkeypatch, model)
    _mock_cv2(monkeypatch, plate_module)

    det = plate_module.PlateDetector(model_path="dummy.pt", conf_threshold=0.1)
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    vehicle_bbox = [10, 10, 60, 60]
    detections = det.detect(frame, vehicle_bbox)

    assert detections[0]["bbox"] == [15, 15, 25, 25]

    out = det.draw_detections(frame, detections)
    assert isinstance(out, np.ndarray)


def test_plate_detector_detect_in_vehicles(monkeypatch):
    model = DummyModel(DummyResults([]))
    plate_module = _load_plate_module(monkeypatch, model)

    det = plate_module.PlateDetector(model_path="dummy.pt", conf_threshold=0.1)
    frame = np.zeros((10, 10, 3), dtype=np.uint8)

    monkeypatch.setattr(det, "detect", Mock(side_effect=[[{"bbox": [1, 2, 3, 4], "confidence": 0.9}], []]))
    vehicles = [{"bbox": [0, 0, 5, 5]}, {"bbox": [1, 1, 6, 6]}]

    results = det.detect_in_vehicles(frame, vehicles)
    assert len(results) == 1


def test_plate_detector_draw_vehicles_with_plates(monkeypatch):
    plate_module = _load_plate_module(monkeypatch, DummyModel(DummyResults([])))
    _mock_cv2(monkeypatch, plate_module)
    det = plate_module.PlateDetector.__new__(plate_module.PlateDetector)

    frame = np.zeros((20, 20, 3), dtype=np.uint8)
    vehicle = {"bbox": [1, 2, 3, 4], "class_name": "car", "confidence": 0.9}
    plates = [{"bbox": [5, 6, 7, 8], "confidence": 0.8}]

    out = plate_module.PlateDetector.draw_vehicles_with_plates(det, frame, [(vehicle, plates)])
    assert isinstance(out, np.ndarray)


def test_plate_detector_init_error(monkeypatch):
    class FailingModel:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("no model")

    fake_ultra = types.SimpleNamespace(YOLO=FailingModel)
    monkeypatch.setitem(sys.modules, "ultralytics", fake_ultra)
    plate_module = importlib.reload(importlib.import_module("detectors.plate_detector"))

    try:
        plate_module.PlateDetector(model_path="missing.pt")
    except RuntimeError:
        pass
    else:
        assert False, "Expected model load error"

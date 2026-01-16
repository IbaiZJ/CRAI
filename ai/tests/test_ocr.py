import builtins
import sys
import types
from unittest.mock import Mock

import numpy as np

from detectors import ocr as ocr_module


class DummyLogger:
    def info(self, *args, **kwargs):
        pass

    def warning(self, *args, **kwargs):
        pass

    def error(self, *args, **kwargs):
        pass

    def debug(self, *args, **kwargs):
        pass


def _install_fake_easyocr(monkeypatch):
    class FakeReader:
        def __init__(self, languages, gpu=False, verbose=False):
            self.languages = languages
            self.gpu = gpu
            self.readtext = Mock()

    fake_mod = types.SimpleNamespace(Reader=FakeReader)
    monkeypatch.setitem(sys.modules, "easyocr", fake_mod)
    return fake_mod


def _make_fake_cv2():
    fake = types.SimpleNamespace()
    fake.COLOR_BGR2GRAY = 0
    fake.INTER_AREA = 1
    fake.INTER_LINEAR = 2
    fake.INTER_CUBIC = 3
    fake.THRESH_BINARY = 4
    fake.THRESH_OTSU = 8
    fake.ADAPTIVE_THRESH_GAUSSIAN_C = 5
    fake.MORPH_CLOSE = 6

    def cvtColor(img, code):
        return np.zeros(img.shape[:2], dtype=np.uint8)

    def resize(img, size, interpolation=None):
        return np.zeros((size[1], size[0]), dtype=np.uint8)

    class CLAHE:
        def apply(self, img):
            return img

    def createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)):
        return CLAHE()

    def threshold(img, thresh, maxval, typ):
        return 0, img

    def adaptiveThreshold(img, maxval, method, typ, blockSize, C):
        return img

    def bilateralFilter(img, d, sigmaColor, sigmaSpace):
        return img

    def morphologyEx(img, op, kernel):
        return img

    def fastNlMeansDenoising(img, *args, **kwargs):
        return img

    fake.cvtColor = cvtColor
    fake.resize = resize
    fake.createCLAHE = createCLAHE
    fake.threshold = threshold
    fake.adaptiveThreshold = adaptiveThreshold
    fake.bilateralFilter = bilateralFilter
    fake.morphologyEx = morphologyEx
    fake.fastNlMeansDenoising = fastNlMeansDenoising
    return fake


def test_init_import_error(monkeypatch):
    original_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == "easyocr":
            raise ImportError("nope")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", fake_import)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))

    reader = ocr_module.PlateReader()
    assert reader.available is False
    result = reader.read_plate(np.zeros((20, 40, 3), dtype=np.uint8))
    assert result["text"] == "OCR_NO_DISPONIBLE"


def test_read_plate_basic_paths(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    assert reader.available is True

    assert reader.read_plate(None)["success"] is False

    small = np.zeros((10, 10, 3), dtype=np.uint8)
    assert reader.read_plate(small)["success"] is False


def test_init_exception(monkeypatch):
    class FakeReader:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("bad init")

    fake_mod = types.SimpleNamespace(Reader=FakeReader)
    monkeypatch.setitem(sys.modules, "easyocr", fake_mod)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))

    reader = ocr_module.PlateReader()
    assert reader.available is False


def test_get_image_hash(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    assert reader._get_image_hash(None) is None
    assert reader._get_image_hash(np.zeros((0, 0), dtype=np.uint8)) is None
    assert reader._get_image_hash(np.zeros((8, 8, 3), dtype=np.uint8)) is not None


def test_read_plate_cache_and_valid_result(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    reader.reader.readtext.return_value = [
        (None, "1234 BCD", 0.95),
    ]
    monkeypatch.setattr(reader, "_preprocess_fast", Mock(return_value=np.zeros((64, 64), dtype=np.uint8)))
    monkeypatch.setattr(reader, "_get_image_hash", Mock(return_value="hash1"))

    img = np.zeros((20, 40, 3), dtype=np.uint8)
    result1 = reader.read_plate(img, use_cache=True)
    result2 = reader.read_plate(img, use_cache=True)

    assert result1["success"] is True
    assert result1["text"] == "1234BCD"
    assert result2["success"] is True
    assert reader.reader.readtext.call_count == 1


def test_read_plate_invalid_and_exception(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    reader.reader.readtext.return_value = [
        (None, "AB", 0.05),
    ]
    monkeypatch.setattr(reader, "_preprocess_fast", Mock(return_value=np.zeros((64, 64), dtype=np.uint8)))

    img = np.zeros((20, 40, 3), dtype=np.uint8)
    result = reader.read_plate(img, use_cache=False)
    assert result["success"] is False

    reader.reader.readtext.side_effect = RuntimeError("boom")
    result = reader.read_plate(img, use_cache=False)
    assert result["success"] is False

    reader.reader.readtext.side_effect = None
    reader.reader.readtext.return_value = []
    result = reader.read_plate(img, use_cache=False)
    assert result["success"] is False


def test_cache_eviction(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    reader.reader.readtext.return_value = [(None, "1234 BCD", 0.95)]
    reader._cache_max_size = 1
    monkeypatch.setattr(reader, "_preprocess_fast", Mock(return_value=np.zeros((64, 64), dtype=np.uint8)))
    monkeypatch.setattr(reader, "_get_image_hash", Mock(side_effect=["a", "b"]))

    img = np.zeros((20, 40, 3), dtype=np.uint8)
    reader.read_plate(img, use_cache=True)
    reader.read_plate(img, use_cache=True)
    assert list(reader._cache.keys()) == ["b"]


def test_stabilized_and_batch(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))

    reader = ocr_module.PlateReader()
    monkeypatch.setattr(reader, "read_plate", Mock(return_value={"success": True, "text": "1234BCD"}))

    img = np.zeros((20, 40, 3), dtype=np.uint8)
    reader.read_plate_stabilized(img)
    reader.read_plate_stabilized(img)
    result = reader.read_plate_stabilized(img)
    assert result.get("stabilized") is True

    batch = reader.read_plates_batch([img, img])
    assert len(batch) == 2


def test_preprocess_and_clean(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))
    monkeypatch.setattr(ocr_module, "cv2", _make_fake_cv2())

    reader = ocr_module.PlateReader()
    img = np.zeros((20, 40, 3), dtype=np.uint8)

    assert reader._preprocess_simple(img).ndim == 2
    assert reader._preprocess_fast(img).ndim == 2
    assert reader._preprocess_high_contrast(img).ndim == 2
    assert reader._preprocess_plate(img).ndim == 2

    gray = np.zeros((20, 40), dtype=np.uint8)
    assert reader._preprocess_simple(gray).ndim == 2
    assert reader._preprocess_fast(gray).ndim == 2
    assert reader._preprocess_high_contrast(gray).ndim == 2
    assert reader._preprocess_plate(gray).ndim == 2

    assert reader.validate_plate("1234BCD") == "1234BCD"
    assert reader.validate_plate("") is None
    assert reader.validate_plate("ABC123") is None
    assert reader._clean_plate_text("") == ""
    assert reader._clean_plate_text("12") == "12"
    assert reader._clean_plate_text("1234 BCD") == "1234BCD"
    assert reader._clean_plate_text("1234B$D") == ""
    assert reader._clean_plate_text("12-34-AAA") == ""


def test_get_stable_reading_and_find_common_core(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))

    reader = ocr_module.PlateReader()
    reader._history.extend(["AAAA", "BBBB"])
    assert reader.get_stable_reading() is None
    assert list(reader._history) == ["BBBB"]

    reader._history.clear()
    reader._history.extend(["MI808THA", "MI808TH", "M808TH"])
    assert reader.get_stable_reading() is None

    reader._history.clear()
    reader._history.extend(["ABC", "ABD", "ABE"])
    assert reader.get_stable_reading() == "ABC"

    reader._history.clear()
    reader._history.extend(["A"])
    assert reader.get_stable_reading(min_occurrences=2) is None

    assert reader._find_common_core([]) is None
    assert reader._find_common_core(["A", "B", "C"]) is None


def test_reset_history(monkeypatch):
    _install_fake_easyocr(monkeypatch)
    monkeypatch.setattr(ocr_module, "get_logger", Mock(return_value=DummyLogger()))

    reader = ocr_module.PlateReader()
    reader._history.extend(["A", "B"])
    reader._cache["x"] = {"text": "1234BCD"}
    reader.reset_history()
    assert len(reader._history) == 0
    assert reader._cache == {}

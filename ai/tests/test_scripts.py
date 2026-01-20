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


# Additional tests for better coverage

def test_train_load_image_and_preprocess(tmp_path):
    """Test load_image function with actual image file"""
    import cv2
    # Create a simple test image
    img_path = tmp_path / "test_img.jpg"
    test_img = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(img_path), test_img)
    
    loaded_img = train.load_image(str(img_path))
    assert loaded_img.shape == (train.IMG_HEIGHT, train.IMG_WIDTH, 3)
    assert tf.reduce_min(loaded_img).numpy() >= 0.0
    assert tf.reduce_max(loaded_img).numpy() <= 1.0


def test_train_augment_image_and_boxes():
    """Test data augmentation function"""
    image = np.random.rand(train.IMG_HEIGHT, train.IMG_WIDTH, 3).astype(np.float32)
    image = tf.constant(image)
    boxes = tf.constant([[0.3, 0.3, 0.2, 0.2], [0.7, 0.7, 0.15, 0.15]], dtype=tf.float32)
    
    augmented_img, aug_boxes = train.augment_image_and_boxes(image, boxes)
    
    # Check image is still in valid range
    assert tf.reduce_min(augmented_img).numpy() >= 0.0
    assert tf.reduce_max(augmented_img).numpy() <= 1.0
    
    # Check boxes are preserved
    assert aug_boxes.shape == boxes.shape


def test_train_index_dataset(tmp_path):
    """Test dataset indexing"""
    images_dir = tmp_path / "images"
    labels_dir = tmp_path / "labels"
    images_dir.mkdir()
    labels_dir.mkdir()
    
    # Create dummy files
    for i in range(3):
        img_path = images_dir / f"img_{i:06d}.jpg"
        lbl_path = labels_dir / f"img_{i:06d}.txt"
        img_path.touch()
        lbl_path.write_text("0 0.5 0.5 0.1 0.2\n")
    
    samples = train.index_dataset(str(images_dir), str(labels_dir))
    assert len(samples) == 3


def test_train_generate_anchors_for_feature_map():
    """Test anchor generation for single feature map"""
    anchors = train.generate_anchors_for_feature_map((10, 10), 0.05, 0.15)
    assert anchors.shape == (10 * 10 * len(train.ASPECT_RATIOS), 4)
    # Check all anchors are in valid range [0, 1]
    assert np.all(anchors >= 0.0)
    assert np.all(anchors <= 1.0)


def test_train_ssd_box_loss():
    """Test SSDBoxLoss function"""
    anchors = tf.constant(np.random.rand(100, 4).astype(np.float32) * 0.5 + 0.25)
    loss_fn = train.SSDBoxLoss(anchors)
    
    gt_boxes = tf.constant(np.array([[0.3, 0.3, 0.1, 0.1], [0.0, 0.0, 0.0, 0.0]]).reshape(1, 2, 4), dtype=tf.float32)
    pred_boxes = tf.constant(np.random.rand(1, 100, 4).astype(np.float32))
    
    loss = loss_fn(gt_boxes, pred_boxes)
    assert loss.numpy() >= 0.0
    assert not np.isnan(loss.numpy())


def test_train_ssd_class_loss():
    """Test SSDClassLoss function"""
    anchors = tf.constant(np.random.rand(100, 4).astype(np.float32) * 0.5 + 0.25)
    loss_fn = train.SSDClassLoss(anchors, neg_pos_ratio=3.0)
    
    gt_boxes = tf.constant(np.array([[0.3, 0.3, 0.1, 0.1], [0.0, 0.0, 0.0, 0.0]]).reshape(1, 2, 4), dtype=tf.float32)
    pred_classes = tf.constant(np.random.rand(1, 100, 1).astype(np.float32))
    
    loss = loss_fn(gt_boxes, pred_classes)
    assert loss.numpy() >= 0.0
    assert not np.isnan(loss.numpy())


def test_train_create_detection_head():
    """Test detection head creation"""
    import tensorflow as tf
    feature_map = tf.zeros((1, 32, 32, 256))
    box_out, class_out = train.create_detection_head(
        feature_map, 
        num_anchors=4,
        num_classes=1,
        name_prefix='test'
    )
    
    assert box_out.shape == (1, 32*32*4, 4)
    assert class_out.shape == (1, 32*32*4, 1)


def test_train_draw_boxes_on_image(tmp_path):
    """Test box drawing function"""
    image = np.ones((100, 100, 3), dtype=np.uint8) * 255
    boxes = np.array([[0.5, 0.5, 0.2, 0.2]])
    
    result = train.draw_boxes_on_image(image, boxes)
    assert result.shape == image.shape
    # Verify that drawing happened (some pixels changed)
    assert not np.array_equal(result, image)


def test_diagnose_check_model_files_small(monkeypatch):
    """Test model file detection with small file"""
    def fake_exists(path):
        return path.endswith("src/models") or path.endswith("model.keras")

    def fake_listdir(path):
        return ["model.keras"]

    def fake_getsize(path):
        return 1 * 1024 * 1024  # 1 MB (too small)

    monkeypatch.setattr(diag.os.path, "exists", fake_exists)
    monkeypatch.setattr(diag.os, "listdir", fake_listdir)
    monkeypatch.setattr(diag.os.path, "getsize", fake_getsize)

    assert diag.check_model_files() is True  # Still passes with warning


def test_train_load_yolo_label_empty(tmp_path):
    """Test loading empty label file"""
    label_file = tmp_path / "empty.txt"
    label_file.write_text("")

    boxes, classes = train.load_yolo_label(str(label_file))
    assert boxes.shape == (0, 4)
    assert len(classes) == 0


def test_train_generate_all_anchors():
    """Test full anchor generation"""
    anchors_tensor = train.generate_all_anchors()
    
    # Check total anchors
    expected = sum(fh * fw * len(train.ASPECT_RATIOS) for fh, fw in train.FEATURE_MAP_SIZES)
    assert anchors_tensor.shape[0] == expected
    assert anchors_tensor.shape[1] == 4
    
    # Check all anchors are normalized
    assert tf.reduce_min(anchors_tensor).numpy() >= -0.01  # Allow small numerical error
    assert tf.reduce_max(anchors_tensor).numpy() <= 1.01


def test_diagnose_print_functions(capsys):
    """Test diagnostic print functions"""
    diag.print_ok("test message")
    captured = capsys.readouterr()
    assert "test message" in captured.out
    
    diag.print_error("error message")
    captured = capsys.readouterr()
    assert "error message" in captured.out
    
    diag.print_warn("warning message")
    captured = capsys.readouterr()
    assert "warning message" in captured.out

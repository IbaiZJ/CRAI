import numpy as np
import tensorflow as tf
from pathlib import Path

from scripts import train_ssd as train


def _write_dummy_jpeg(path: Path, size=(8, 8)):
    arr = np.zeros((size[0], size[1], 3), dtype=np.uint8)
    img_bytes = tf.io.encode_jpeg(tf.constant(arr)).numpy()
    path.write_bytes(img_bytes)


def test_load_image_resizes_and_normalizes(tmp_path):
    img_path = tmp_path / "img.jpg"
    _write_dummy_jpeg(img_path)

    img = train.load_image(str(img_path))
    assert img.shape == (train.IMG_HEIGHT, train.IMG_WIDTH, 3)
    assert img.dtype == tf.float32
    assert float(tf.reduce_max(img)) <= 1.0


def test_load_sample_uses_helpers(monkeypatch):
    monkeypatch.setattr(train, "load_image", lambda p: tf.ones((train.IMG_HEIGHT, train.IMG_WIDTH, 3)))
    monkeypatch.setattr(
        train,
        "load_yolo_label",
        lambda p: (np.array([[0.1, 0.1, 0.2, 0.2]], dtype=np.float32), np.array([0], dtype=np.int32)),
    )

    img, tgt = train.load_sample("image", "label")
    assert img.shape == (train.IMG_HEIGHT, train.IMG_WIDTH, 3)
    assert tgt["boxes"].shape == (1, 4)
    assert tgt["classes"].shape == (1,)


def test_augment_image_and_boxes_skip(monkeypatch):
    monkeypatch.setattr(train.tf.random, "uniform", lambda *a, **k: tf.constant(0.0))

    image = tf.ones((2, 2, 3))
    boxes = tf.constant([[0.5, 0.5, 0.2, 0.2]], dtype=tf.float32)
    aug_img, aug_boxes = train.augment_image_and_boxes(image, boxes)

    assert tf.reduce_all(tf.equal(boxes, aug_boxes))
    assert float(tf.reduce_max(aug_img)) <= 1.0


def test_index_dataset_collects_pairs(tmp_path):
    images_dir = tmp_path / "images"
    labels_dir = tmp_path / "labels"
    images_dir.mkdir()
    labels_dir.mkdir()

    img_path = images_dir / "sample.jpg"
    lbl_path = labels_dir / "sample.txt"
    _write_dummy_jpeg(img_path)
    lbl_path.write_text("0 0.5 0.5 0.1 0.1")

    pairs = train.index_dataset(str(images_dir), str(labels_dir))
    assert pairs == [(str(img_path), str(lbl_path))]


def test_generate_anchors_for_feature_map_shape():
    anchors = train.generate_anchors_for_feature_map((2, 2), 0.1, 0.2)
    expected = 2 * 2 * len(train.ASPECT_RATIOS)
    assert anchors.shape == (expected, 4)


def test_ssd_box_loss_returns_value():
    anchors = tf.constant([[0.5, 0.5, 0.2, 0.2]], dtype=tf.float32)
    loss_fn = train.SSDBoxLoss(anchors)
    y_true = tf.constant([[[0.5, 0.5, 0.2, 0.2]]], dtype=tf.float32)
    y_pred = tf.constant([[[0.5, 0.5, 0.2, 0.2]]], dtype=tf.float32)
    loss = loss_fn(y_true, y_pred)
    assert np.isfinite(float(loss.numpy()))


def test_ssd_class_loss_returns_value():
    anchors = tf.constant([[0.5, 0.5, 0.2, 0.2]], dtype=tf.float32)
    loss_fn = train.SSDClassLoss(anchors)
    y_true = tf.constant([[[0.5, 0.5, 0.2, 0.2]]], dtype=tf.float32)
    y_pred = tf.constant([[[0.4]]], dtype=tf.float32)
    loss = loss_fn(y_true, y_pred)
    assert np.isfinite(float(loss.numpy()))


def test_draw_boxes_on_image_clips(monkeypatch):
    calls = []

    def fake_rectangle(img, pt1, pt2, color, thickness):
        calls.append((pt1, pt2))
        return img

    monkeypatch.setattr(train.cv2, "rectangle", fake_rectangle)

    image = np.zeros((10, 10, 3), dtype=np.uint8)
    boxes = np.array([[0.0, 0.0, 0.2, 0.2], [1.2, 1.2, 0.5, 0.5]])
    out = train.draw_boxes_on_image(image, boxes)

    assert out.shape == image.shape
    assert len(calls) == 2

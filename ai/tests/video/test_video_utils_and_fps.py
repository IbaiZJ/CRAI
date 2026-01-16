import datetime
import numpy as np
import cv2
import pytest

from video.fps import FPS
from video.video_utils import (
    VideoUtils,
    ContourError,
    ImageShapeError,
    InvalidImageTypeError,
)


def test_fps_basic_and_realtime():
    fps = FPS().start()
    fps.update()
    fps.update()
    # Simular 2 segundos transcurridos
    fps._end = fps._start + datetime.timedelta(seconds=2)
    assert fps.fps() == pytest.approx(1.0)

    fps._num_frames = 4
    fps._start = datetime.datetime.now() - datetime.timedelta(seconds=2)
    assert fps.fps_realtime() == pytest.approx(2.0, rel=0.2)


def test_resize_aspect_width_and_height():
    img = np.zeros((100, 200, 3), dtype=np.uint8)
    resized_w = VideoUtils.resize(img, width=50)
    assert resized_w.shape[:2] == (25, 50)

    resized_h = VideoUtils.resize(img, height=50)
    assert resized_h.shape[:2] == (50, 100)

    same = VideoUtils.resize(img)
    assert same.shape == img.shape


def test_rotate_translate_crop_rotate_bound():
    img = np.zeros((20, 10, 3), dtype=np.uint8)
    rotated = VideoUtils.rotate(img, angle=90)
    assert rotated.shape == img.shape

    translated = VideoUtils.translate(img, x=2, y=3)
    assert translated.shape == img.shape

    cropped = VideoUtils.crop(img, 0, 0, 5, 5)
    assert cropped.shape == (5, 5, 3)

    rb = VideoUtils.rotate_bound(img, angle=45)
    # rotate_bound expande el lienzo
    assert rb.shape[0] > img.shape[0] and rb.shape[1] > img.shape[1]


def test_skeletonize_and_auto_canny_and_color_convert():
    binary = np.zeros((5, 5), dtype=np.uint8)
    binary[2, 2] = 255
    skel = VideoUtils.skeletonize(binary.copy(), size=(3, 3))
    assert skel.shape == binary.shape

    gray = np.zeros((5, 5), dtype=np.uint8)
    edges = VideoUtils.auto_canny(gray)
    assert edges.shape == gray.shape

    bgr = np.array([[[0, 0, 255]]], dtype=np.uint8)
    rgb = VideoUtils.opencv2matplotlib(bgr)
    assert (rgb[0, 0] == np.array([255, 0, 0])).all()


def test_grab_contours_and_errors():
    cnt = np.array([[1, 2]])
    # Length 2: should return first element
    assert VideoUtils.grab_contours((cnt, None)) is cnt
    # Length 3: should return second element
    assert VideoUtils.grab_contours((None, cnt, None)) is cnt
    # Length 1: should raise error
    with pytest.raises(ContourError):
        VideoUtils.grab_contours((cnt,))
    # Length 4+: should raise error
    with pytest.raises(ContourError):
        VideoUtils.grab_contours((cnt, None, None, None))


def test_brightness_contrast_and_montage_and_versions(monkeypatch):
    img = np.ones((2, 2, 3), dtype=np.uint8) * 10
    brighter = VideoUtils.adjust_brightness_contrast(img, brightness=10, contrast=10)
    assert brighter.mean() > img.mean()

    img_list = [np.zeros((2, 2, 3), dtype=np.uint8), np.ones((2, 2, 3), dtype=np.uint8)]
    montages = VideoUtils.build_montages(img_list, image_shape=(2, 2), montage_shape=(2, 1))
    assert len(montages) == 1
    assert montages[0].shape == (2 * 1, 2 * 2, 3)

    with pytest.raises(ImageShapeError):
        VideoUtils.build_montages(img_list, image_shape=(2,), montage_shape=(2, 1))
    with pytest.raises(ImageShapeError):
        VideoUtils.build_montages(img_list, image_shape=(2, 2), montage_shape=(2,))
    with pytest.raises(InvalidImageTypeError):
        VideoUtils.build_montages(["not-np"], image_shape=(2, 2), montage_shape=(1, 1))

    monkeypatch.setattr(VideoUtils, "get_opencv_major_version", lambda: 4)
    assert VideoUtils.is_cv2() is False
    assert VideoUtils.is_cv3() is False
    assert VideoUtils.is_cv4() is True
    assert VideoUtils.is_cv4(or_better=True) is True
    assert VideoUtils.is_cv3(or_better=True) is True
    assert VideoUtils.is_cv2(or_better=True) is True

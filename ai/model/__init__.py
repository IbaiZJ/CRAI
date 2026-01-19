"""
SSD Vehicle Detection Model Package
====================================

A modular SSD (Single Shot MultiBox Detector) implementation for vehicle detection
using MobileNetV2 as backbone, optimized for the UA-DETRAC dataset.

Modules:
    - config: Model configuration and hyperparameters
    - dataset: Data loading and augmentation utilities
    - anchors: Anchor box generation
    - model: SSD model architecture
    - losses: Custom loss functions (box regression, classification)
    - train: Training pipeline
    - utils: Visualization and helper utilities
"""

from .config import (
    IMG_HEIGHT,
    IMG_WIDTH,
    IMG_SIZE,
    NUM_CLASSES,
    NUM_ANCHORS,
    FEATURE_MAP_SIZES,
    SCALES,
    ASPECT_RATIOS,
    FEATURE_LAYER_NAMES,
)

from .anchors import generate_all_anchors, generate_anchors_for_feature_map
from .model import build_ssd_model, create_detection_head, SSDModel
from .losses import SSDBoxLoss, SSDClassLoss
from .dataset import (
    load_image,
    load_yolo_label,
    load_sample,
    augment_image_and_boxes,
    index_dataset,
)

__version__ = "1.0.0"
__author__ = "CRAI Team"

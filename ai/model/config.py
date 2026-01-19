"""
SSD Model Configuration
=======================

Critical configuration constants for the SSD vehicle detector.
These values must match the inference configuration in ssd_detector.py.

WARNING: Do not change these values without understanding the implications
for model architecture and compatibility.
"""

# =============================================================================
# IMAGE CONFIGURATION
# =============================================================================

# Input image dimensions (must match ssd_detector.py)
IMG_HEIGHT: int = 640
IMG_WIDTH: int = 640
IMG_SIZE: tuple = (IMG_HEIGHT, IMG_WIDTH)

# =============================================================================
# CLASS CONFIGURATION
# =============================================================================

# Number of classes: 1 = generic vehicle (aggregates bus, car, truck, van)
NUM_CLASSES: int = 1

# Number of anchors per feature map location
NUM_ANCHORS: int = 4

# =============================================================================
# FEATURE MAP CONFIGURATION
# =============================================================================

# Feature map sizes at different strides
FEATURE_MAP_SIZES: list = [
    (80, 80),   # stride 8  - small objects
    (40, 40),   # stride 16 - medium objects
    (20, 20)    # stride 32 - large objects
]

# Scale ranges for each feature map level (min, max)
# Optimized for UA-DETRAC vehicle sizes
SCALES: list = [
    (0.03, 0.12),   # Small vehicles
    (0.10, 0.28),   # Medium vehicles
    (0.22, 0.50)    # Large vehicles
]

# Aspect ratios for anchor boxes
# Covers typical vehicle aspect ratios
ASPECT_RATIOS: list = [1.0, 1.5, 2.0, 3.0]

# =============================================================================
# BACKBONE CONFIGURATION
# =============================================================================

# MobileNetV2 layer names for feature extraction
FEATURE_LAYER_NAMES: list = [
    'block_6_expand_relu',    # stride 8
    'block_13_expand_relu',   # stride 16
    'out_relu'                # stride 32
]

# =============================================================================
# TRAINING DEFAULTS
# =============================================================================

DEFAULT_EPOCHS: int = 100
DEFAULT_BATCH_SIZE: int = 12
DEFAULT_LEARNING_RATE: float = 1e-4
DEFAULT_NEG_POS_RATIO: float = 3.0

# Phase 1 (frozen backbone) training ratio
PHASE1_RATIO: float = 0.7

# Fine-tuning learning rate reduction factor
FINETUNE_LR_FACTOR: float = 0.1

# Number of backbone layers to unfreeze during fine-tuning
FINETUNE_UNFREEZE_LAYERS: int = 20

# =============================================================================
# LOSS CONFIGURATION
# =============================================================================

# IoU threshold for positive anchor matching
IOU_THRESHOLD_POSITIVE: float = 0.5

# Hard negative mining ratio
HARD_NEGATIVE_RATIO: float = 3.0

# =============================================================================
# DATASET CONFIGURATION
# =============================================================================

# Default dataset path (relative to ai/ directory)
DEFAULT_DATASET_PATH: str = 'notebooks/UA-DETRAC-DATASET-10K-2'

# Supported dataset structures
DATASET_STRUCTURES: dict = {
    'structure_1': {
        'train_images': 'images/train',
        'train_labels': 'labels/train',
        'val_images': 'images/val',
        'val_labels': 'labels/val',
    },
    'structure_2': {
        'train_images': 'train/images',
        'train_labels': 'train/labels',
        'val_images': 'valid/images',
        'val_labels': 'valid/labels',
    }
}

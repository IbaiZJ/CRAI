"""
Anchor Box Generation
=====================

Utilities for generating anchor boxes for the SSD detector.
Anchors are generated at multiple scales and aspect ratios
for each feature map level.
"""

from typing import Tuple, List

import numpy as np
import tensorflow as tf

from .config import FEATURE_MAP_SIZES, SCALES, ASPECT_RATIOS


def generate_anchors_for_feature_map(
    feature_map_size: Tuple[int, int],
    scale_min: float,
    scale_max: float,
    aspect_ratios: List[float] = None
) -> np.ndarray:
    """
    Generate anchor boxes for a single feature map.
    
    Args:
        feature_map_size: Tuple of (height, width) for the feature map.
        scale_min: Minimum scale for anchor boxes.
        scale_max: Maximum scale for anchor boxes.
        aspect_ratios: List of aspect ratios. Defaults to config.ASPECT_RATIOS.
        
    Returns:
        Array of shape (num_anchors, 4) with anchor boxes in 
        [center_x, center_y, width, height] format (normalized coordinates).
    """
    if aspect_ratios is None:
        aspect_ratios = ASPECT_RATIOS
    
    fh, fw = feature_map_size
    anchors = []
    scale = scale_min + (scale_max - scale_min) / 2
    
    for i in range(fh):
        for j in range(fw):
            # Center coordinates (normalized)
            cx = (j + 0.5) / fw
            cy = (i + 0.5) / fh
            
            for ratio in aspect_ratios:
                # Calculate width and height based on aspect ratio
                w = scale * np.sqrt(ratio)
                h = scale / np.sqrt(ratio)
                # Clip to valid range
                w = min(w, 1.0)
                h = min(h, 1.0)
                anchors.append([cx, cy, w, h])
    
    return np.array(anchors, dtype=np.float32)


def generate_all_anchors(
    feature_map_sizes: List[Tuple[int, int]] = None,
    scales: List[Tuple[float, float]] = None,
    verbose: bool = True
) -> tf.Tensor:
    """
    Generate all anchor boxes for all feature map levels.
    
    Args:
        feature_map_sizes: List of (height, width) tuples. Defaults to config.
        scales: List of (min, max) scale tuples. Defaults to config.
        verbose: Whether to print anchor statistics.
        
    Returns:
        Tensor of shape (total_anchors, 4) with all anchor boxes.
    """
    if feature_map_sizes is None:
        feature_map_sizes = FEATURE_MAP_SIZES
    
    if scales is None:
        scales = SCALES
    
    all_anchors = []
    
    for i, fm_size in enumerate(feature_map_sizes):
        scale_min, scale_max = scales[i]
        anchors = generate_anchors_for_feature_map(fm_size, scale_min, scale_max)
        all_anchors.append(anchors)
        
        if verbose:
            print(f"Feature map {i} ({fm_size[0]}x{fm_size[1]}): {len(anchors)} anchors")
    
    all_anchors = np.concatenate(all_anchors, axis=0)
    
    if verbose:
        print(f"Total anchors: {len(all_anchors)}")
    
    return tf.constant(all_anchors, dtype=tf.float32)


def compute_anchor_statistics(anchors: tf.Tensor) -> dict:
    """
    Compute statistics about the generated anchors.
    
    Args:
        anchors: Tensor of shape (num_anchors, 4).
        
    Returns:
        Dictionary with anchor statistics.
    """
    anchors_np = anchors.numpy()
    
    widths = anchors_np[:, 2]
    heights = anchors_np[:, 3]
    areas = widths * heights
    aspect_ratios = widths / heights
    
    return {
        'num_anchors': len(anchors_np),
        'width_range': (float(widths.min()), float(widths.max())),
        'height_range': (float(heights.min()), float(heights.max())),
        'area_range': (float(areas.min()), float(areas.max())),
        'aspect_ratio_range': (float(aspect_ratios.min()), float(aspect_ratios.max())),
    }

"""
Utility Functions
=================

Helper utilities for visualization and common operations.
"""

from typing import Tuple, List

import cv2
import numpy as np


def draw_boxes_on_image(
    image: np.ndarray,
    boxes: np.ndarray,
    color: Tuple[int, int, int] = (0, 255, 0),
    thickness: int = 2
) -> np.ndarray:
    """
    Draw bounding boxes on an image.
    
    Args:
        image: Input image (H, W, C) in BGR or RGB format.
        boxes: Array of boxes in YOLO format [x_center, y_center, width, height].
        color: Box color in BGR format.
        thickness: Line thickness.
        
    Returns:
        Image with drawn boxes.
    """
    img = image.copy()
    h, w = img.shape[:2]
    
    for box in boxes:
        x_center, y_center, width, height = box
        
        # Convert from YOLO to pixel coordinates
        x1 = int((x_center - width / 2) * w)
        y1 = int((y_center - height / 2) * h)
        x2 = int((x_center + width / 2) * w)
        y2 = int((y_center + height / 2) * h)
        
        # Clip to image dimensions
        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(0, min(x2, w - 1))
        y2 = max(0, min(y2, h - 1))
        
        cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
    
    return img


def yolo_to_corners(box: np.ndarray) -> np.ndarray:
    """
    Convert YOLO format box to corner format.
    
    Args:
        box: Box in [x_center, y_center, width, height] format.
        
    Returns:
        Box in [x1, y1, x2, y2] format.
    """
    x_center, y_center, width, height = box
    x1 = x_center - width / 2
    y1 = y_center - height / 2
    x2 = x_center + width / 2
    y2 = y_center + height / 2
    return np.array([x1, y1, x2, y2])


def corners_to_yolo(box: np.ndarray) -> np.ndarray:
    """
    Convert corner format box to YOLO format.
    
    Args:
        box: Box in [x1, y1, x2, y2] format.
        
    Returns:
        Box in [x_center, y_center, width, height] format.
    """
    x1, y1, x2, y2 = box
    width = x2 - x1
    height = y2 - y1
    x_center = x1 + width / 2
    y_center = y1 + height / 2
    return np.array([x_center, y_center, width, height])


def compute_iou(box1: np.ndarray, box2: np.ndarray) -> float:
    """
    Compute IoU between two boxes in YOLO format.
    
    Args:
        box1: First box [x_center, y_center, width, height].
        box2: Second box [x_center, y_center, width, height].
        
    Returns:
        IoU value between 0 and 1.
    """
    # Convert to corners
    b1 = yolo_to_corners(box1)
    b2 = yolo_to_corners(box2)
    
    # Intersection
    inter_x1 = max(b1[0], b2[0])
    inter_y1 = max(b1[1], b2[1])
    inter_x2 = min(b1[2], b2[2])
    inter_y2 = min(b1[3], b2[3])
    
    inter_width = max(0, inter_x2 - inter_x1)
    inter_height = max(0, inter_y2 - inter_y1)
    inter_area = inter_width * inter_height
    
    # Union
    b1_area = box1[2] * box1[3]
    b2_area = box2[2] * box2[3]
    union_area = b1_area + b2_area - inter_area
    
    if union_area == 0:
        return 0.0
    
    return inter_area / union_area


def non_max_suppression(
    boxes: np.ndarray,
    scores: np.ndarray,
    iou_threshold: float = 0.5,
    score_threshold: float = 0.5,
    max_detections: int = 100
) -> List[int]:
    """
    Apply Non-Maximum Suppression to filter overlapping detections.
    
    Args:
        boxes: Array of boxes in YOLO format (N, 4).
        scores: Array of confidence scores (N,).
        iou_threshold: IoU threshold for suppression.
        score_threshold: Minimum score threshold.
        max_detections: Maximum number of detections to keep.
        
    Returns:
        List of indices of kept detections.
    """
    # Filter by score threshold
    mask = scores >= score_threshold
    filtered_boxes = boxes[mask]
    filtered_scores = scores[mask]
    original_indices = np.where(mask)[0]
    
    if len(filtered_boxes) == 0:
        return []
    
    # Sort by score (descending)
    sorted_idx = np.argsort(filtered_scores)[::-1]
    
    keep = []
    while len(sorted_idx) > 0 and len(keep) < max_detections:
        # Keep the highest scoring box
        current_idx = sorted_idx[0]
        keep.append(original_indices[current_idx])
        
        if len(sorted_idx) == 1:
            break
        
        # Compute IoU with remaining boxes
        current_box = filtered_boxes[current_idx]
        remaining_boxes = filtered_boxes[sorted_idx[1:]]
        
        ious = np.array([compute_iou(current_box, box) for box in remaining_boxes])
        
        # Keep boxes with IoU below threshold
        mask = ious < iou_threshold
        sorted_idx = sorted_idx[1:][mask]
    
    return keep


def print_training_summary(history: dict) -> None:
    """
    Print a summary of training results.
    
    Args:
        history: Training history dictionary with 'loss' and 'val_loss' keys.
    """
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    
    if 'loss' in history:
        print(f"  Epochs completed: {len(history['loss'])}")
        print(f"  Final training loss: {history['loss'][-1]:.4f}")
    
    if 'val_loss' in history:
        best_val_loss = min(history['val_loss'])
        best_epoch = history['val_loss'].index(best_val_loss) + 1
        print(f"  Best validation loss: {best_val_loss:.4f} (epoch {best_epoch})")
        print(f"  Final validation loss: {history['val_loss'][-1]:.4f}")
    
    if 'phase1_epochs' in history:
        print(f"\n  Phase 1 (frozen backbone): {history['phase1_epochs']} epochs")
    
    if 'phase2_epochs' in history:
        print(f"  Phase 2 (fine-tuning): {history['phase2_epochs']} epochs")
    
    print("=" * 60)

"""
SSD Loss Functions
==================

Custom loss functions for training the SSD detector:
- SSDBoxLoss: Localization loss with anchor matching and box encoding
- SSDClassLoss: Classification loss with hard negative mining
"""

import tensorflow as tf

from .config import IOU_THRESHOLD_POSITIVE, HARD_NEGATIVE_RATIO


class SSDBoxLoss(tf.keras.losses.Loss):
    """
    Box regression loss with anchor matching.
    
    Uses Smooth L1 (Huber) loss for box regression with IoU-based
    anchor-to-ground-truth matching.
    
    Args:
        anchors: Tensor of anchor boxes with shape (num_anchors, 4).
        iou_threshold: IoU threshold for positive matching.
        name: Name of the loss.
    """
    
    def __init__(
        self, 
        anchors: tf.Tensor, 
        iou_threshold: float = IOU_THRESHOLD_POSITIVE,
        name: str = 'ssd_box_loss'
    ):
        super().__init__(name=name)
        self.anchors = tf.cast(anchors, tf.float32)
        self.num_anchors = int(anchors.shape[0])
        self.iou_threshold = iou_threshold
    
    def call(self, y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
        """
        Compute box regression loss.
        
        Args:
            y_true: Ground truth boxes with shape (batch, max_boxes, 4).
            y_pred: Predicted box offsets with shape (batch, num_anchors, 4).
            
        Returns:
            Scalar loss value.
        """
        batch_size = tf.shape(y_true)[0]
        
        # Tile anchors for batch processing
        anchors_tiled = tf.tile(
            tf.expand_dims(self.anchors, 0), 
            [batch_size, 1, 1]
        )
        
        # Compute IoU between anchors and ground truth
        iou_matrix = self._batch_compute_iou(anchors_tiled, y_true)
        
        # Mask invalid GT boxes (zero boxes)
        gt_valid_mask = tf.reduce_sum(tf.abs(y_true), axis=-1) > 0
        gt_valid_mask = tf.cast(tf.expand_dims(gt_valid_mask, 1), tf.float32)
        iou_matrix = iou_matrix * gt_valid_mask
        
        # Match anchors to best GT boxes
        best_gt_idx = tf.argmax(iou_matrix, axis=2)
        max_iou = tf.reduce_max(iou_matrix, axis=2)
        positive_mask = max_iou >= self.iou_threshold
        
        # Gather matched GT boxes
        batch_indices = tf.tile(
            tf.expand_dims(tf.range(batch_size), 1), 
            [1, self.num_anchors]
        )
        gather_indices = tf.stack(
            [batch_indices, tf.cast(best_gt_idx, tf.int32)], 
            axis=-1
        )
        matched_gt_boxes = tf.gather_nd(y_true, gather_indices)
        
        # Encode GT boxes relative to anchors
        encoded_gt = self._encode_boxes(matched_gt_boxes, anchors_tiled)
        
        # Compute Huber (Smooth L1) loss
        diff = y_pred - encoded_gt
        abs_diff = tf.abs(diff)
        huber = tf.where(abs_diff < 1.0, 0.5 * tf.square(diff), abs_diff - 0.5)
        loss = tf.reduce_sum(huber, axis=-1)
        
        # Apply positive mask
        masked_loss = loss * tf.cast(positive_mask, tf.float32)
        total_loss = tf.reduce_sum(masked_loss)
        num_pos = tf.reduce_sum(tf.cast(positive_mask, tf.float32))
        
        return total_loss / tf.maximum(num_pos, 1.0)
    
    def _batch_compute_iou(
        self, 
        boxes1: tf.Tensor, 
        boxes2: tf.Tensor
    ) -> tf.Tensor:
        """
        Compute IoU between two sets of boxes in batch.
        
        Args:
            boxes1: Shape (batch, num_anchors, 4) in center format.
            boxes2: Shape (batch, num_gt, 4) in center format.
            
        Returns:
            IoU matrix with shape (batch, num_anchors, num_gt).
        """
        # Convert to corner format
        b1_x1 = boxes1[..., 0:1] - boxes1[..., 2:3] / 2
        b1_y1 = boxes1[..., 1:2] - boxes1[..., 3:4] / 2
        b1_x2 = boxes1[..., 0:1] + boxes1[..., 2:3] / 2
        b1_y2 = boxes1[..., 1:2] + boxes1[..., 3:4] / 2
        
        b2_x1 = boxes2[..., 0:1] - boxes2[..., 2:3] / 2
        b2_y1 = boxes2[..., 1:2] - boxes2[..., 3:4] / 2
        b2_x2 = boxes2[..., 0:1] + boxes2[..., 2:3] / 2
        b2_y2 = boxes2[..., 1:2] + boxes2[..., 3:4] / 2
        
        # Transpose boxes2 for broadcasting
        b2_x1_t = tf.transpose(b2_x1, [0, 2, 1])
        b2_y1_t = tf.transpose(b2_y1, [0, 2, 1])
        b2_x2_t = tf.transpose(b2_x2, [0, 2, 1])
        b2_y2_t = tf.transpose(b2_y2, [0, 2, 1])
        
        # Intersection
        inter_x1 = tf.maximum(b1_x1, b2_x1_t)
        inter_y1 = tf.maximum(b1_y1, b2_y1_t)
        inter_x2 = tf.minimum(b1_x2, b2_x2_t)
        inter_y2 = tf.minimum(b1_y2, b2_y2_t)
        
        inter_area = (
            tf.maximum(0.0, inter_x2 - inter_x1) * 
            tf.maximum(0.0, inter_y2 - inter_y1)
        )
        
        # Union
        b1_area = boxes1[..., 2:3] * boxes1[..., 3:4]
        b2_area = boxes2[..., 2:3] * boxes2[..., 3:4]
        b2_area_t = tf.transpose(b2_area, [0, 2, 1])
        
        union_area = b1_area + b2_area_t - inter_area
        
        return inter_area / (union_area + 1e-6)
    
    def _encode_boxes(
        self, 
        gt_boxes: tf.Tensor, 
        anchors: tf.Tensor
    ) -> tf.Tensor:
        """
        Encode GT boxes relative to anchors.
        
        Args:
            gt_boxes: Ground truth boxes (batch, num_anchors, 4).
            anchors: Anchor boxes (batch, num_anchors, 4).
            
        Returns:
            Encoded box offsets (batch, num_anchors, 4).
        """
        gt_w = tf.maximum(gt_boxes[..., 2], 1e-6)
        gt_h = tf.maximum(gt_boxes[..., 3], 1e-6)
        anchor_w = tf.maximum(anchors[..., 2], 1e-6)
        anchor_h = tf.maximum(anchors[..., 3], 1e-6)
        
        tx = (gt_boxes[..., 0] - anchors[..., 0]) / anchor_w
        ty = (gt_boxes[..., 1] - anchors[..., 1]) / anchor_h
        tw = tf.math.log(gt_w / anchor_w)
        th = tf.math.log(gt_h / anchor_h)
        
        return tf.stack([tx, ty, tw, th], axis=-1)


class SSDClassLoss(tf.keras.losses.Loss):
    """
    Classification loss with hard negative mining.
    
    Uses binary cross-entropy loss with hard negative mining
    to handle class imbalance (many background anchors).
    
    Args:
        anchors: Tensor of anchor boxes with shape (num_anchors, 4).
        neg_pos_ratio: Ratio of negative to positive samples for mining.
        iou_threshold: IoU threshold for positive matching.
        name: Name of the loss.
    """
    
    def __init__(
        self, 
        anchors: tf.Tensor, 
        neg_pos_ratio: float = HARD_NEGATIVE_RATIO,
        iou_threshold: float = IOU_THRESHOLD_POSITIVE,
        name: str = 'ssd_class_loss'
    ):
        super().__init__(name=name)
        self.anchors = tf.cast(anchors, tf.float32)
        self.neg_pos_ratio = neg_pos_ratio
        self.num_anchors = int(anchors.shape[0])
        self.iou_threshold = iou_threshold
    
    def call(self, y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
        """
        Compute classification loss with hard negative mining.
        
        Args:
            y_true: Ground truth boxes with shape (batch, max_boxes, 4).
            y_pred: Predicted class scores with shape (batch, num_anchors, num_classes).
            
        Returns:
            Scalar loss value.
        """
        batch_size = tf.shape(y_true)[0]
        
        # Tile anchors for batch processing
        anchors_tiled = tf.tile(
            tf.expand_dims(self.anchors, 0), 
            [batch_size, 1, 1]
        )
        
        # Compute IoU
        iou_matrix = self._batch_compute_iou(anchors_tiled, y_true)
        
        # Mask invalid GT boxes
        gt_valid_mask = tf.reduce_sum(tf.abs(y_true), axis=-1) > 0
        gt_valid_mask = tf.cast(tf.expand_dims(gt_valid_mask, 1), tf.float32)
        iou_matrix = iou_matrix * gt_valid_mask
        
        # Determine positive anchors
        max_iou = tf.reduce_max(iou_matrix, axis=2)
        positive_mask = max_iou >= self.iou_threshold
        targets = tf.cast(positive_mask, tf.float32)
        
        # Squeeze predictions if needed (for single class)
        y_pred = tf.squeeze(y_pred, axis=-1) if len(y_pred.shape) == 3 else y_pred
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        
        # Binary cross-entropy
        bce_loss = -(
            targets * tf.math.log(y_pred) + 
            (1 - targets) * tf.math.log(1 - y_pred)
        )
        
        # Separate positive and negative losses
        pos_loss = bce_loss * targets
        neg_loss = bce_loss * (1.0 - targets)
        
        # Hard negative mining
        num_pos = tf.reduce_sum(targets, axis=1)
        num_neg = tf.cast(num_pos * self.neg_pos_ratio, tf.int32)
        
        # Limit negatives to available count
        num_neg_available = tf.cast(self.num_anchors, tf.float32) - num_pos
        num_neg = tf.minimum(num_neg, tf.cast(num_neg_available, tf.int32))
        
        # Select top-k hardest negatives
        neg_loss_for_sort = tf.where(
            positive_mask, 
            -1e9 * tf.ones_like(neg_loss), 
            neg_loss
        )
        sorted_losses, _ = tf.math.top_k(neg_loss_for_sort, k=self.num_anchors)
        
        # Get threshold for each sample
        cut_off_indices = tf.maximum(num_neg - 1, 0)
        batch_indices = tf.range(batch_size)
        gather_indices = tf.stack([batch_indices, cut_off_indices], axis=1)
        
        thresholds = tf.gather_nd(sorted_losses, gather_indices)
        thresholds = tf.expand_dims(thresholds, 1)
        
        # Create hard negative mask
        hard_neg_mask = (
            (neg_loss >= thresholds) & 
            (neg_loss_for_sort > -1e9) & 
            tf.expand_dims(num_neg > 0, 1)
        )
        hard_neg_mask = tf.cast(hard_neg_mask, tf.float32)
        
        # Compute total loss
        total_loss = tf.reduce_sum(pos_loss) + tf.reduce_sum(neg_loss * hard_neg_mask)
        total_samples = tf.reduce_sum(targets) + tf.reduce_sum(hard_neg_mask)
        
        return total_loss / tf.maximum(total_samples, 1.0)
    
    def _batch_compute_iou(
        self, 
        boxes1: tf.Tensor, 
        boxes2: tf.Tensor
    ) -> tf.Tensor:
        """Compute IoU between two sets of boxes (same as SSDBoxLoss)."""
        b1_x1 = boxes1[..., 0:1] - boxes1[..., 2:3] / 2
        b1_y1 = boxes1[..., 1:2] - boxes1[..., 3:4] / 2
        b1_x2 = boxes1[..., 0:1] + boxes1[..., 2:3] / 2
        b1_y2 = boxes1[..., 1:2] + boxes1[..., 3:4] / 2
        
        b2_x1 = boxes2[..., 0:1] - boxes2[..., 2:3] / 2
        b2_y1 = boxes2[..., 1:2] - boxes2[..., 3:4] / 2
        b2_x2 = boxes2[..., 0:1] + boxes2[..., 2:3] / 2
        b2_y2 = boxes2[..., 1:2] + boxes2[..., 3:4] / 2
        
        b2_x1_t = tf.transpose(b2_x1, [0, 2, 1])
        b2_y1_t = tf.transpose(b2_y1, [0, 2, 1])
        b2_x2_t = tf.transpose(b2_x2, [0, 2, 1])
        b2_y2_t = tf.transpose(b2_y2, [0, 2, 1])
        
        inter_x1 = tf.maximum(b1_x1, b2_x1_t)
        inter_y1 = tf.maximum(b1_y1, b2_y1_t)
        inter_x2 = tf.minimum(b1_x2, b2_x2_t)
        inter_y2 = tf.minimum(b1_y2, b2_y2_t)
        
        inter_area = (
            tf.maximum(0.0, inter_x2 - inter_x1) * 
            tf.maximum(0.0, inter_y2 - inter_y1)
        )
        
        b1_area = boxes1[..., 2:3] * boxes1[..., 3:4]
        b2_area = boxes2[..., 2:3] * boxes2[..., 3:4]
        b2_area_t = tf.transpose(b2_area, [0, 2, 1])
        
        union_area = b1_area + b2_area_t - inter_area
        
        return inter_area / (union_area + 1e-6)

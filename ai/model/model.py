"""
SSD Model Architecture
======================

SSD (Single Shot MultiBox Detector) model implementation using
MobileNetV2 as the backbone for efficient vehicle detection.
"""

from typing import Tuple, List

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import (
    Conv2D, 
    Reshape, 
    Concatenate, 
    Input, 
    Activation
)
from tensorflow.keras.models import Model

from .config import (
    IMG_HEIGHT, 
    IMG_WIDTH, 
    NUM_CLASSES, 
    NUM_ANCHORS,
    FEATURE_LAYER_NAMES
)


def create_detection_head(
    feature_map: tf.Tensor,
    num_anchors: int,
    num_classes: int,
    name_prefix: str
) -> Tuple[tf.Tensor, tf.Tensor]:
    """
    Create detection heads for a feature map.
    
    Each detection head produces box regression and classification outputs
    for all anchors at each spatial location.
    
    Args:
        feature_map: Input feature map tensor.
        num_anchors: Number of anchors per location.
        num_classes: Number of classes to predict.
        name_prefix: Prefix for layer names.
        
    Returns:
        Tuple of (box_output, class_output) tensors.
    """
    # Box regression: 4 values per anchor (tx, ty, tw, th)
    box_conv = Conv2D(
        filters=num_anchors * 4,
        kernel_size=(3, 3),
        padding='same',
        kernel_initializer='he_normal',
        name=f'{name_prefix}_box_conv'
    )(feature_map)
    box_output = Reshape((-1, 4), name=f'{name_prefix}_box_reshape')(box_conv)
    
    # Classification: num_classes per anchor
    class_conv = Conv2D(
        filters=num_anchors * num_classes,
        kernel_size=(3, 3),
        padding='same',
        kernel_initializer='he_normal',
        name=f'{name_prefix}_class_conv'
    )(feature_map)
    class_conv = Activation('sigmoid', name=f'{name_prefix}_class_sigmoid')(class_conv)
    class_output = Reshape(
        (-1, num_classes), 
        name=f'{name_prefix}_class_reshape'
    )(class_conv)
    
    return box_output, class_output


def build_ssd_model(
    img_height: int = IMG_HEIGHT,
    img_width: int = IMG_WIDTH,
    num_classes: int = NUM_CLASSES,
    num_anchors: int = NUM_ANCHORS,
    feature_layer_names: List[str] = None,
    freeze_backbone: bool = True,
    verbose: bool = True
) -> Tuple[Model, tf.Tensor, tf.Tensor, tf.Tensor]:
    """
    Build the complete SSD model.
    
    Args:
        img_height: Input image height.
        img_width: Input image width.
        num_classes: Number of classes to detect.
        num_anchors: Number of anchors per location.
        feature_layer_names: Names of backbone layers to use as features.
        freeze_backbone: Whether to freeze backbone weights.
        verbose: Whether to print model information.
        
    Returns:
        Tuple of (model, input_tensor, box_predictions, class_predictions).
    """
    if feature_layer_names is None:
        feature_layer_names = FEATURE_LAYER_NAMES
    
    if verbose:
        print("Building SSD MobileNetV2 model...")
    
    # Input layer
    input_tensor = Input(
        shape=(img_height, img_width, 3), 
        name="input_image"
    )
    
    # Backbone: MobileNetV2 pretrained on ImageNet
    backbone = MobileNetV2(
        input_tensor=input_tensor,
        include_top=False,
        weights='imagenet',
        alpha=1.0
    )
    backbone.trainable = not freeze_backbone
    
    if verbose:
        status = "frozen" if freeze_backbone else "trainable"
        print(f"✓ Backbone MobileNetV2 loaded ({status})")
    
    # Extract feature maps
    feature_maps = []
    for layer_name in feature_layer_names:
        layer = backbone.get_layer(layer_name)
        feature_maps.append(layer.output)
        if verbose:
            print(f"  Feature map '{layer_name}': {layer.output.shape}")
    
    # Create detection heads for each feature map
    all_box_outputs = []
    all_class_outputs = []
    
    for i, feat_map in enumerate(feature_maps):
        box_out, class_out = create_detection_head(
            feat_map, 
            num_anchors, 
            num_classes, 
            f'detect_{i}'
        )
        all_box_outputs.append(box_out)
        all_class_outputs.append(class_out)
    
    # Concatenate outputs from all feature maps
    box_predictions = Concatenate(axis=1, name='concat_boxes')(all_box_outputs)
    class_predictions = Concatenate(axis=1, name='concat_classes')(all_class_outputs)
    
    # Build model
    model = Model(
        inputs=input_tensor,
        outputs={'boxes': box_predictions, 'classes': class_predictions},
        name='SSD_MobileNetV2_VehicleDetector'
    )
    
    if verbose:
        print(f"✓ Model built: {model.count_params():,} parameters")
        print(f"  Output boxes: {box_predictions.shape}")
        print(f"  Output classes: {class_predictions.shape}")
    
    return model, input_tensor, box_predictions, class_predictions


class SSDModel(tf.keras.Model):
    """
    Custom model wrapper for training with custom losses.
    
    This wrapper handles the custom training loop required for SSD
    training with anchor matching and hard negative mining.
    
    Args:
        base_model: The underlying SSD model.
        box_loss_fn: Box regression loss function.
        class_loss_fn: Classification loss function.
    """
    
    def __init__(
        self, 
        base_model: Model, 
        box_loss_fn: tf.keras.losses.Loss, 
        class_loss_fn: tf.keras.losses.Loss, 
        **kwargs
    ):
        super().__init__(**kwargs)
        self.base_model = base_model
        self.box_loss_fn = box_loss_fn
        self.class_loss_fn = class_loss_fn
        
        # Metrics
        self.box_loss_tracker = tf.keras.metrics.Mean(name="box_loss")
        self.class_loss_tracker = tf.keras.metrics.Mean(name="class_loss")
        self.total_loss_tracker = tf.keras.metrics.Mean(name="loss")
    
    def call(self, inputs: tf.Tensor, training: bool = False) -> dict:
        """Forward pass."""
        return self.base_model(inputs, training=training)
    
    @property
    def metrics(self) -> list:
        """Return list of metrics."""
        return [
            self.total_loss_tracker, 
            self.box_loss_tracker, 
            self.class_loss_tracker
        ]
    
    def train_step(self, data: Tuple) -> dict:
        """
        Custom training step.
        
        Args:
            data: Tuple of (images, targets) where targets contains boxes and classes.
            
        Returns:
            Dictionary of metric results.
        """
        images, targets = data
        gt_boxes = targets["boxes"]
        
        with tf.GradientTape() as tape:
            predictions = self.base_model(images, training=True)
            pred_boxes = predictions['boxes']
            pred_classes = predictions['classes']
            
            box_loss = self.box_loss_fn(gt_boxes, pred_boxes)
            class_loss = self.class_loss_fn(gt_boxes, pred_classes)
            total_loss = box_loss + class_loss
        
        # Compute and apply gradients
        gradients = tape.gradient(total_loss, self.base_model.trainable_variables)
        self.optimizer.apply_gradients(
            zip(gradients, self.base_model.trainable_variables)
        )
        
        # Update metrics
        self.total_loss_tracker.update_state(total_loss)
        self.box_loss_tracker.update_state(box_loss)
        self.class_loss_tracker.update_state(class_loss)
        
        return {
            "loss": self.total_loss_tracker.result(),
            "box_loss": self.box_loss_tracker.result(),
            "class_loss": self.class_loss_tracker.result()
        }
    
    def test_step(self, data: Tuple) -> dict:
        """
        Custom validation step.
        
        Args:
            data: Tuple of (images, targets).
            
        Returns:
            Dictionary of metric results.
        """
        images, targets = data
        gt_boxes = targets["boxes"]
        
        predictions = self.base_model(images, training=False)
        pred_boxes = predictions['boxes']
        pred_classes = predictions['classes']
        
        box_loss = self.box_loss_fn(gt_boxes, pred_boxes)
        class_loss = self.class_loss_fn(gt_boxes, pred_classes)
        total_loss = box_loss + class_loss
        
        # Update metrics
        self.total_loss_tracker.update_state(total_loss)
        self.box_loss_tracker.update_state(box_loss)
        self.class_loss_tracker.update_state(class_loss)
        
        return {
            "loss": self.total_loss_tracker.result(),
            "box_loss": self.box_loss_tracker.result(),
            "class_loss": self.class_loss_tracker.result()
        }
    
    def unfreeze_backbone(self, num_layers: int = 20) -> None:
        """
        Unfreeze the last N layers of the backbone for fine-tuning.
        
        Args:
            num_layers: Number of layers to unfreeze from the end.
        """
        # Freeze all layers first
        for layer in self.base_model.layers[:-num_layers]:
            layer.trainable = False
        
        # Unfreeze last N layers
        for layer in self.base_model.layers[-num_layers:]:
            layer.trainable = True

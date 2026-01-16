"""
SSD MobileNetV2 Vehicle Detector
Custom model trained on UA-DETRAC dataset
"""
import cv2
import numpy as np
from utils.logger import get_logger

# Suppress TensorFlow warnings
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Conv2D, Reshape, Concatenate, Input, Activation
from tensorflow.keras.models import Model

# Import keras directly for Keras 3.x compatibility
import keras


# =============================================================================
# SSDModel class - required for loading .keras files from training
# =============================================================================
# Register without package name to match how it was saved in training
@keras.saving.register_keras_serializable(name='SSDModel')
class SSDModel(keras.Model):
    """
    Custom SSD Model wrapper used during training.
    This class is needed to deserialize the .keras model files.
    """
    def __init__(self, base_model=None, box_loss_fn=None, class_loss_fn=None, **kwargs):
        super().__init__(**kwargs)
        self.base_model = base_model
        self.box_loss_fn = box_loss_fn
        self.class_loss_fn = class_loss_fn
        
        # Track losses (for training compatibility)
        self.box_loss_tracker = tf.keras.metrics.Mean(name="box_loss")
        self.class_loss_tracker = tf.keras.metrics.Mean(name="class_loss")
        self.total_loss_tracker = tf.keras.metrics.Mean(name="loss")
    
    def call(self, inputs, training=False):
        if self.base_model is not None:
            return self.base_model(inputs, training=training)
        return inputs
    
    @property
    def metrics(self):
        return [self.total_loss_tracker, self.box_loss_tracker, self.class_loss_tracker]
    
    def get_config(self):
        config = super().get_config()
        # Don't try to serialize base_model or loss functions
        return config
    
    @classmethod
    def from_config(cls, config):
        # Remove any problematic keys that can't be deserialized
        config.pop('base_model', None)
        config.pop('box_loss_fn', None)
        config.pop('class_loss_fn', None)
        return cls(**config)


class SSDVehicleDetector:
    """
    Vehicle detector using custom SSD MobileNetV2 model
    Trained for car detection without license plate/OCR
    """
    
    # Model input size (from training)
    IMG_HEIGHT = 640
    IMG_WIDTH = 640
    
    # Anchor configuration (must match training)
    FEATURE_MAP_SIZES = [
        (80, 80),   # block_6_expand_relu
        (40, 40),   # block_13_expand_relu
        (20, 20)    # out_relu
    ]
    
    SCALES = [
        (0.1, 0.3),   # Small objects
        (0.3, 0.6),   # Medium objects
        (0.6, 0.9)    # Large objects
    ]
    
    ASPECT_RATIOS = [1.0, 2.0, 0.5, 1.5]
    
    # Match the training configuration from notebook
    NUM_ANCHORS = 4  # 4 aspect ratios per location
    NUM_CLASSES = 1  # Binary classification (car vs background)
    
    # NOTE: The saved .keras model has incompatible weight shapes due to training issues.
    # Box heads: 4 filters (expected 16 = 4 anchors * 4 coords)
    # Class heads: 16 filters (expected 4 = 4 anchors * 1 class)
    # The model will use ImageNet weights for backbone with untrained detection heads.
    
    # Feature extraction layers from MobileNetV2
    FEATURE_LAYER_NAMES = [
        'block_6_expand_relu',
        'block_13_expand_relu',
        'out_relu'
    ]
    
    def __init__(self, model_path: str = None, weights_path: str = None, conf_threshold: float = 0.26):
        """
        Initialize the SSD vehicle detector
        
        Args:
            model_path: Path to .keras model file (preferred - contains full model)
            weights_path: Path to .h5 weights file (legacy - only contains detection head weights)
            conf_threshold: Minimum confidence threshold for detections
        """
        self.logger = get_logger("SSDDetector")
        self.conf_threshold = conf_threshold
        self.nms_threshold = 0.3  # Lower NMS to be more aggressive at removing overlaps
        
        try:
            # Find the best model/weights file to load
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            # Possible .keras model locations (full model - preferred)
            keras_paths = [
                model_path,
                os.path.join(base_dir, "models", "ssd_vehicle_detector.keras"),
                os.path.join(os.path.dirname(base_dir), "notebooks", "models", "ssd_vehicle_detector.keras"),
            ]
            
            # Possible .weights.h5 locations (only weights)
            weights_paths = [
                weights_path,
                os.path.join(base_dir, "models", "ssd_vehicle_detector.weights.h5"),
                os.path.join(os.path.dirname(base_dir), "notebooks", "models", "ssd_vehicle_detector.weights.h5"),
            ]
            
            model_loaded = False
            
            # STRATEGY 1: Try loading complete .keras model directly
            for kpath in keras_paths:
                if kpath and os.path.exists(kpath):
                    try:
                        self.logger.info(f"Loading complete model from: {kpath}")
                        self.model = tf.keras.models.load_model(kpath, compile=False)
                        self.logger.info("✓ Complete model loaded successfully!")
                        model_loaded = True
                        break
                    except Exception as e:
                        self.logger.warning(f"Could not load .keras model: {e}")
                        continue
            
            # STRATEGY 2: Build model and load weights
            if not model_loaded:
                self.logger.info("Building SSD MobileNetV2 architecture...")
                self.model = self._build_base_model()
                
                # Try loading weights
                for wpath in weights_paths:
                    if wpath and os.path.exists(wpath):
                        try:
                            self.logger.info(f"Loading weights from: {wpath}")
                            # Try without by_name first (Keras 3.x format)
                            self.model.load_weights(wpath)
                            self.logger.info("✓ Weights loaded successfully!")
                            model_loaded = True
                            break
                        except Exception as e1:
                            try:
                                # Fallback: try with skip_mismatch
                                self.model.load_weights(wpath, skip_mismatch=True)
                                self.logger.info("✓ Weights loaded with skip_mismatch")
                                model_loaded = True
                                break
                            except Exception as e2:
                                self.logger.warning(f"Could not load weights: {e2}")
                                continue
            
            if not model_loaded:
                self.logger.warning("=" * 60)
                self.logger.warning("⚠️  NO SE PUDIERON CARGAR LOS PESOS ENTRENADOS")
                self.logger.warning("   El modelo usará pesos aleatorios (ImageNet para backbone)")
                self.logger.warning("   Para entrenar el modelo:")
                self.logger.warning("   1. Ejecuta el notebook: ai/notebooks/crai.ipynb")
                self.logger.warning("   2. Entrena el modelo completo")
                self.logger.warning("   3. Ejecuta la celda 'GUARDAR MODELO COMPATIBLE'")
                self.logger.warning("=" * 60)
            
            
            # Generate anchors
            self.anchors = self._generate_all_anchors()
            
            self.logger.info(f"✓ SSD model ready with threshold={conf_threshold}")
            self.logger.info(f"Generated {len(self.anchors)} anchor boxes")
            self.available = True
            
        except Exception as e:
            self.logger.error(f"Error initializing SSD model: {e}")
            import traceback
            traceback.print_exc()
            self.available = False
            raise
    
    def _load_weights_from_keras_file(self, keras_path):
        """
        Load detection head weights from a .keras archive.
        The .keras file contains the trained weights in a specific format.
        We map the saved layer names to our model's layer names.
        """
        import zipfile
        import tempfile
        import shutil
        import h5py
        
        # .keras files are zip archives containing model.weights.h5
        with zipfile.ZipFile(keras_path, 'r') as zf:
            if 'model.weights.h5' not in zf.namelist():
                self.logger.error("No model.weights.h5 found in .keras archive")
                return False
            
            # Extract to temp directory
            temp_dir = tempfile.mkdtemp()
            try:
                weights_path = os.path.join(temp_dir, 'model.weights.h5')
                with zf.open('model.weights.h5') as src:
                    with open(weights_path, 'wb') as dst:
                        dst.write(src.read())
                
                # Map saved layer names to our model layer names
                # In saved file: conv2d_35 -> detect_0_box_conv
                #                conv2d_36 -> detect_1_box_conv
                #                conv2d_37 -> detect_2_box_conv
                #                conv2d_38 -> detect_0_class_conv
                #                conv2d_39 -> detect_1_class_conv
                #                conv2d_40 -> detect_2_class_conv
                layer_mapping = {
                    'conv2d_35': 'detect_0_box_conv',
                    'conv2d_36': 'detect_1_box_conv',
                    'conv2d_37': 'detect_2_box_conv',
                    'conv2d_38': 'detect_0_class_conv',
                    'conv2d_39': 'detect_1_class_conv',
                    'conv2d_40': 'detect_2_class_conv',
                }
                
                with h5py.File(weights_path, 'r') as f:
                    weights_loaded = 0
                    
                    for src_name, dst_name in layer_mapping.items():
                        src_path = f'base_model/base_model/layers/{src_name}/vars'
                        
                        if src_path + '/0' in f:
                            # Get the layer from our model
                            try:
                                layer = self.model.get_layer(dst_name)
                            except ValueError:
                                self.logger.warning(f"Layer {dst_name} not found in model")
                                continue
                            
                            # Load kernel weights
                            kernel = np.array(f[src_path + '/0'])
                            
                            # Load bias if present
                            bias = None
                            if src_path + '/1' in f:
                                bias = np.array(f[src_path + '/1'])
                            
                            # Set weights
                            if bias is not None:
                                layer.set_weights([kernel, bias])
                            else:
                                layer.set_weights([kernel])
                            
                            weights_loaded += 1
                            self.logger.debug(f"Loaded weights for {dst_name} from {src_name}")
                    
                    self.logger.info(f"✓ Loaded {weights_loaded} detection head layers from .keras file")
                    return weights_loaded > 0
                    
            finally:
                shutil.rmtree(temp_dir)
        
        return False

    def _create_detection_head(self, feature_map, name_prefix):
        """Creates box regression and classification heads for a feature map"""
        # Box regression head: 4 values per anchor
        box_conv = Conv2D(
            filters=self.NUM_ANCHORS * 4,
            kernel_size=(3, 3),
            padding='same',
            kernel_initializer='he_normal',
            name=f'{name_prefix}_box_conv'
        )(feature_map)
        box_output = Reshape((-1, 4), name=f'{name_prefix}_box_reshape')(box_conv)
        
        # Classification head: 1 class per anchor (sigmoid for probability)
        class_conv = Conv2D(
            filters=self.NUM_ANCHORS * self.NUM_CLASSES,
            kernel_size=(3, 3),
            padding='same',
            kernel_initializer='he_normal',
            name=f'{name_prefix}_class_conv'
        )(feature_map)
        class_conv = Activation('sigmoid', name=f'{name_prefix}_class_sigmoid')(class_conv)
        class_output = Reshape((-1, self.NUM_CLASSES), name=f'{name_prefix}_class_reshape')(class_conv)
        
        return box_output, class_output
    
    def _build_base_model(self):
        """Build the SSD MobileNetV2 model architecture from scratch"""
        # Create input tensor
        input_tensor = Input(shape=(self.IMG_HEIGHT, self.IMG_WIDTH, 3), name="input_image")
        
        # Load MobileNetV2 backbone
        try:
            backbone = MobileNetV2(
                input_tensor=input_tensor,
                include_top=False,
                weights='imagenet',
                alpha=1.0
            )
            self.logger.info("✓ MobileNetV2 backbone loaded with ImageNet weights")
        except Exception as e:
            self.logger.warning(f"Could not load ImageNet weights: {e}")
            self.logger.info("Loading MobileNetV2 without pre-trained weights...")
            backbone = MobileNetV2(
                input_tensor=input_tensor,
                include_top=False,
                weights=None,
                alpha=1.0
            )
            self.logger.info("✓ MobileNetV2 backbone loaded without pre-trained weights")
        
        # Freeze backbone (transfer learning)
        backbone.trainable = False
        
        # Extract multi-scale feature maps
        feature_maps = []
        for layer_name in self.FEATURE_LAYER_NAMES:
            layer = backbone.get_layer(layer_name)
            feature_maps.append(layer.output)
        
        # Apply detection heads to each feature map
        all_box_outputs = []
        all_class_outputs = []
        
        for i, feat_map in enumerate(feature_maps):
            box_out, class_out = self._create_detection_head(feat_map, f'detect_{i}')
            all_box_outputs.append(box_out)
            all_class_outputs.append(class_out)
        
        # Concatenate predictions from all feature maps
        if len(all_box_outputs) > 1:
            box_predictions = Concatenate(axis=1, name='concat_boxes')(all_box_outputs)
            class_predictions = Concatenate(axis=1, name='concat_classes')(all_class_outputs)
        else:
            box_predictions = all_box_outputs[0]
            class_predictions = all_class_outputs[0]
        
        # Create model
        model = Model(
            inputs=input_tensor,
            outputs={
                'boxes': box_predictions,
                'classes': class_predictions
            },
            name='SSD_MobileNetV2_CarDetector'
        )
        
        self.logger.info(f"Model built: {model.count_params():,} parameters")
        self.logger.info(f"  Input: {model.input_shape}")
        self.logger.info(f"  Output boxes: {box_predictions.shape}")
        self.logger.info(f"  Output classes: {class_predictions.shape}")
        
        return model
    
    def _generate_anchors_for_feature_map(self, feature_map_size, scale_min, scale_max):
        """Generate anchor boxes for a single feature map"""
        fh, fw = feature_map_size
        anchors = []
        
        scale = scale_min + (scale_max - scale_min) / 2
        
        for i in range(fh):
            for j in range(fw):
                cx = (j + 0.5) / fw
                cy = (i + 0.5) / fh
                
                for ratio in self.ASPECT_RATIOS:
                    w = scale * np.sqrt(ratio)
                    h = scale / np.sqrt(ratio)
                    w = min(w, 1.0)
                    h = min(h, 1.0)
                    anchors.append([cx, cy, w, h])
        
        return np.array(anchors, dtype=np.float32)
    
    def _generate_all_anchors(self):
        """Generate anchors for all feature maps"""
        all_anchors = []
        
        for i, fm_size in enumerate(self.FEATURE_MAP_SIZES):
            scale_min, scale_max = self.SCALES[i]
            anchors = self._generate_anchors_for_feature_map(fm_size, scale_min, scale_max)
            all_anchors.append(anchors)
        
        return tf.constant(np.concatenate(all_anchors, axis=0), dtype=tf.float32)
    
    def _decode_boxes(self, box_preds, anchors):
        """
        Decode predicted offsets to absolute box coordinates.
        
        IMPORTANT: This must match the encoding used during training!
        The notebook training used:
            tx = (gt_cx - anchor_cx) / anchor_w
            ty = (gt_cy - anchor_cy) / anchor_h
            tw = log(gt_w / anchor_w)
            th = log(gt_h / anchor_h)
        
        So decoding is:
            cx = tx * anchor_w + anchor_cx
            cy = ty * anchor_h + anchor_cy
            w = exp(tw) * anchor_w
            h = exp(th) * anchor_h
        
        NOTE: NO variances are used - they were not used in training!
        """
        # Extract anchor components
        anchor_cx = anchors[:, 0]
        anchor_cy = anchors[:, 1]
        anchor_w = anchors[:, 2]
        anchor_h = anchors[:, 3]
        
        # Extract prediction components (offsets)
        pred_tx = box_preds[:, 0]
        pred_ty = box_preds[:, 1]
        pred_tw = box_preds[:, 2]
        pred_th = box_preds[:, 3]
        
        # Decode (NO variances - must match training)
        decoded_cx = pred_tx * anchor_w + anchor_cx
        decoded_cy = pred_ty * anchor_h + anchor_cy
        decoded_w = tf.exp(tf.clip_by_value(pred_tw, -10.0, 10.0)) * anchor_w  # Clip to prevent overflow
        decoded_h = tf.exp(tf.clip_by_value(pred_th, -10.0, 10.0)) * anchor_h
        
        # Clip to valid range [0, 1]
        decoded_cx = tf.clip_by_value(decoded_cx, 0.0, 1.0)
        decoded_cy = tf.clip_by_value(decoded_cy, 0.0, 1.0)
        decoded_w = tf.clip_by_value(decoded_w, 0.001, 1.0)
        decoded_h = tf.clip_by_value(decoded_h, 0.001, 1.0)
        
        return tf.stack([decoded_cx, decoded_cy, decoded_w, decoded_h], axis=1)
    
    def _non_maximum_suppression(self, boxes, scores, max_output_size=8):
        """
        Apply NMS to remove overlapping boxes.
        
        Args:
            boxes: (N, 4) boxes in [cx, cy, w, h] format (normalized)
            scores: (N,) confidence scores
            max_output_size: Maximum number of detections to keep (default: 8)
        
        Returns:
            selected_indices: Indices of kept boxes
        """
        # Convert from [cx, cy, w, h] to [y1, x1, y2, x2] for tf.image.non_max_suppression
        x1 = boxes[:, 0] - boxes[:, 2] / 2
        y1 = boxes[:, 1] - boxes[:, 3] / 2
        x2 = boxes[:, 0] + boxes[:, 2] / 2
        y2 = boxes[:, 1] + boxes[:, 3] / 2
        
        boxes_corner = tf.stack([y1, x1, y2, x2], axis=1)
        
        selected_indices = tf.image.non_max_suppression(
            boxes_corner,
            scores,
            max_output_size=max_output_size,
            iou_threshold=self.nms_threshold
        )
        
        return selected_indices
    
    def _preprocess(self, frame):
        """Preprocess frame for model input"""
        # Resize to model input size
        resized = cv2.resize(frame, (self.IMG_WIDTH, self.IMG_HEIGHT))
        # Convert BGR to RGB
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        # Normalize to [0, 1]
        normalized = rgb.astype(np.float32) / 255.0
        # Add batch dimension
        return np.expand_dims(normalized, axis=0)
    
    def detect(self, frame):
        """
        Detect vehicles in a frame
        
        Args:
            frame: BGR image (numpy array)
            
        Returns:
            List of dictionaries with detections:
            [
                {
                    'bbox': [x1, y1, x2, y2],  # Coordinates in original frame
                    'confidence': 0.95,
                    'class_name': 'car',
                    'class_id': 0
                },
                ...
            ]
        """
        if not self.available:
            return []
        
        original_h, original_w = frame.shape[:2]
        
        # Preprocess
        input_tensor = self._preprocess(frame)
        
        # Run inference
        predictions = self.model.predict(input_tensor, verbose=0)
        
        # Handle dictionary output (our model returns {'boxes': ..., 'classes': ...})
        if isinstance(predictions, dict):
            box_preds = predictions['boxes'][0]  # (num_anchors, 4)
            class_preds = predictions['classes'][0]  # (num_anchors, num_classes)
        elif isinstance(predictions, list):
            box_preds = predictions[0][0]  # (num_anchors, 4)
            class_preds = predictions[1][0]  # (num_anchors, num_classes)
        else:
            # Single array output - need to split
            box_preds = predictions[0, :, :4]
            class_preds = predictions[0, :, 4:]
        
        # Convert to tensors
        box_preds = tf.constant(box_preds, dtype=tf.float32)
        class_preds = tf.constant(class_preds, dtype=tf.float32)
        
        # Get confidence scores
        # For single class, squeeze to get 1D tensor
        if len(class_preds.shape) > 1 and class_preds.shape[-1] == 1:
            confidence_scores = tf.squeeze(class_preds, axis=-1)
        elif len(class_preds.shape) > 1 and class_preds.shape[-1] > 1:
            # Multi-class: take max probability across classes
            confidence_scores = tf.reduce_max(class_preds, axis=-1)
        else:
            confidence_scores = class_preds
        
        # Convert to tensors
        box_preds = tf.constant(box_preds, dtype=tf.float32)
        class_preds = tf.constant(class_preds, dtype=tf.float32)
        
        # Debug: log raw prediction stats
        self.logger.debug(f"Raw predictions - boxes shape: {box_preds.shape}, classes shape: {class_preds.shape}")
        self.logger.debug(f"Confidence scores - min: {tf.reduce_min(confidence_scores):.4f}, max: {tf.reduce_max(confidence_scores):.4f}, mean: {tf.reduce_mean(confidence_scores):.4f}")
        
        # Decode boxes (converts from offsets to absolute coordinates)
        decoded_boxes = self._decode_boxes(box_preds, self.anchors)
        
        # Filter by confidence threshold
        conf_mask = confidence_scores >= self.conf_threshold
        num_above_threshold = tf.reduce_sum(tf.cast(conf_mask, tf.int32))
        self.logger.debug(f"Detections above threshold {self.conf_threshold}: {num_above_threshold.numpy()}")
        
        filtered_boxes = tf.boolean_mask(decoded_boxes, conf_mask)
        filtered_scores = tf.boolean_mask(confidence_scores, conf_mask)
        
        if tf.shape(filtered_boxes)[0] == 0:
            return []
        
        # Apply NMS
        selected_indices = self._non_maximum_suppression(filtered_boxes, filtered_scores)
        
        final_boxes = tf.gather(filtered_boxes, selected_indices).numpy()
        final_scores = tf.gather(filtered_scores, selected_indices).numpy()
        
        # Convert to original frame coordinates
        # Limit final detections and log
        self.logger.debug(f"After NMS: {len(final_boxes)} detections")
        
        # Build detection list
        detections = []
        for i in range(len(final_boxes)):
            cx, cy, w, h = final_boxes[i]
            
            # Skip invalid boxes (too small or outside bounds)
            # Min size 0.02 = 2% of image dimension
            if w < 0.02 or h < 0.02 or cx < 0 or cy < 0 or cx > 1 or cy > 1:
                continue
            
            # Skip unreasonably large boxes (likely false positives)
            if w > 0.9 or h > 0.9:
                continue
            
            # Convert from normalized [0,1] to pixel coordinates
            x1 = int((cx - w/2) * original_w)
            y1 = int((cy - h/2) * original_h)
            x2 = int((cx + w/2) * original_w)
            y2 = int((cy + h/2) * original_h)
            
            # Clamp to frame boundaries
            x1 = max(0, min(x1, original_w - 1))
            y1 = max(0, min(y1, original_h - 1))
            x2 = max(0, min(x2, original_w))
            y2 = max(0, min(y2, original_h))
            
            # Skip small detections (min 15px)
            if (x2 - x1) < 15 or (y2 - y1) < 15:
                continue
            
            detections.append({
                'bbox': [x1, y1, x2, y2],
                'confidence': float(final_scores[i]),
                'class_name': 'car',
                'class_id': 0
            })
        
        return detections
    
    def draw_detections(self, frame, detections, color=(255, 165, 0)):
        """
        Draw vehicle detections on the frame
        
        Args:
            frame: Original frame
            detections: List of detections from detect() method
            color: BGR color for rectangle (default: orange)
            
        Returns:
            Frame with detections drawn
        """
        frame_copy = frame.copy()
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            confidence = det['confidence']
            
            # Draw rectangle
            cv2.rectangle(frame_copy, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label
            label = f"Car (SSD): {confidence:.2f}"
            
            # Background for text
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame_copy, (x1, y1 - h - 10), (x1 + w + 6, y1), color, -1)
            
            # Text
            cv2.putText(frame_copy, label, (x1 + 3, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        return frame_copy

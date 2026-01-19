#!/usr/bin/env python3
"""
SSD Training Script
===================

Main training script for the SSD vehicle detector.

Usage:
    cd ai
    python -m model.train

    # With custom parameters:
    python -m model.train --epochs 150 --batch-size 8 --lr 1e-4
"""

import os
import sys
import argparse

import numpy as np

# NumPy compatibility fix for future versions
if not hasattr(np, "object"):
    np.object = np.object_

# Configure TensorFlow before import
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.models import Model

from .config import (
    IMG_HEIGHT,
    IMG_WIDTH,
    NUM_CLASSES,
    DEFAULT_EPOCHS,
    DEFAULT_BATCH_SIZE,
    DEFAULT_LEARNING_RATE,
    DEFAULT_DATASET_PATH,
    DATASET_STRUCTURES,
    PHASE1_RATIO,
    FINETUNE_LR_FACTOR,
    FINETUNE_UNFREEZE_LAYERS,
)
from .dataset import index_dataset, create_tf_dataset
from .anchors import generate_all_anchors
from .model import build_ssd_model, SSDModel
from .losses import SSDBoxLoss, SSDClassLoss
from .utils import print_training_summary


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Train SSD vehicle detection model'
    )
    parser.add_argument(
        '--epochs', 
        type=int, 
        default=DEFAULT_EPOCHS,
        help=f'Number of training epochs (default: {DEFAULT_EPOCHS})'
    )
    parser.add_argument(
        '--batch-size', 
        type=int, 
        default=DEFAULT_BATCH_SIZE,
        help=f'Batch size (default: {DEFAULT_BATCH_SIZE})'
    )
    parser.add_argument(
        '--lr', 
        type=float, 
        default=DEFAULT_LEARNING_RATE,
        help=f'Learning rate (default: {DEFAULT_LEARNING_RATE})'
    )
    parser.add_argument(
        '--dataset', 
        type=str, 
        default=DEFAULT_DATASET_PATH,
        help=f'Path to UA-DETRAC dataset (default: {DEFAULT_DATASET_PATH})'
    )
    return parser.parse_args()


def detect_dataset_structure(dataset_dir: str) -> dict:
    """
    Detect dataset directory structure.
    
    Args:
        dataset_dir: Root directory of the dataset.
        
    Returns:
        Dictionary with paths or None if not found.
    """
    for structure_name, paths in DATASET_STRUCTURES.items():
        train_img = os.path.join(dataset_dir, paths['train_images'])
        train_lbl = os.path.join(dataset_dir, paths['train_labels'])
        
        if os.path.exists(train_img) and os.path.exists(train_lbl):
            print(f"✓ Detected structure: {structure_name}")
            return {
                'train_images': train_img,
                'train_labels': train_lbl,
                'val_images': os.path.join(dataset_dir, paths['val_images']),
                'val_labels': os.path.join(dataset_dir, paths['val_labels']),
            }
    
    return None


def create_callbacks(models_dir: str) -> list:
    """
    Create training callbacks.
    
    Args:
        models_dir: Directory to save model checkpoints.
        
    Returns:
        List of Keras callbacks.
    """
    return [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(models_dir, "ssd_best.weights.h5"),
            monitor="val_loss",
            save_best_only=True,
            save_weights_only=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=15,
            restore_best_weights=True,
            verbose=1
        ),
    ]


def main():
    """Main training function."""
    args = parse_arguments()
    
    # Print header
    print("=" * 80)
    print("🚀 SSD TRAINING - VEHICLE DETECTOR")
    print("=" * 80)
    print(f"   Epochs: {args.epochs}")
    print(f"   Batch size: {args.batch_size}")
    print(f"   Learning rate: {args.lr}")
    print(f"   Classes: {NUM_CLASSES} (generic vehicle)")
    print(f"   Image size: {IMG_WIDTH}x{IMG_HEIGHT}")
    print("=" * 80)
    
    # Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    
    # Handle absolute/relative dataset path
    if os.path.isabs(args.dataset):
        dataset_dir = args.dataset
    else:
        dataset_dir = os.path.join(base_dir, args.dataset)
    
    models_dir = os.path.join(base_dir, 'src', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"\n📂 Dataset directory: {dataset_dir}")
    
    # Detect dataset structure
    print("\n🔍 Detecting dataset structure...")
    paths = detect_dataset_structure(dataset_dir)
    
    if paths is None:
        print(f"❌ No valid structure found in: {dataset_dir}")
        print("\nSupported structures:")
        for name, structure in DATASET_STRUCTURES.items():
            print(f"  {name}:")
            for key, path in structure.items():
                print(f"    {key}: {path}")
        return
    
    print(f"\n📍 Detected paths:")
    print(f"   Train images: {paths['train_images']}")
    print(f"   Train labels: {paths['train_labels']}")
    print(f"   Val images:   {paths['val_images']}")
    print(f"   Val labels:   {paths['val_labels']}")
    
    # Index dataset
    print("\n📂 Indexing dataset...")
    train_samples = index_dataset(paths['train_images'], paths['train_labels'])
    
    val_samples = []
    if os.path.exists(paths['val_images']):
        val_samples = index_dataset(paths['val_images'], paths['val_labels'])
    
    if not train_samples:
        print("❌ No training samples found")
        return
    
    print(f"\n✅ Dataset indexed:")
    print(f"   Train: {len(train_samples)} samples")
    print(f"   Val:   {len(val_samples)} samples")
    
    # Create TensorFlow datasets
    print("\n📦 Creating tf.data.Dataset...")
    train_ds = create_tf_dataset(
        train_samples, 
        args.batch_size, 
        augment=True, 
        shuffle=True
    )
    val_ds = create_tf_dataset(
        val_samples, 
        args.batch_size, 
        augment=False, 
        shuffle=False
    )
    
    # Build model
    print("\n🧠 Building model...")
    base_model, input_tensor, box_preds, class_preds = build_ssd_model()
    
    # Generate anchors
    print("\n⚓ Generating anchors...")
    anchors = generate_all_anchors()
    
    # Create loss functions
    box_loss_fn = SSDBoxLoss(anchors)
    class_loss_fn = SSDClassLoss(anchors)
    
    # Create model wrapper
    ssd_model = SSDModel(base_model, box_loss_fn, class_loss_fn)
    ssd_model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=args.lr)
    )
    
    # Build model (required for saving weights)
    print("\n🔧 Building model...")
    dummy_input = tf.zeros((1, IMG_HEIGHT, IMG_WIDTH, 3))
    _ = ssd_model(dummy_input, training=False)
    print("✓ Model built successfully")
    
    # Create callbacks
    callbacks = create_callbacks(models_dir)
    
    # Calculate epochs for each phase
    if args.epochs < 2:
        phase1_epochs = 1
        phase2_epochs = 0
    else:
        phase1_epochs = min(
            max(int(args.epochs * PHASE1_RATIO), 1), 
            args.epochs - 1
        )
        phase2_epochs = args.epochs - phase1_epochs
    
    # =========================================================================
    # PHASE 1: Training with frozen backbone
    # =========================================================================
    print("\n" + "=" * 80)
    print("🏃 PHASE 1: INITIAL TRAINING (Frozen backbone)")
    print("=" * 80)
    
    history_phase1 = ssd_model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=phase1_epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    # =========================================================================
    # PHASE 2: Fine-tuning with partially unfrozen backbone
    # =========================================================================
    print("\n" + "=" * 80)
    print("🔥 PHASE 2: FINE-TUNING (Partially unfrozen backbone)")
    print("=" * 80)
    
    # Unfreeze last layers of backbone
    ssd_model.unfreeze_backbone(num_layers=FINETUNE_UNFREEZE_LAYERS)
    print(f"✓ Backbone partially unfrozen (last {FINETUNE_UNFREEZE_LAYERS} layers)")
    
    # Lower learning rate for fine-tuning
    lr_finetuning = args.lr * FINETUNE_LR_FACTOR
    ssd_model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_finetuning)
    )
    print(f"✓ Learning rate adjusted to {lr_finetuning}")
    
    history_phase2 = None
    if phase2_epochs > 0:
        history_phase2 = ssd_model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=phase1_epochs + phase2_epochs,
            initial_epoch=phase1_epochs,
            callbacks=callbacks,
            verbose=1
        )
    
    # Combine training histories
    if history_phase2 and 'loss' in history_phase2.history:
        history = {
            'loss': history_phase1.history['loss'] + history_phase2.history['loss'],
            'val_loss': history_phase1.history['val_loss'] + history_phase2.history['val_loss'],
            'phase1_epochs': phase1_epochs,
            'phase2_epochs': phase2_epochs
        }
    else:
        history = {
            'loss': history_phase1.history['loss'],
            'val_loss': history_phase1.history['val_loss'],
            'phase1_epochs': phase1_epochs,
            'phase2_epochs': 0
        }
    
    print("\n📊 Training summary:")
    print(f"  Phase 1 (frozen backbone): {phase1_epochs} epochs")
    print(f"  Phase 2 (fine-tuning): {phase2_epochs} epochs")
    print(f"  Total: {args.epochs} epochs")
    
    # =========================================================================
    # Save model
    # =========================================================================
    print("\n💾 Saving model...")
    
    # Create functional model (compatible with ssd_detector.py)
    functional_model = Model(
        inputs=input_tensor,
        outputs={'boxes': box_preds, 'classes': class_preds},
        name='SSD_MobileNetV2_VehicleDetector'
    )
    functional_model.set_weights(ssd_model.base_model.get_weights())
    
    keras_path = os.path.join(models_dir, "ssd_vehicle_detector.keras")
    weights_path = os.path.join(models_dir, "ssd_vehicle_detector.weights.h5")
    
    functional_model.save(keras_path)
    functional_model.save_weights(weights_path)
    
    print(f"✅ Model saved: {keras_path}")
    print(f"✅ Weights saved: {weights_path}")
    
    # Print final summary
    print_training_summary(history)
    
    print(f"\n   Model ready for use with ssd_detector.py")
    print("=" * 80)


if __name__ == '__main__':
    main()

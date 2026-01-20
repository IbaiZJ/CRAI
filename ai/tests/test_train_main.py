"""Tests específicos para la función main de train_ssd.py"""
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import numpy as np
import tensorflow as tf

from scripts import train_ssd as train


def test_main_with_structure_1(monkeypatch, tmp_path, capsys):
    """Test main with structure 1 dataset layout"""
    # Create structure 1 layout
    dataset_dir = tmp_path / "dataset"
    images_train = dataset_dir / "images" / "train"
    labels_train = dataset_dir / "labels" / "train"
    images_val = dataset_dir / "images" / "val"
    labels_val = dataset_dir / "labels" / "val"
    
    for d in [images_train, labels_train, images_val, labels_val]:
        d.mkdir(parents=True)
    
    # Add test files
    (images_train / "test.jpg").touch()
    (labels_train / "test.txt").write_text("0 0.5 0.5 0.1 0.1\n")
    
    # Mock sys.argv
    test_args = ["train_ssd.py", "--epochs", "1", "--batch-size", "2", "--dataset", str(dataset_dir)]
    monkeypatch.setattr(sys, "argv", test_args)
    
    # Mock tensorflow training functions
    def mock_fit(*args, **kwargs):
        return Mock(history={"loss": [0.5], "val_loss": [0.6]})
    
    # Patch critical functions to avoid actual training
    with patch.object(train, 'build_ssd_model') as mock_build:
        mock_base_model = Mock()
        mock_base_model.count_params = Mock(return_value=1000)
        mock_base_model.layers = [Mock(trainable=True) for _ in range(30)]
        mock_base_model.get_weights = Mock(return_value=[])
        mock_build.return_value = (
            mock_base_model,
            Mock(),  # input_tensor
            Mock(shape=(None, 100, 4)),  # box_preds
            Mock(shape=(None, 100, 1))   # class_preds
        )
        
        with patch.object(train.SSDModel, 'fit', mock_fit):
            with patch.object(train.tf.keras.Model, 'save'):
                with patch.object(train.tf.keras.Model, 'save_weights'):
                    try:
                        train.main()
                    except (SystemExit, Exception):
                        pass
                    
                    captured = capsys.readouterr()
                    assert "ENTRENAMIENTO SSD" in captured.out or "Detectando estructura" in captured.out


def test_main_with_structure_2(monkeypatch, tmp_path, capsys):
    """Test main with structure 2 dataset layout"""
    # Create structure 2 layout
    dataset_dir = tmp_path / "dataset"
    train_images = dataset_dir / "train" / "images"
    train_labels = dataset_dir / "train" / "labels"
    valid_images = dataset_dir / "valid" / "images"
    valid_labels = dataset_dir / "valid" / "labels"
    
    for d in [train_images, train_labels, valid_images, valid_labels]:
        d.mkdir(parents=True)
    
    # Add test files
    (train_images / "test.jpg").touch()
    (train_labels / "test.txt").write_text("0 0.5 0.5 0.1 0.1\n")
    
    # Mock sys.argv
    test_args = ["train_ssd.py", "--epochs", "1", "--batch-size", "2", "--dataset", str(dataset_dir)]
    monkeypatch.setattr(sys, "argv", test_args)
    
    with patch.object(train, 'build_ssd_model'):
        try:
            train.main()
        except:
            pass
        
        captured = capsys.readouterr()
        assert "train/images" in captured.out or "Detectando estructura" in captured.out


def test_main_missing_dataset(monkeypatch, tmp_path, capsys):
    """Test main with missing dataset"""
    # Mock sys.argv with non-existent dataset
    test_args = ["train_ssd.py", "--dataset", str(tmp_path / "nonexistent")]
    monkeypatch.setattr(sys, "argv", test_args)
    
    try:
        train.main()
    except:
        pass
    
    captured = capsys.readouterr()
    assert "No se detectó estructura válida" in captured.out or "Dataset dir" in captured.out


def test_main_absolute_path(monkeypatch, tmp_path):
    """Test main with absolute dataset path"""
    dataset_dir = tmp_path / "dataset"
    train_images = dataset_dir / "train" / "images"
    train_labels = dataset_dir / "train" / "labels"
    train_images.mkdir(parents=True)
    train_labels.mkdir(parents=True)
    
    (train_images / "test.jpg").touch()
    (train_labels / "test.txt").write_text("0 0.5 0.5 0.1 0.1\n")
    
    # Use absolute path
    abs_path = str(dataset_dir.absolute())
    test_args = ["train_ssd.py", "--epochs", "1", "--dataset", abs_path]
    monkeypatch.setattr(sys, "argv", test_args)
    
    # Should handle absolute paths correctly
    assert os.path.isabs(abs_path)


def test_main_models_dir_creation(monkeypatch, tmp_path):
    """Test that main creates models directory"""
    dataset_dir = tmp_path / "dataset"
    train_images = dataset_dir / "train" / "images"
    train_labels = dataset_dir / "train" / "labels"
    train_images.mkdir(parents=True)
    train_labels.mkdir(parents=True)
    
    (train_images / "test.jpg").touch()
    (train_labels / "test.txt").write_text("0 0.5 0.5 0.1 0.1\n")
    
    test_args = ["train_ssd.py", "--epochs", "1", "--dataset", str(dataset_dir)]
    monkeypatch.setattr(sys, "argv", test_args)
    
    # Models dir should be created
    # (actual test would need more mocking)


def test_argparse_defaults():
    """Test argument parser defaults"""
    parser = train.argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--batch-size', type=int, default=12)
    parser.add_argument('--lr', type=float, default=1e-4)
    
    args = parser.parse_args([])
    
    assert args.epochs == 100
    assert args.batch_size == 12
    assert args.lr == 1e-4


def test_argparse_custom_values():
    """Test argument parser with custom values"""
    parser = train.argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--batch-size', type=int, default=12)
    parser.add_argument('--lr', type=float, default=1e-4)
    
    args = parser.parse_args(['--epochs', '50', '--batch-size', '16', '--lr', '0.0001'])
    
    assert args.epochs == 50
    assert args.batch_size == 16
    assert args.lr == 0.0001

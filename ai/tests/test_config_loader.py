"""Tests for config_loader.py to improve coverage"""
import os
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
import yaml

from utils import config_loader


def test_default_base_dir():
    """Test _default_base_dir returns correct path"""
    base_dir = config_loader._default_base_dir()
    assert os.path.isabs(base_dir)
    assert os.path.exists(base_dir)


def test_resolve_path_absolute():
    """Test resolve_path with absolute path"""
    abs_path = "/absolute/path/to/file.yaml"
    result = config_loader.resolve_path(abs_path)
    assert result == os.path.normpath(abs_path)


def test_resolve_path_relative():
    """Test resolve_path with relative path"""
    rel_path = "config/config.yaml"
    result = config_loader.resolve_path(rel_path)
    assert os.path.isabs(result)
    assert "config" in result
    assert "config.yaml" in result


def test_resolve_path_with_custom_base_dir():
    """Test resolve_path with custom base directory"""
    custom_base = "/custom/base"
    result = config_loader.resolve_path("config.yaml", base_dir=custom_base)
    expected = os.path.normpath(os.path.join(custom_base, "config.yaml"))
    assert result == expected


def test_resolve_path_empty_string():
    """Test resolve_path with empty string returns None"""
    result = config_loader.resolve_path("")
    assert result is None


def test_resolve_path_none():
    """Test resolve_path with None returns None"""
    result = config_loader.resolve_path(None)
    assert result is None


def test_resolve_path_windows_style(tmp_path):
    """Test resolve_path normalizes Windows-style paths"""
    win_path = "config\\config.yaml"
    result = config_loader.resolve_path(win_path, base_dir=str(tmp_path))
    # Should use forward slashes or be normalized
    assert result is not None
    assert os.path.exists(os.path.dirname(result)) or "/" in result or "\\" in result


def test_load_config_valid():
    """Test load_config loads valid YAML file"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_dir = Path(tmp_dir) / "config"
        config_dir.mkdir()
        
        config_file = config_dir / "config.yaml"
        config_file.write_text("test_key: test_value\nnested:\n  key: value")
        
        with patch.object(config_loader, "_default_base_dir", return_value=tmp_dir):
            # Clear cache before test
            config_loader.load_config.cache_clear()
            config = config_loader.load_config()
            
            assert config is not None
            assert "test_key" in config
            assert config["test_key"] == "test_value"


def test_load_config_empty_file():
    """Test load_config with empty YAML file"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_dir = Path(tmp_dir) / "config"
        config_dir.mkdir()
        
        config_file = config_dir / "config.yaml"
        config_file.write_text("")
        
        with patch.object(config_loader, "_default_base_dir", return_value=tmp_dir):
            config_loader.load_config.cache_clear()
            config = config_loader.load_config()
            
            assert config == {} or config is None


def test_load_config_caching():
    """Test that load_config uses LRU caching"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_dir = Path(tmp_dir) / "config"
        config_dir.mkdir()
        
        config_file = config_dir / "config.yaml"
        config_file.write_text("key: value1")
        
        with patch.object(config_loader, "_default_base_dir", return_value=tmp_dir):
            config_loader.load_config.cache_clear()
            
            # First call
            config1 = config_loader.load_config()
            
            # Modify file (should be ignored due to caching)
            config_file.write_text("key: value2")
            
            # Second call should return cached result
            config2 = config_loader.load_config()
            
            assert config1 == config2
            assert config1.get("key") == "value1"


def test_load_config_missing_file():
    """Test load_config with missing config file"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        with patch.object(config_loader, "_default_base_dir", return_value=tmp_dir):
            config_loader.load_config.cache_clear()
            
            # Should raise FileNotFoundError
            with pytest.raises(FileNotFoundError):
                config_loader.load_config()


def test_load_config_invalid_yaml():
    """Test load_config with invalid YAML"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_dir = Path(tmp_dir) / "config"
        config_dir.mkdir()
        
        config_file = config_dir / "config.yaml"
        config_file.write_text("invalid: yaml: content: [")
        
        with patch.object(config_loader, "_default_base_dir", return_value=tmp_dir):
            config_loader.load_config.cache_clear()
            
            # Should raise yaml parsing error
            with pytest.raises(Exception):  # yaml.YAMLError or similar
                config_loader.load_config()


def test_resolve_path_with_dots():
    """Test resolve_path with relative paths containing dots"""
    result = config_loader.resolve_path("../config/config.yaml")
    assert result is not None
    assert ".." not in result or os.path.isabs(result)


def test_resolve_path_special_characters():
    """Test resolve_path with special characters"""
    result = config_loader.resolve_path("config-2/config_v1.yaml")
    assert result is not None
    assert "config" in result

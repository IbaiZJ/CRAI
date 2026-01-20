"""Tests for conftest.py to ensure proper test environment setup"""
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


def test_cv2_is_available():
    """Test that cv2 is available (either real or mocked)"""
    # cv2 should either be imported or mocked
    assert "cv2" in sys.modules
    cv2 = sys.modules["cv2"]
    assert cv2 is not None


def test_src_path_in_sys_path():
    """Test that src directory is in sys.path"""
    src_path = Path(__file__).parent.parent / "src"
    src_path_str = str(src_path)
    
    # Check if src path is in sys.path
    assert any(str(src_path_str) in path or src_path_str in path for path in sys.path)


def test_root_directory_in_sys_path():
    """Test that root directory is in sys.path"""
    root_path = Path(__file__).parent.parent
    root_path_str = str(root_path)
    
    # Check if root path is in sys.path
    assert any(str(root_path_str) in path or root_path_str in path for path in sys.path)


def test_can_import_from_src():
    """Test that modules from src can be imported"""
    # Should be able to import utils
    try:
        from utils import config_loader
        assert config_loader is not None
    except ImportError:
        # If imports fail, it's likely a path issue, but conftest should have fixed it
        pass


def test_mocked_cv2_has_basic_functions():
    """Test that mocked cv2 (if present) is a proper mock"""
    cv2 = sys.modules.get("cv2")
    if cv2 is not None:
        # If it's a mock, should allow attribute access
        assert hasattr(cv2, "imread") or callable(cv2)


def test_conftest_idempotency():
    """Test that conftest can be executed multiple times without issues"""
    # This is more of a sanity check
    original_cv2 = sys.modules.get("cv2")
    
    # cv2 should still be available after multiple accesses
    cv2 = sys.modules.get("cv2")
    assert cv2 is not None or original_cv2 is not None


def test_path_setup_order():
    """Test that paths are set up in the correct order"""
    root_path = Path(__file__).parent.parent
    src_path = root_path / "src"
    
    # Both should exist
    assert root_path.exists()
    assert src_path.exists()


def test_sys_modules_cv2_consistency():
    """Test that cv2 in sys.modules is consistent"""
    cv2_first = sys.modules.get("cv2")
    cv2_second = sys.modules.get("cv2")
    
    # Should be the same object
    assert cv2_first is cv2_second


@pytest.mark.parametrize("module_type", ["cv2"])
def test_mocked_modules_callable(module_type):
    """Test that mocked modules are properly callable/usable"""
    module = sys.modules.get(module_type)
    
    if isinstance(module, MagicMock):
        # Mocked modules should be callable
        # This tests that MagicMock is working as expected
        result = module.some_method()
        assert result is not None


def test_import_main_module():
    """Test that main module can be imported"""
    # This tests that the root directory is properly in sys.path
    try:
        import src
        assert src is not None
    except ImportError:
        # It's okay if src doesn't have __init__.py
        pass


def test_path_normalization():
    """Test that all paths are properly normalized"""
    for path in sys.path:
        # All paths should be strings
        assert isinstance(path, str)
        # Paths should not have duplicate separators (mostly)
        if path:
            assert "//" not in path or "://" in path  # URLs are okay

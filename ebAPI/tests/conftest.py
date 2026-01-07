"""
Pytest configuration file for ebAPI tests
"""
import pytest
import sys
from pathlib import Path
import importlib

# Add ebAPI root to Python path
ebapi_root = Path(__file__).parent.parent
sys.path.insert(0, str(ebapi_root))

# Ensure our local util package wins over any preloaded module named "util".
if "util" in sys.modules:
    del sys.modules["util"]
importlib.invalidate_caches()

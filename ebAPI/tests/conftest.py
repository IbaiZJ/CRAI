"""
Pytest configuration file for ebAPI tests
"""
import pytest
import sys
from pathlib import Path

# Add ebAPI root to Python path and ensure local util wins over any site-packages module named "util"
ebapi_root = Path(__file__).parent.parent
sys.modules.pop("util", None)
sys.path.insert(0, str(ebapi_root))

"""
Pytest configuration file for ebAPI tests
"""
import pytest
import sys
from pathlib import Path

# Add ebAPI root to Python path
ebapi_root = Path(__file__).parent.parent
sys.path.insert(0, str(ebapi_root))

"""
Pytest configuration file for itvAPI tests
"""
import pytest
import sys
from pathlib import Path

# Add itvAPI root to Python path
itvapi_root = Path(__file__).parent.parent
sys.path.insert(0, str(itvapi_root))
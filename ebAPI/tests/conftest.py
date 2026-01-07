"""
Pytest configuration file for ebAPI tests
"""
import pytest
import sys
from pathlib import Path
import importlib
import importlib.util

# Add ebAPI root to Python path
ebapi_root = Path(__file__).parent.parent
sys.path.insert(0, str(ebapi_root))

# Ensure our local util package wins over any preloaded module named "util".
if "util" in sys.modules:
    del sys.modules["util"]
importlib.invalidate_caches()
util_pkg = ebapi_root / "util" / "__init__.py"
spec = importlib.util.spec_from_file_location(
    "util", util_pkg, submodule_search_locations=[str(util_pkg.parent)]
)
if spec and spec.loader:
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    sys.modules["util"] = module

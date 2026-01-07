"""Debug script to test import issues"""
import sys
import os
from pathlib import Path

print("=" * 60)
print("DIAGNOSTIC INFORMATION")
print("=" * 60)
print(f"Current directory: {os.getcwd()}")
print(f"Python version: {sys.version}")
print(f"\nPython path:")
for i, p in enumerate(sys.path):
    print(f"  {i}: {p}")

print(f"\nChecking util directory:")
util_path = Path("util")
print(f"  util exists: {util_path.exists()}")
print(f"  util is dir: {util_path.is_dir()}")

init_path = Path("util/__init__.py")
print(f"  util/__init__.py exists: {init_path.exists()}")
if init_path.exists():
    print(f"  util/__init__.py size: {init_path.stat().st_size} bytes")
    print(f"  util/__init__.py content:")
    print(f"    {init_path.read_text()!r}")

print(f"\nTrying to import util:")
try:
    import util
    print(f"  SUCCESS: {util}")
    print(f"  util.__file__: {util.__file__}")
    print(f"  util.__package__: {util.__package__}")
    print(f"  util.__path__: {util.__path__}")
except Exception as e:
    print(f"  FAILED: {e}")

print(f"\nTrying to import util.util:")
try:
    import util.util
    print(f"  SUCCESS")
except Exception as e:
    print(f"  FAILED: {e}")

print("=" * 60)

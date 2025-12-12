import sys
from unittest.mock import MagicMock
from pathlib import Path

# Mock cv2 if not present to allow tests to run in CI/CD or environments without opencv
try:
    import cv2
except ImportError:
    sys.modules["cv2"] = MagicMock()

# Add src directory to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))
# Add root directory to path to allow src.main import for coverage
sys.path.insert(0, str(Path(__file__).parent))

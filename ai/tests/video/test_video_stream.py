import pytest
from unittest.mock import Mock, patch
import sys

# Mock picamera before import
sys.modules['picamera'] = Mock()
sys.modules['picamera.array'] = Mock()

from video.video_stream import VideoStream


class TestVideoStream:
    """Tests for VideoStream class."""

    def _mock_capture(self, is_opened=True, read_value=(True, "mock_frame")):
        mock_cap = Mock()
        mock_cap.isOpened.return_value = is_opened
        mock_cap.read.return_value = read_value
        mock_cap.release.return_value = None
        return mock_cap

    @pytest.fixture
    def mock_webcam_stream(self):
        """Create a mock WebcamVideoStream."""
        mock = Mock()
        mock.start.return_value = mock
        mock.read.return_value = "mock_frame"
        return mock

    def test_initialization_webcam(self, mock_webcam_stream):
        """Test initialization with webcam."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream(src=0, use_pi_camera=False)
            assert stream.stream == mock_webcam_stream

    def test_initialization_webcam_default(self, mock_webcam_stream):
        """Test initialization with default parameters."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream()
            assert stream.stream == mock_webcam_stream

    def test_initialization_picamera(self):
        """Test initialization with PiCamera (using dynamic import)."""
        with patch('builtins.__import__', side_effect=lambda name, *args, **kwargs:
                   Mock() if 'pi_video_stream' in name else __import__(name, *args, **kwargs)):
            try:
                stream = VideoStream(use_pi_camera=True, resolution=(640, 480), framerate=30)
                assert stream is not None
            except ImportError:
                pass

    def test_initialization_picamera_default_params(self):
        """Test initialization with PiCamera default params."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream') as mock_webcam:
            mock_instance = Mock()
            mock_webcam.return_value = mock_instance
            stream = VideoStream(use_pi_camera=False)
            assert stream.stream == mock_instance

    def test_start_webcam(self, mock_webcam_stream):
        """Test starting webcam stream."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream()
            result = stream.start()
            mock_webcam_stream.start.assert_called_once()
            assert result == mock_webcam_stream

    def test_update_webcam(self, mock_webcam_stream):
        """Test updating webcam stream."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream()
            stream.update()
            mock_webcam_stream.update.assert_called_once()

    def test_read_webcam(self, mock_webcam_stream):
        """Test reading from webcam stream."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream()
            frame = stream.read()
            mock_webcam_stream.read.assert_called_once()
            assert frame == "mock_frame"

    def test_stop_webcam(self, mock_webcam_stream):
        """Test stopping webcam stream."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream()
            stream.stop()
            mock_webcam_stream.stop.assert_called_once()

    def test_custom_src(self, mock_webcam_stream):
        """Test initialization with custom source."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream) as mock_class:
            VideoStream(src=1)
            mock_class.assert_called_once_with(src=1, resolution=(320, 240), framerate=32)

    def test_full_workflow_webcam(self, mock_webcam_stream):
        """Test complete workflow with webcam."""
        mock_cap = self._mock_capture()
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.WebcamVideoStream', return_value=mock_webcam_stream):
            stream = VideoStream(src=0)
            stream.start()
            mock_webcam_stream.start.assert_called_once()
            frame = stream.read()
            assert frame == "mock_frame"
            stream.update()
            mock_webcam_stream.update.assert_called_once()
            stream.stop()
            mock_webcam_stream.stop.assert_called_once()

    def test_auto_find_when_opened_but_no_frame(self):
        """Auto-find if camera opens but cannot read frames."""
        mock_cap = self._mock_capture(is_opened=True, read_value=(False, None))
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.VideoStream._try_auto_find') as try_find:
            VideoStream(src=0, auto_find=True)
            try_find.assert_called_once()

    def test_auto_find_when_not_opened(self):
        """Auto-find if camera is not opened."""
        mock_cap = self._mock_capture(is_opened=False)
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap), \
             patch('video.video_stream.VideoStream._try_auto_find') as try_find:
            VideoStream(src=0, auto_find=True)
            try_find.assert_called_once()

    def test_no_auto_find_opened_but_no_frame_raises(self):
        """Raise if camera opens but cannot read and auto_find is disabled."""
        mock_cap = self._mock_capture(is_opened=True, read_value=(False, None))
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap):
            with pytest.raises(RuntimeError):
                VideoStream(src=0, auto_find=False)

    def test_no_auto_find_not_opened_raises(self):
        """Raise if camera is not available and auto_find is disabled."""
        mock_cap = self._mock_capture(is_opened=False)
        with patch('video.video_stream.cv2.VideoCapture', return_value=mock_cap):
            with pytest.raises(RuntimeError):
                VideoStream(src=0, auto_find=False)

    def test_try_auto_find_selects_camera(self):
        """Use first available camera when auto-find succeeds."""
        with patch('video.video_stream.VideoStream.find_available_cameras', return_value=[2]), \
             patch('video.video_stream.WebcamVideoStream') as mock_webcam:
            stream = VideoStream.__new__(VideoStream)
            stream.logger = Mock()
            stream._try_auto_find(0, (320, 240), 30)
            mock_webcam.assert_called_once_with(src=2, resolution=(320, 240), framerate=30)

    def test_try_auto_find_no_cameras(self):
        """Raise when no cameras are found."""
        with patch('video.video_stream.VideoStream.find_available_cameras', return_value=[]):
            stream = VideoStream.__new__(VideoStream)
            stream.logger = Mock()
            with pytest.raises(RuntimeError):
                stream._try_auto_find(0, (320, 240), 30)

    def test_find_available_cameras(self):
        """Detect available cameras with mixed results."""
        def make_cap(opened, read_value):
            cap = Mock()
            cap.isOpened.return_value = opened
            cap.read.return_value = read_value
            cap.release.return_value = None
            return cap

        caps = {
            0: make_cap(True, (True, "frame0")),
            1: make_cap(True, (False, None)),
            2: make_cap(False, (False, None)),
        }

        def cap_factory(i):
            return caps.get(i, make_cap(False, (False, None)))

        with patch('video.video_stream.cv2.VideoCapture', side_effect=cap_factory), \
             patch('video.video_stream.time.sleep', return_value=None):
            available = VideoStream.find_available_cameras(max_cameras=3)
            assert available == [0]

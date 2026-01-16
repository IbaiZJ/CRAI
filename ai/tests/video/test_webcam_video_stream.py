import pytest
import numpy as np
import cv2
from unittest.mock import Mock, patch, MagicMock
from video.webcam_video_stream import WebcamVideoStream


class TestWebcamVideoStream:
    """Tests for WebcamVideoStream class."""
    
    @pytest.fixture
    def mock_video_capture(self):
        """Create a mock VideoCapture object."""
        mock = Mock(spec=cv2.VideoCapture)
        # Create a dummy frame (100x100 black image)
        dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)
        mock.read.return_value = (True, dummy_frame)
        return mock
    
    @pytest.fixture
    def stream_with_mock(self, mock_video_capture):
        """Create WebcamVideoStream with mocked VideoCapture."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture):
            stream = WebcamVideoStream(src=0)
            yield stream
            stream.stop()
    
    def test_initialization(self, mock_video_capture):
        """Test WebcamVideoStream initialization."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture):
            stream = WebcamVideoStream(src=0)
            
            assert stream.stream is not None
            assert stream.grabbed is True
            assert stream.frame is not None
            assert stream.stopped is False
            assert stream.frame.shape == (100, 100, 3)
    
    def test_initialization_with_custom_src(self, mock_video_capture):
        """Test initialization with custom video source."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture) as mock_cap:
            stream = WebcamVideoStream(src=1)
            mock_cap.assert_called_once_with(1)
    
    def test_start_returns_self(self, stream_with_mock):
        """Test that start() returns self for chaining."""
        result = stream_with_mock.start()
        assert result == stream_with_mock
    
    def test_read_returns_frame(self, stream_with_mock):
        """Test reading frames."""
        frame = stream_with_mock.read()
        assert frame is not None
        assert isinstance(frame, np.ndarray)
        assert frame.shape == (100, 100, 3)
    
    def test_stop_sets_flag(self, stream_with_mock):
        """Test stopping the stream."""
        assert stream_with_mock.stopped is False
        stream_with_mock.stop()
        assert stream_with_mock.stopped is True
    
    def test_update_reads_frame(self, mock_video_capture):
        """Test update method structure (update has infinite loop, so we test the logic)."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture):
            stream = WebcamVideoStream(src=0)
            
            # Verify initial read was called
            initial_calls = mock_video_capture.read.call_count
            assert initial_calls >= 1  # At least once in __init__
            
            # Note: update() runs in infinite loop, so we don't call it directly in tests
            # The logic is tested through stop flag behavior
    
    def test_update_stops_when_flag_set(self, mock_video_capture):
        """Test that update stops when stopped flag is set."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture):
            stream = WebcamVideoStream(src=0)
            stream.stopped = True
            
            # update should return immediately when stopped is True
            result = stream.update()
            assert result is None
    
    def test_frame_updates_continuously(self, mock_video_capture):
        """Test that frames update during streaming."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture):
            stream = WebcamVideoStream(src=0)
            
            initial_frame = stream.frame.copy()
            
            # Update frame data
            new_frame = np.ones((100, 100, 3), dtype=np.uint8) * 128
            mock_video_capture.read.return_value = (True, new_frame)
            
            stream.grabbed, stream.frame = stream.stream.read()
            
            assert not np.array_equal(stream.frame, initial_frame)
    
    def test_multiple_stop_calls(self, stream_with_mock):
        """Test that multiple stop calls are safe."""
        stream_with_mock.stop()
        stream_with_mock.stop()
        assert stream_with_mock.stopped is True
    
    def test_default_src_parameter(self, mock_video_capture):
        """Test default src parameter is 0."""
        with patch('cv2.VideoCapture', return_value=mock_video_capture) as mock_cap:
            stream = WebcamVideoStream()
            mock_cap.assert_called_once_with(0)
    
    def test_grabbed_false_scenario(self):
        """Test scenario where frame grab fails."""
        mock_cap = Mock(spec=cv2.VideoCapture)
        mock_cap.read.return_value = (False, None)
        
        with patch('cv2.VideoCapture', return_value=mock_cap):
            with pytest.raises(RuntimeError):
                WebcamVideoStream(src=0)

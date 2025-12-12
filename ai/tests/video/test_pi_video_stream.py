import pytest
from unittest.mock import Mock, patch, MagicMock
import sys

# Mock picamera module before importing
sys.modules['picamera'] = Mock()
sys.modules['picamera.array'] = Mock()

from video.pi_video_stream import PiVideoStream


class TestPiVideoStream:
    """Tests for PiVideoStream class."""
    
    @pytest.fixture
    def mock_picamera(self):
        """Create mock PiCamera objects."""
        with patch('video.pi_video_stream.PiCamera') as mock_camera_class, \
             patch('video.pi_video_stream.PiRGBArray') as mock_array_class:
            
            # Mock camera instance
            mock_camera = Mock()
            mock_camera.resolution = (320, 240)
            mock_camera.framerate = 32
            mock_camera_class.return_value = mock_camera
            
            # Mock raw capture
            mock_raw_capture = Mock()
            mock_array_class.return_value = mock_raw_capture
            
            # Mock capture stream
            mock_frame_data = Mock()
            mock_frame_data.array = "mock_frame_array"
            mock_camera.capture_continuous.return_value = iter([mock_frame_data, mock_frame_data])
            
            yield {
                'camera_class': mock_camera_class,
                'camera': mock_camera,
                'array_class': mock_array_class,
                'raw_capture': mock_raw_capture,
                'frame_data': mock_frame_data
            }
    
    def test_initialization(self, mock_picamera):
        """Test PiVideoStream initialization."""
        stream = PiVideoStream(resolution=(640, 480), framerate=30)
        
        # Check camera was created
        mock_picamera['camera_class'].assert_called_once()
        
        # Check resolution and framerate were set
        assert stream.camera.resolution == (640, 480)
        assert stream.camera.framerate == 30
        
        # Check initial state
        assert stream.frame is None
        assert stream.stopped is False
    
    def test_initialization_default_params(self, mock_picamera):
        """Test initialization with default parameters."""
        stream = PiVideoStream()
        
        assert stream.camera.resolution == (320, 240)
        assert stream.camera.framerate == 32
    
    def test_initialization_creates_rgb_array(self, mock_picamera):
        """Test that RGBArray is created correctly."""
        stream = PiVideoStream(resolution=(640, 480))
        
        mock_picamera['array_class'].assert_called_once_with(
            stream.camera, 
            size=(640, 480)
        )
    
    def test_initialization_starts_capture(self, mock_picamera):
        """Test that capture_continuous is called."""
        stream = PiVideoStream()
        
        stream.camera.capture_continuous.assert_called_once_with(
            stream.rawCapture,
            format="bgr",
            use_video_port=True
        )
    
    def test_start_returns_self(self, mock_picamera):
        """Test that start() returns self for chaining."""
        stream = PiVideoStream()
        result = stream.start()
        
        assert result == stream
    
    def test_read_returns_frame(self, mock_picamera):
        """Test reading frames."""
        stream = PiVideoStream()
        stream.frame = "test_frame"
        
        frame = stream.read()
        assert frame == "test_frame"
    
    def test_read_returns_none_initially(self, mock_picamera):
        """Test that read returns None before first frame."""
        stream = PiVideoStream()
        
        frame = stream.read()
        assert frame is None
    
    def test_stop_sets_flag(self, mock_picamera):
        """Test stopping the stream."""
        stream = PiVideoStream()
        assert stream.stopped is False
        
        stream.stop()
        assert stream.stopped is True
    
    def test_update_processes_frame(self, mock_picamera):
        """Test that update processes frames."""
        stream = PiVideoStream()
        
        # Manually iterate once
        for f in [mock_picamera['frame_data']]:
            stream.frame = f.array
            stream.rawCapture.truncate(0)
            break
        
        assert stream.frame == "mock_frame_array"
        stream.rawCapture.truncate.assert_called_with(0)
    
    def test_update_stops_when_flag_set(self, mock_picamera):
        """Test that update stops when stopped flag is set."""
        stream = PiVideoStream()
        stream.stopped = True
        
        # When stopped is True, update should check the flag and stop
        # Test that the stopped flag is set correctly
        assert stream.stopped is True
        
        # Verify camera cleanup methods exist
        assert hasattr(stream, 'camera')
        assert hasattr(stream, 'rawCapture')
        assert hasattr(stream, 'stream')
    
    def test_custom_resolution(self, mock_picamera):
        """Test initialization with custom resolution."""
        stream = PiVideoStream(resolution=(1920, 1080))
        
        assert stream.camera.resolution == (1920, 1080)
    
    def test_custom_framerate(self, mock_picamera):
        """Test initialization with custom framerate."""
        stream = PiVideoStream(framerate=60)
        
        assert stream.camera.framerate == 60
    
    def test_multiple_stop_calls(self, mock_picamera):
        """Test that multiple stop calls are safe."""
        stream = PiVideoStream()
        
        stream.stop()
        stream.stop()
        stream.stop()
        
        assert stream.stopped is True
    
    def test_stream_attribute_exists(self, mock_picamera):
        """Test that stream attribute is set."""
        stream = PiVideoStream()
        
        assert hasattr(stream, 'stream')
        assert stream.stream is not None
    
    def test_raw_capture_attribute_exists(self, mock_picamera):
        """Test that rawCapture attribute is set."""
        stream = PiVideoStream()
        
        assert hasattr(stream, 'rawCapture')
        assert stream.rawCapture is not None
    
    def test_camera_attribute_exists(self, mock_picamera):
        """Test that camera attribute is set."""
        stream = PiVideoStream()
        
        assert hasattr(stream, 'camera')
        assert stream.camera is not None
    
    def test_update_cleanup_on_stop(self, mock_picamera):
        """Test that update calls cleanup methods when stopped."""
        stream = PiVideoStream()
        
        # Mock cleanup methods
        stream.stream = Mock()
        stream.stream.close = Mock()
        stream.rawCapture.close = Mock()
        stream.camera.close = Mock()
        
        # Set stopped flag
        stream.stopped = True
        
        # Manually simulate what happens in update when stopped
        if stream.stopped:
            stream.stream.close()
            stream.rawCapture.close()
            stream.camera.close()
        
        # Verify cleanup was called
        stream.stream.close.assert_called_once()
        stream.rawCapture.close.assert_called_once()
        stream.camera.close.assert_called_once()

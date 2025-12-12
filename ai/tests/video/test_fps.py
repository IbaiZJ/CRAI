import pytest
import time
import datetime
from video.fps import FPS


class TestFPS:
    """Tests for FPS class."""
    
    def test_initialization(self):
        """Test FPS initialization."""
        fps = FPS()
        assert fps._start is None
        assert fps._end is None
        assert fps._num_frames == 0
    
    def test_start(self):
        """Test starting the FPS counter."""
        fps = FPS()
        result = fps.start()
        
        assert fps._start is not None
        assert isinstance(fps._start, datetime.datetime)
        assert result == fps  # Should return self for chaining
    
    def test_stop(self):
        """Test stopping the FPS counter."""
        fps = FPS()
        fps.start()
        time.sleep(0.1)
        fps.stop()
        
        assert fps._end is not None
        assert isinstance(fps._end, datetime.datetime)
        assert fps._end > fps._start
    
    def test_update(self):
        """Test updating frame count."""
        fps = FPS()
        assert fps._num_frames == 0
        
        fps.update()
        assert fps._num_frames == 1
        
        fps.update()
        fps.update()
        assert fps._num_frames == 3
    
    def test_elapsed(self):
        """Test elapsed time calculation."""
        fps = FPS()
        fps.start()
        time.sleep(0.1)
        fps.stop()
        
        elapsed = fps.elapsed()
        assert elapsed >= 0.1
        assert elapsed < 0.2
    
    def test_elapsed_realtime_not_started(self):
        """Test elapsed realtime when not started."""
        fps = FPS()
        assert fps.elapsed_realtime() == 0
    
    def test_elapsed_realtime(self):
        """Test elapsed realtime calculation."""
        fps = FPS()
        fps.start()
        time.sleep(0.1)
        
        elapsed = fps.elapsed_realtime()
        assert elapsed >= 0.1
        assert elapsed < 0.2
    
    def test_fps_calculation(self):
        """Test FPS calculation."""
        fps = FPS()
        fps.start()
        
        # Simulate 10 frames over 1 second
        for _ in range(10):
            fps.update()
            time.sleep(0.01)
        
        fps.stop()
        
        calculated_fps = fps.fps()
        assert calculated_fps > 0
        assert calculated_fps < 1000  # Reasonable upper bound
    
    def test_fps_realtime_no_frames(self):
        """Test FPS realtime with no frames."""
        fps = FPS()
        fps.start()
        assert fps.fps_realtime() == 0.0
    
    def test_fps_realtime_not_started(self):
        """Test FPS realtime when not started."""
        fps = FPS()
        fps.update()
        assert fps.fps_realtime() == 0.0
    
    def test_fps_realtime_calculation(self):
        """Test FPS realtime calculation."""
        fps = FPS()
        fps.start()
        
        for _ in range(5):
            fps.update()
            time.sleep(0.01)
        
        calculated_fps = fps.fps_realtime()
        assert calculated_fps > 0
        assert calculated_fps < 1000
    
    def test_full_workflow(self):
        """Test complete FPS workflow."""
        fps = FPS()
        
        # Start timer
        fps.start()
        assert fps._start is not None
        
        # Simulate processing frames
        for _ in range(20):
            fps.update()
            time.sleep(0.005)
        
        # Check realtime metrics
        realtime_fps = fps.fps_realtime()
        assert realtime_fps > 0
        
        # Stop and get final metrics
        fps.stop()
        final_fps = fps.fps()
        assert final_fps > 0
        assert fps._num_frames == 20

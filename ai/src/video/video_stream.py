from .webcam_video_stream import WebcamVideoStream
from utils.logger import get_logger

class VideoStream:
    """ Video Stream class """
    
    def __init__(self, src: int = 0, use_pi_camera: bool = False, resolution: tuple = (320, 240), framerate: int = 32):
        self.logger = get_logger("VideoStream")
        if use_pi_camera:
            from .pi_video_stream import PiVideoStream
            self.logger.info(f"Inicializando Pi Camera con resolution={resolution}, framerate={framerate}")
            self.stream = PiVideoStream(resolution = resolution, framerate = framerate)
        else:
            self.logger.info(f"Inicializando webcam en source={src}")
            self.stream = WebcamVideoStream(src=src, resolution=resolution, framerate=framerate)
            
    def start(self):
        # start the threaded video stream
        return self.stream.start()
    
    def update(self):
        # grab the next frame from the stream
        self.stream.update()
        
    def read(self):
        # return the current frame
        return self.stream.read()
    
    def stop(self):
        # stop the thread and release any resources
        self.stream.stop()
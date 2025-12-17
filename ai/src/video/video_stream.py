from .webcam_video_stream import WebcamVideoStream

class VideoStream:
    """ Video Stream class """
    
    def __init__(self, src: int = 0, use_pi_camera: bool = False, resolution: tuple = (320, 240), framerate: int = 32):
        if use_pi_camera:
            from .pi_video_stream import PiVideoStream
            self.stream = PiVideoStream(resolution = resolution, framerate = framerate)
        else:
            self.stream = WebcamVideoStream(src=src)
            
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
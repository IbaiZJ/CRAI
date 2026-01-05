from threading import Thread
import cv2

class WebcamVideoStream:
    """ WebcamVideoStream class """
    
    def __init__(self, src:int = 0, resolution: tuple = (640, 480), framerate: int = 30):
        # initialize the video camera stream and read the first frame
		# from the stream
        self.stream: cv2.VideoCapture = cv2.VideoCapture(src)
        
        # set resolution if provided
        if resolution is not None:
            self.stream.set(cv2.CAP_PROP_FRAME_WIDTH, resolution[0])
            self.stream.set(cv2.CAP_PROP_FRAME_HEIGHT, resolution[1])
        
        # set framerate if provided
        if framerate is not None:
            self.stream.set(cv2.CAP_PROP_FPS, framerate)
        
        (self.grabbed, self.frame) = self.stream.read()
		# initialize the variable used to indicate if the thread should
		# be stopped
        self.stopped: bool = False
    
    def start(self):
		# start the thread to read frames from the video stream
        Thread(target=self.update, args=()).start()
        return self
    
    def update(self):
		# keep looping infinitely until the thread is stopped
        while True:
			# if the thread indicator variable is set, stop the thread
            if self.stopped:
                return
            
            # otherwise, read the next frame from the stream
            (self.grabbed, self.frame) = self.stream.read()
        
    def read(self):
		# return the frame most recently read
        return self.frame
    
    def stop(self):
		# indicate that the thread should be stopped
        self.stopped = True
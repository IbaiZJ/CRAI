import datetime

class FPS:
    """ FPS class """
    
    def __init__(self):
        # store the start time, end time, and total number of frames
		# that were examined between the start and end intervals
        self._start: datetime.datetime = None
        self._end: datetime.datetime = None
        self._num_frames : int = 0
    
    def start(self):
        # start the timer
        self._start = datetime.datetime.now()
        return self
    
    def stop(self):
        # stop the timer
        self._end = datetime.datetime.now()
        
    def update(self):
        # increment the total number of frames examined during the
		# start and end intervals
        self._num_frames += 1
    
    def elapsed(self):
        # return the total number of seconds between the start and
		# end interval
        return (self._end - self._start).total_seconds()
    
    def elapsed_realtime(self):
        # return the total number of seconds from start to now (real-time)
        if self._start is None:
            return 0
        return (datetime.datetime.now() - self._start).total_seconds()
    
    def fps(self):
		# compute the (approximate) frames per second
        return self._num_frames / self.elapsed()
    
    def fps_realtime(self):
        # compute the frames per second in real-time (without stopping)
        elapsed = self.elapsed_realtime()
        if elapsed == 0 or self._num_frames == 0:
            return 0.0
        return self._num_frames / elapsed
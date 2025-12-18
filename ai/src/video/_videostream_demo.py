# import the necessary packages
from video.video_stream import VideoStream
from video.fps import FPS
import datetime
import argparse
import time
import cv2
from video.video_utils import VideoUtils

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--picamera", type=int, default=-1,
	help="whether or not the Raspberry Pi camera should be used")
ap.add_argument("-c", "--camera", type=int, default=0,
	help="camera source index (0=default, 1=USB external, 2=second USB, etc.)")
args = vars(ap.parse_args())

vs = VideoStream(src=args["camera"], use_pi_camera=args["picamera"] > 0).start()
time.sleep(2.0)

# start the FPS counter
fps = FPS().start()

# loop over the frames from the video stream
while True:
	# grab the frame from the threaded video stream and resize it
	# to have a maximum width of 400 pixels
	frame = vs.read()
	frame = VideoUtils.resize(frame, width=400)
	
	# update the FPS counter
	fps.update()
	
	# draw the timestamp on the frame
	timestamp = datetime.datetime.now()
	ts = timestamp.strftime("%A %d %B %Y %I:%M:%S%p")
	cv2.putText(frame, ts, (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX,
		0.35, (0, 0, 255), 1)
	
	# draw the FPS on the frame (calculate FPS in real-time)
	fps_text = f"FPS: {fps.fps_realtime():.2f}"
	cv2.putText(frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
		0.7, (0, 255, 0), 2)
	
	# show the frame
	cv2.imshow("Frame", frame)
	key = cv2.waitKey(1) & 0xFF
	
	# if the `q` key was pressed, break from the loop
	if key == ord("q"):
		break

# stop the timer and display FPS information
fps.stop()
print(f"[INFO] elapsed time: {fps.elapsed():.2f}")
print(f"[INFO] approx. FPS: {fps.fps():.2f}")

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
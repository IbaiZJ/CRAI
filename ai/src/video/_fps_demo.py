"""
This script benchmarks webcam performance by comparing standard OpenCV frame
capture with a threaded video stream. It measures FPS (frames per second),
optionally displays frames, and reports the elapsed time and FPS for both
approaches. The results demonstrate how threading can massively increase
capture speed by reading frames asynchronously.

Results from the test:
- Standard capture FPS: 26.01
- Threaded capture FPS: 1652.65

Improvement calculation:
    improvement = ((threaded_fps / normal_fps) - 1) * 100
    improvement = ((1652.65 / 26.01) - 1) * 100
    improvement ≈ 6252%

This means the threaded video stream provides **about a 6250% increase in FPS**.
"""


from __future__ import print_function
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from webcam_video_stream import WebcamVideoStream
from fps import FPS
import argparse
import imutils
import cv2

ap = argparse.ArgumentParser()
ap.add_argument("-n", "--num-frames", type=int, default=100,
	help="# of frames to loop over for FPS test")
ap.add_argument("-d", "--display", type=int, default=-1,
	help="Whether or not frames should be displayed")
args = vars(ap.parse_args())


print("[INFO] sampling frames from webcam...")
stream = cv2.VideoCapture(0)
fps = FPS().start()
while fps._num_frames < args["num_frames"]:
	(grabbed, frame) = stream.read()
	frame = imutils.resize(frame, width=400)
	if args["display"] > 0:
		cv2.imshow("Frame", frame)
		key = cv2.waitKey(1) & 0xFF
	fps.update()
fps.stop()
print("[INFO] elapsed time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
stream.release()


print("[INFO] sampling THREADED frames from webcam...")
vs = WebcamVideoStream(src=0).start()
fps = FPS().start()
while fps._num_frames < args["num_frames"]:
	frame = vs.read()
	frame = imutils.resize(frame, width=400)
	if args["display"] > 0:
		cv2.imshow("Frame", frame)
		key = cv2.waitKey(1) & 0xFF
	fps.update()
fps.stop()
print("[INFO] elapsed time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
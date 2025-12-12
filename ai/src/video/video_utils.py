import cv2
import numpy as np
from urllib.request import urlopen

class VideoUtils:
    """ Video and image processing utilities class """
    
    @staticmethod
    def resize(image: np.ndarray, width: int = None, height: int = None, inter: int = cv2.INTER_AREA) -> np.ndarray:
        """
        Resize an image maintaining aspect ratio.
        
        Args:
            image: Input image (numpy array)
            width: Desired width (if None, calculated from height)
            height: Desired height (if None, calculated from width)
            inter: Interpolation method (default: cv2.INTER_AREA)
        
        Returns:
            Resized image
        """
        # Initialize dimensions
        (h, w) = image.shape[:2]
        
        # If both width and height are None, return original
        if width is None and height is None:
            return image
        
        # Calculate the ratio and new dimensions
        if width is None:
            # Calculate based on height
            r = height / float(h)
            dim = (int(w * r), height)
        else:
            # Calculate based on width
            r = width / float(w)
            dim = (width, int(h * r))
        
        # Resize the image
        resized = cv2.resize(image, dim, interpolation=inter)
        
        return resized

    @staticmethod
    def rotate(image: np.ndarray, angle: float, center: tuple = None, scale: float = 1.0) -> np.ndarray:
        """
        Rotate an image by a given angle.
        
        Args:
            image: Input image
            angle: Angle in degrees (positive for counter-clockwise)
            center: Center of rotation (if None, uses image center)
            scale: Scale factor
        
        Returns:
            Rotated image
        """
        (h, w) = image.shape[:2]
        
        if center is None:
            center = (w // 2, h // 2)
        
        # Perform the rotation
        M = cv2.getRotationMatrix2D(center, angle, scale)
        rotated = cv2.warpAffine(image, M, (w, h))
        
        return rotated

    @staticmethod
    def translate(image: np.ndarray, x: float, y: float) -> np.ndarray:
        """
        Translate (shift) an image.
        
        Args:
            image: Input image
            x: Pixels to shift in x direction
            y: Pixels to shift in y direction
        
        Returns:
            Translated image
        """
        M = np.float32([[1, 0, x], [0, 1, y]])
        shifted = cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))
        return shifted

    @staticmethod
    def rotate_bound(image: np.ndarray, angle: float) -> np.ndarray:
        """
        Rotate an image without cropping the corners.
        
        Args:
            image: Input image
            angle: Angle in degrees
        
        Returns:
            Rotated image with expanded canvas
        """
        (h, w) = image.shape[:2]
        (c_x, c_y) = (w / 2, h / 2)
        
        M = cv2.getRotationMatrix2D((c_x, c_y), -angle, 1.0)
        cos = np.abs(M[0, 0])
        sin = np.abs(M[0, 1])
        
        n_w = int((h * sin) + (w * cos))
        n_h = int((h * cos) + (w * sin))
        
        M[0, 2] += (n_w / 2) - c_x
        M[1, 2] += (n_h / 2) - c_y
        
        return cv2.warpAffine(image, M, (n_w, n_h))

    @staticmethod
    def crop(image: np.ndarray, x: int, y: int, w: int, h: int) -> np.ndarray:
        """
        Crop a region from an image.
        
        Args:
            image: Input image
            x: Starting x coordinate
            y: Starting y coordinate
            w: Width of crop
            h: Height of crop
        
        Returns:
            Cropped image
        """
        return image[y:y+h, x:x+w]

    @staticmethod
    def skeletonize(image: np.ndarray, size: tuple, structuring: int = cv2.MORPH_RECT) -> np.ndarray:
        """
        Skeletonize an image using morphological operations.
        
        Args:
            image: Input binary image
            size: Size of structuring element
            structuring: Structuring element type
        
        Returns:
            Skeletonized image
        """
        area = image.shape[0] * image.shape[1]
        skeleton = np.zeros(image.shape, dtype="uint8")
        elem = cv2.getStructuringElement(structuring, size)
        
        while True:
            eroded = cv2.erode(image, elem)
            temp = cv2.dilate(eroded, elem)
            temp = cv2.subtract(image, temp)
            skeleton = cv2.bitwise_or(skeleton, temp)
            image = eroded.copy()
            
            if area == area - cv2.countNonZero(image):
                break
        
        return skeleton

    @staticmethod
    def opencv2matplotlib(image: np.ndarray) -> np.ndarray:
        """
        Convert OpenCV BGR image to Matplotlib RGB format.
        
        Args:
            image: Input BGR image
        
        Returns:
            RGB image
        """
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    @staticmethod
    def url_to_image(url: str, read_flag: int = cv2.IMREAD_COLOR) -> np.ndarray:
        """
        Download an image from URL and convert to OpenCV format.
        
        Args:
            url: Image URL
            read_flag: OpenCV read flag
        
        Returns:
            Image as numpy array
        """
        resp = urlopen(url)
        image = np.asarray(bytearray(resp.read()), dtype="uint8")
        image = cv2.imdecode(image, read_flag)
        return image

    @staticmethod
    def auto_canny(image: np.ndarray, sigma: float = 0.33) -> np.ndarray:
        """
        Apply automatic Canny edge detection with automatic thresholding.
        
        Args:
            image: Input grayscale image
            sigma: Variation around median for threshold calculation
        
        Returns:
            Edge-detected image
        """
        v = np.median(image)
        lower = int(max(0, (1.0 - sigma) * v))
        upper = int(min(255, (1.0 + sigma) * v))
        edged = cv2.Canny(image, lower, upper)
        return edged

    @staticmethod
    def grab_contours(cnts: tuple) -> np.ndarray:
        """
        Handle different OpenCV versions' findContours return format.
        
        Args:
            cnts: Output from cv2.findContours
        
        Returns:
            Contours array
        """
        if len(cnts) == 2:
            cnts = cnts[0]
        elif len(cnts) == 3:
            cnts = cnts[1]
        else:
            raise ValueError(("Contours tuple must have length 2 or 3, "
                "otherwise OpenCV changed their cv2.findContours return "
                "signature yet again. Refer to OpenCV's documentation "
                "in that case"))
        return cnts

    @staticmethod
    def adjust_brightness_contrast(image: np.ndarray, brightness: float = 0., contrast: float = 0.) -> np.ndarray:
        """
        Adjust the brightness and/or contrast of an image.
        
        Args:
            image: Input image
            brightness: Brightness adjustment (0 = no change)
            contrast: Contrast adjustment (0 = no change)
        
        Returns:
            Adjusted image
        """
        return cv2.addWeighted(image, 1 + float(contrast) / 100., image, 0, float(brightness))

    @staticmethod
    def build_montages(image_list: list, image_shape: tuple, montage_shape: tuple) -> list:
        """
        Build a montage from a list of images.
        
        Args:
            image_list: List of images
            image_shape: Size each image will be resized to (width, height)
            montage_shape: Shape of montage (rows, cols)
        
        Returns:
            List of montage images
        """
        if len(image_shape) != 2:
            raise ValueError('image shape must be list or tuple of length 2 (rows, cols)')
        if len(montage_shape) != 2:
            raise ValueError('montage shape must be list or tuple of length 2 (rows, cols)')
        
        image_montages = []
        montage_image = np.zeros(shape=(image_shape[1] * montage_shape[1], 
                                       image_shape[0] * montage_shape[0], 3),
                                dtype=np.uint8)
        cursor_pos = [0, 0]
        start_new_img = False
        
        for img in image_list:
            if type(img).__module__ != np.__name__:
                raise TypeError('input of type {} is not a valid numpy array'.format(type(img)))
            
            start_new_img = False
            img = cv2.resize(img, image_shape)
            montage_image[cursor_pos[1]:cursor_pos[1] + image_shape[1], 
                         cursor_pos[0]:cursor_pos[0] + image_shape[0]] = img
            cursor_pos[0] += image_shape[0]
            
            if cursor_pos[0] >= montage_shape[0] * image_shape[0]:
                cursor_pos[1] += image_shape[1]
                cursor_pos[0] = 0
                if cursor_pos[1] >= montage_shape[1] * image_shape[1]:
                    cursor_pos = [0, 0]
                    image_montages.append(montage_image)
                    montage_image = np.zeros(shape=(image_shape[1] * montage_shape[1],
                                                   image_shape[0] * montage_shape[0], 3),
                                            dtype=np.uint8)
                    start_new_img = True
        
        if start_new_img is False:
            image_montages.append(montage_image)
        
        return image_montages

    @staticmethod
    def get_opencv_version() -> str:
        """Get the current OpenCV version."""
        return cv2.__version__

    @staticmethod
    def get_opencv_major_version() -> int:
        """Get the major version number of OpenCV."""
        return int(cv2.__version__.split(".")[0])

    @staticmethod
    def is_cv2(or_better: bool = False) -> bool:
        """Check if using OpenCV 2."""
        major = VideoUtils.get_opencv_major_version()
        if or_better:
            return major >= 2
        return major == 2

    @staticmethod
    def is_cv3(or_better: bool = False) -> bool:
        """Check if using OpenCV 3."""
        major = VideoUtils.get_opencv_major_version()
        if or_better:
            return major >= 3
        return major == 3

    @staticmethod
    def is_cv4(or_better: bool = False) -> bool:
        """Check if using OpenCV 4."""
        major = VideoUtils.get_opencv_major_version()
        if or_better:
            return major >= 4
        return major == 4

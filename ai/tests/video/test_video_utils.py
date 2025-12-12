import pytest
import numpy as np
import cv2
from unittest.mock import patch, Mock
from io import BytesIO
from video.video_utils import VideoUtils


class TestVideoUtils:
    """Tests for VideoUtils class."""
    
    @pytest.fixture
    def sample_image(self):
        """Create a sample test image."""
        return np.ones((200, 300, 3), dtype=np.uint8) * 128
    
    @pytest.fixture
    def sample_gray_image(self):
        """Create a sample grayscale image."""
        return np.ones((200, 300), dtype=np.uint8) * 128
    
    @pytest.fixture
    def sample_binary_image(self):
        """Create a sample binary image."""
        img = np.zeros((100, 100), dtype=np.uint8)
        cv2.rectangle(img, (25, 25), (75, 75), 255, -1)
        return img
    
    # Resize tests
    def test_resize_by_width(self, sample_image):
        """Test resizing by width."""
        resized = VideoUtils.resize(sample_image, width=150)
        assert resized.shape[1] == 150
        assert resized.shape[0] == 100  # Maintains aspect ratio
    
    def test_resize_by_height(self, sample_image):
        """Test resizing by height."""
        resized = VideoUtils.resize(sample_image, height=100)
        assert resized.shape[0] == 100
        assert resized.shape[1] == 150  # Maintains aspect ratio
    
    def test_resize_no_dimensions(self, sample_image):
        """Test resize with no dimensions returns original."""
        resized = VideoUtils.resize(sample_image)
        assert np.array_equal(resized, sample_image)
    
    def test_resize_both_dimensions(self, sample_image):
        """Test resize with both width and height (width takes precedence)."""
        resized = VideoUtils.resize(sample_image, width=100, height=100)
        assert resized.shape[1] == 100
        # Height calculated from aspect ratio
        assert resized.shape[0] == int(200 * (100 / 300))
    
    def test_resize_interpolation(self, sample_image):
        """Test different interpolation methods."""
        resized_area = VideoUtils.resize(sample_image, width=150, inter=cv2.INTER_AREA)
        resized_linear = VideoUtils.resize(sample_image, width=150, inter=cv2.INTER_LINEAR)
        
        assert resized_area.shape == resized_linear.shape
        assert resized_area.shape[1] == 150
    
    # Rotate tests
    def test_rotate_basic(self, sample_image):
        """Test basic rotation."""
        rotated = VideoUtils.rotate(sample_image, angle=45)
        assert rotated.shape == sample_image.shape
    
    def test_rotate_90_degrees(self, sample_image):
        """Test 90-degree rotation."""
        rotated = VideoUtils.rotate(sample_image, angle=90)
        assert rotated.shape == sample_image.shape
    
    def test_rotate_with_custom_center(self, sample_image):
        """Test rotation with custom center."""
        rotated = VideoUtils.rotate(sample_image, angle=30, center=(50, 50))
        assert rotated.shape == sample_image.shape
    
    def test_rotate_with_scale(self, sample_image):
        """Test rotation with scaling."""
        rotated = VideoUtils.rotate(sample_image, angle=45, scale=1.5)
        assert rotated.shape == sample_image.shape
    
    # Translate tests
    def test_translate_positive(self, sample_image):
        """Test translation with positive values."""
        translated = VideoUtils.translate(sample_image, x=10, y=20)
        assert translated.shape == sample_image.shape
    
    def test_translate_negative(self, sample_image):
        """Test translation with negative values."""
        translated = VideoUtils.translate(sample_image, x=-10, y=-20)
        assert translated.shape == sample_image.shape
    
    def test_translate_zero(self, sample_image):
        """Test translation with zero offset."""
        translated = VideoUtils.translate(sample_image, x=0, y=0)
        assert translated.shape == sample_image.shape
    
    # Rotate bound tests
    def test_rotate_bound(self, sample_image):
        """Test rotation without cropping."""
        rotated = VideoUtils.rotate_bound(sample_image, angle=45)
        # Result should be larger than original
        assert rotated.shape[0] >= sample_image.shape[0]
        assert rotated.shape[1] >= sample_image.shape[1]
    
    def test_rotate_bound_90_degrees(self, sample_image):
        """Test 90-degree rotation without cropping."""
        rotated = VideoUtils.rotate_bound(sample_image, angle=90)
        # At 90 degrees, dimensions should swap
        assert rotated.shape[0] > sample_image.shape[0]
    
    def test_rotate_bound_zero(self, sample_image):
        """Test rotation by zero degrees."""
        rotated = VideoUtils.rotate_bound(sample_image, angle=0)
        assert rotated.shape[:2] == sample_image.shape[:2]
    
    # Crop tests
    def test_crop_basic(self, sample_image):
        """Test basic cropping."""
        cropped = VideoUtils.crop(sample_image, x=10, y=10, w=50, h=50)
        assert cropped.shape[0] == 50
        assert cropped.shape[1] == 50
    
    def test_crop_full_image(self, sample_image):
        """Test cropping entire image."""
        h, w = sample_image.shape[:2]
        cropped = VideoUtils.crop(sample_image, x=0, y=0, w=w, h=h)
        assert np.array_equal(cropped, sample_image)
    
    def test_crop_corner(self, sample_image):
        """Test cropping from corner."""
        cropped = VideoUtils.crop(sample_image, x=0, y=0, w=10, h=10)
        assert cropped.shape == (10, 10, 3)
    
    # Skeletonize tests
    def test_skeletonize_basic(self, sample_binary_image):
        """Test skeletonization."""
        skeleton = VideoUtils.skeletonize(sample_binary_image, size=(3, 3))
        assert skeleton.shape == sample_binary_image.shape
        assert skeleton.dtype == np.uint8
    
    def test_skeletonize_different_sizes(self, sample_binary_image):
        """Test skeletonization with different kernel sizes."""
        skeleton1 = VideoUtils.skeletonize(sample_binary_image, size=(3, 3))
        skeleton2 = VideoUtils.skeletonize(sample_binary_image, size=(5, 5))
        
        assert skeleton1.shape == skeleton2.shape
    
    def test_skeletonize_different_structuring(self, sample_binary_image):
        """Test skeletonization with different structuring elements."""
        skeleton_rect = VideoUtils.skeletonize(sample_binary_image, size=(3, 3), 
                                               structuring=cv2.MORPH_RECT)
        skeleton_ellipse = VideoUtils.skeletonize(sample_binary_image, size=(3, 3),
                                                  structuring=cv2.MORPH_ELLIPSE)
        
        assert skeleton_rect.shape == skeleton_ellipse.shape
    
    # Color conversion tests
    def test_opencv2matplotlib(self, sample_image):
        """Test BGR to RGB conversion."""
        rgb = VideoUtils.opencv2matplotlib(sample_image)
        assert rgb.shape == sample_image.shape
        # Values should be swapped
        assert not np.array_equal(rgb, sample_image) or np.all(sample_image[:,:,0] == sample_image[:,:,2])
    
    def test_opencv2matplotlib_preserves_shape(self, sample_image):
        """Test that conversion preserves image shape."""
        rgb = VideoUtils.opencv2matplotlib(sample_image)
        assert rgb.shape == sample_image.shape
        assert rgb.dtype == sample_image.dtype
    
    # URL to image tests
    @patch('video.video_utils.urlopen')
    def test_url_to_image(self, mock_urlopen):
        """Test loading image from URL."""
        # Create a mock response with fake image data
        fake_image_data = cv2.imencode('.jpg', np.ones((50, 50, 3), dtype=np.uint8))[1].tobytes()
        mock_response = Mock()
        mock_response.read.return_value = fake_image_data
        mock_urlopen.return_value = mock_response
        
        image = VideoUtils.url_to_image('http://example.com/image.jpg')
        assert image is not None
        assert isinstance(image, np.ndarray)
    
    @patch('video.video_utils.urlopen')
    def test_url_to_image_grayscale(self, mock_urlopen):
        """Test loading grayscale image from URL."""
        fake_image_data = cv2.imencode('.jpg', np.ones((50, 50), dtype=np.uint8))[1].tobytes()
        mock_response = Mock()
        mock_response.read.return_value = fake_image_data
        mock_urlopen.return_value = mock_response
        
        image = VideoUtils.url_to_image('http://example.com/image.jpg', read_flag=cv2.IMREAD_GRAYSCALE)
        assert image is not None
    
    # Auto Canny tests
    def test_auto_canny_basic(self, sample_gray_image):
        """Test automatic Canny edge detection."""
        edges = VideoUtils.auto_canny(sample_gray_image)
        assert edges.shape == sample_gray_image.shape
        assert edges.dtype == np.uint8
    
    def test_auto_canny_with_sigma(self, sample_gray_image):
        """Test auto Canny with different sigma values."""
        edges1 = VideoUtils.auto_canny(sample_gray_image, sigma=0.33)
        edges2 = VideoUtils.auto_canny(sample_gray_image, sigma=0.5)
        
        assert edges1.shape == edges2.shape
    
    def test_auto_canny_on_varied_image(self):
        """Test auto Canny on image with varied intensities."""
        # Create image with gradient
        image = np.linspace(0, 255, 200*300, dtype=np.uint8).reshape(200, 300)
        edges = VideoUtils.auto_canny(image)
        
        assert edges.shape == image.shape
    
    # Grab contours tests
    def test_grab_contours_length_2(self):
        """Test grabbing contours from tuple of length 2."""
        contours = [np.array([[0, 0], [10, 10]])]
        result = VideoUtils.grab_contours((contours, None))
        assert result == contours
    
    def test_grab_contours_length_3(self):
        """Test grabbing contours from tuple of length 3."""
        contours = [np.array([[0, 0], [10, 10]])]
        result = VideoUtils.grab_contours((None, contours, None))
        assert result == contours
    
    def test_grab_contours_invalid_length(self):
        """Test grabbing contours with invalid tuple length."""
        with pytest.raises(Exception, match="Contours tuple must have length 2 or 3"):
            VideoUtils.grab_contours((1, 2, 3, 4))
    
    def test_grab_contours_length_1(self):
        """Test grabbing contours with length 1."""
        with pytest.raises(Exception):
            VideoUtils.grab_contours(([],))
    
    # Brightness/Contrast tests
    def test_adjust_brightness_contrast_no_change(self, sample_image):
        """Test no adjustment."""
        adjusted = VideoUtils.adjust_brightness_contrast(sample_image, brightness=0, contrast=0)
        # Should be very similar (may have minor floating point differences)
        assert adjusted.shape == sample_image.shape
    
    def test_adjust_brightness_increase(self, sample_image):
        """Test increasing brightness."""
        adjusted = VideoUtils.adjust_brightness_contrast(sample_image, brightness=50, contrast=0)
        assert adjusted.shape == sample_image.shape
    
    def test_adjust_brightness_decrease(self, sample_image):
        """Test decreasing brightness."""
        adjusted = VideoUtils.adjust_brightness_contrast(sample_image, brightness=-50, contrast=0)
        assert adjusted.shape == sample_image.shape
    
    def test_adjust_contrast_increase(self, sample_image):
        """Test increasing contrast."""
        adjusted = VideoUtils.adjust_brightness_contrast(sample_image, brightness=0, contrast=50)
        assert adjusted.shape == sample_image.shape
    
    def test_adjust_both(self, sample_image):
        """Test adjusting both brightness and contrast."""
        adjusted = VideoUtils.adjust_brightness_contrast(sample_image, brightness=30, contrast=20)
        assert adjusted.shape == sample_image.shape
    
    # Build montages tests
    def test_build_montages_basic(self, sample_image):
        """Test building basic montage."""
        images = [sample_image.copy() for _ in range(6)]
        montages = VideoUtils.build_montages(images, image_shape=(100, 100), montage_shape=(3, 2))
        
        assert len(montages) >= 1
        assert montages[0].shape == (200, 300, 3)  # 2 rows x 3 cols
    
    def test_build_montages_single_image(self, sample_image):
        """Test montage with single image."""
        montages = VideoUtils.build_montages([sample_image], image_shape=(50, 50), montage_shape=(1, 1))
        
        assert len(montages) == 1
        assert montages[0].shape == (50, 50, 3)
    
    def test_build_montages_multiple_pages(self, sample_image):
        """Test montage with multiple pages."""
        images = [sample_image.copy() for _ in range(12)]
        montages = VideoUtils.build_montages(images, image_shape=(50, 50), montage_shape=(2, 2))
        
        # Should create 3 montages (4 images each)
        assert len(montages) == 3
    
    def test_build_montages_invalid_image_shape(self, sample_image):
        """Test montage with invalid image shape."""
        with pytest.raises(Exception, match="image shape must be list or tuple of length 2"):
            VideoUtils.build_montages([sample_image], image_shape=(50,), montage_shape=(2, 2))
    
    def test_build_montages_invalid_montage_shape(self, sample_image):
        """Test montage with invalid montage shape."""
        with pytest.raises(Exception, match="montage shape must be list or tuple of length 2"):
            VideoUtils.build_montages([sample_image], image_shape=(50, 50), montage_shape=(2,))
    
    def test_build_montages_non_numpy_input(self):
        """Test montage with non-numpy array input."""
        with pytest.raises(Exception, match="not a valid numpy array"):
            VideoUtils.build_montages([[1, 2, 3]], image_shape=(50, 50), montage_shape=(2, 2))
    
    def test_build_montages_partial_fill(self, sample_image):
        """Test montage with partial fill."""
        images = [sample_image.copy() for _ in range(5)]
        montages = VideoUtils.build_montages(images, image_shape=(50, 50), montage_shape=(3, 2))
        
        # Should create 1 montage with 5 images and remaining slots empty
        assert len(montages) == 1
    
    # OpenCV version tests
    def test_get_opencv_version(self):
        """Test getting OpenCV version."""
        version = VideoUtils.get_opencv_version()
        assert isinstance(version, str)
        assert len(version.split('.')) >= 2
    
    def test_get_opencv_major_version(self):
        """Test getting major version number."""
        major = VideoUtils.get_opencv_major_version()
        assert isinstance(major, int)
        assert major >= 2
    
    def test_is_cv2(self):
        """Test checking for OpenCV 2."""
        result = VideoUtils.is_cv2()
        assert isinstance(result, bool)
    
    def test_is_cv2_or_better(self):
        """Test checking for OpenCV 2 or better."""
        result = VideoUtils.is_cv2(or_better=True)
        assert result is True  # Should always be True for modern OpenCV
    
    def test_is_cv3(self):
        """Test checking for OpenCV 3."""
        result = VideoUtils.is_cv3()
        assert isinstance(result, bool)
    
    def test_is_cv3_or_better(self):
        """Test checking for OpenCV 3 or better."""
        result = VideoUtils.is_cv3(or_better=True)
        assert isinstance(result, bool)
    
    def test_is_cv4(self):
        """Test checking for OpenCV 4."""
        result = VideoUtils.is_cv4()
        assert isinstance(result, bool)
    
    def test_is_cv4_or_better(self):
        """Test checking for OpenCV 4 or better."""
        result = VideoUtils.is_cv4(or_better=True)
        assert isinstance(result, bool)
    
    def test_version_consistency(self):
        """Test that version checks are consistent."""
        major = VideoUtils.get_opencv_major_version()
        
        if major == 2:
            assert VideoUtils.is_cv2() is True
            assert VideoUtils.is_cv3() is False
            assert VideoUtils.is_cv4() is False
        elif major == 3:
            assert VideoUtils.is_cv2() is False
            assert VideoUtils.is_cv3() is True
            assert VideoUtils.is_cv4() is False
        elif major >= 4:
            assert VideoUtils.is_cv2() is False
            assert VideoUtils.is_cv3() is False
            assert VideoUtils.is_cv4() is True

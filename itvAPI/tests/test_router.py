"""
Tests for routers/router.py - API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


@pytest.fixture
def mock_plate_service():
    """Mock the plateService"""
    with patch('routers.router.plateService') as mock:
        yield mock


@pytest.fixture
def client(mock_plate_service):
    """Create a test client"""
    with patch('main.unzip_itv_date_file'):
        with patch('service.service.PlatesItvService.__init__', return_value=None):
            from main import app
            return TestClient(app)


class TestRouter:
    """Test suite for router endpoints"""
    
    def test_detect_plate_success(self, client, mock_plate_service):
        """Test successful plate detection"""
        # Mock successful response - ITV vigente (0)
        mock_plate_service.get_itv_date_by_plate.return_value = 0
        
        response = client.get("/api?carPlate=1234BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "1234BBB"
        assert data["itv_date"] == 0
        mock_plate_service.get_itv_date_by_plate.assert_called_once_with("1234BBB")
    
    def test_detect_plate_not_found(self, client, mock_plate_service):
        """Test plate not found in database"""
        mock_plate_service.get_itv_date_by_plate.return_value = "none"
        
        response = client.get("/api?carPlate=9999ZZZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "9999ZZZ"
        assert data["itv_date"] == "none"
    
    def test_detect_plate_invalid_format(self, client, mock_plate_service):
        """Test invalid plate format"""
        mock_plate_service.get_itv_date_by_plate.return_value = {"error": "Invalid plate format"}
        
        response = client.get("/api?carPlate=INVALID")
        
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["itv_date"]
    
    def test_detect_plate_missing_parameter(self, client):
        """Test missing carPlate parameter"""
        response = client.get("/api")
        
        assert response.status_code == 422  # Validation error
    
    def test_detect_plate_empty_string(self, client, mock_plate_service):
        """Test empty plate string"""
        mock_plate_service.get_itv_date_by_plate.return_value = {"error": "Invalid plate format"}
        
        response = client.get("/api?carPlate=")
        
        assert response.status_code == 422 or response.status_code == 200
    
    def test_detect_plate_with_spaces(self, client, mock_plate_service):
        """Test plate with spaces"""
        mock_plate_service.get_itv_date_by_plate.return_value = 0
        
        response = client.get("/api?carPlate=1234 BBB")
        
        assert response.status_code == 200
        mock_plate_service.get_itv_date_by_plate.assert_called_once()
    
    def test_detect_plate_lowercase(self, client, mock_plate_service):
        """Test plate with lowercase letters"""
        mock_plate_service.get_itv_date_by_plate.return_value = 0
        
        response = client.get("/api?carPlate=1234bbb")
        
        assert response.status_code == 200
        mock_plate_service.get_itv_date_by_plate.assert_called_once()
    
    def test_detect_plate_expired(self, client, mock_plate_service):
        """Test plate with expired ITV"""
        mock_plate_service.get_itv_date_by_plate.return_value = 1
        
        response = client.get("/api?carPlate=1234BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["itv_date"] == 1
    
    def test_detect_plate_warning(self, client, mock_plate_service):
        """Test plate with ITV warning (expires soon)"""
        mock_plate_service.get_itv_date_by_plate.return_value = "warning"
        
        response = client.get("/api?carPlate=5678XYZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["itv_date"] == "warning"

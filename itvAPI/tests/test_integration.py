"""
Integration tests for ebAPI - End-to-end testing
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import pandas as pd


@pytest.fixture
def mock_csv_data():
    """Mock CSV data for integration tests"""
    return pd.DataFrame({
        'plate': ['1234BBB', '5678XYZ', '0000BBB', '1111CCC', '2222DDD'],
        'badge': ['TB', 'MC', 'T0', 'TE', 'TC']
    })


@pytest.fixture
def integration_client(mock_csv_data):
    """Create a test client with full integration"""
    with patch('util.util.os.path.exists', return_value=True):
        with patch('builtins.print'):
            # Mock read_csv to return DataFrame correctly
            with patch('pandas.read_csv', return_value=mock_csv_data):
                # Need to reload service to apply mock
                import importlib
                import service.service
                importlib.reload(service.service)
                
                from main import app
                return TestClient(app)


class TestIntegration:
    """Integration tests for full API workflow"""
    
    def test_full_workflow_valid_plate(self, integration_client):
        """Test complete workflow with valid plate"""
        response = integration_client.get("/api?carPlate=1234BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "1234BBB"
        assert "badge" in data
        assert isinstance(data["badge"], dict)
        assert data["badge"]["vehicleType"] == "turism"
        assert data["badge"]["badge"] == "B"
    
    def test_full_workflow_motorbike(self, integration_client):
        """Test complete workflow with motorbike"""
        response = integration_client.get("/api?carPlate=5678XYZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["badge"]["vehicleType"] == "motorbike"
        assert data["badge"]["badge"] == "C"
    
    def test_full_workflow_eco_badge(self, integration_client):
        """Test complete workflow with ECO badge"""
        response = integration_client.get("/api?carPlate=1111CCC")
        
        assert response.status_code == 200
        data = response.json()
        assert data["badge"]["badge"] == "ECO"
    
    def test_full_workflow_zero_emissions(self, integration_client):
        """Test complete workflow with 0 emissions badge"""
        response = integration_client.get("/api?carPlate=0000BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["badge"]["badge"] == "0"
    
    def test_full_workflow_case_insensitive(self, integration_client):
        """Test complete workflow with lowercase input"""
        response = integration_client.get("/api?carPlate=1234bbb")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "1234bbb"
        assert data["badge"]["vehicleType"] == "turism"
    
    def test_full_workflow_with_spaces(self, integration_client):
        """Test complete workflow with spaces"""
        response = integration_client.get("/api?carPlate=1234 BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert "badge" in data
    
    def test_full_workflow_plate_not_found(self, integration_client):
        """Test complete workflow when plate not in database"""
        response = integration_client.get("/api?carPlate=9999ZZZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "9999ZZZ"
        assert data["badge"] == "none"
    
    def test_full_workflow_invalid_format(self, integration_client):
        """Test complete workflow with invalid plate format"""
        response = integration_client.get("/api?carPlate=INVALID")
        
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["badge"]
    
    def test_multiple_requests(self, integration_client):
        """Test multiple sequential requests"""
        plates = ["1234BBB", "5678XYZ", "0000BBB"]
        
        for plate in plates:
            response = integration_client.get(f"/api?carPlate={plate}")
            assert response.status_code == 200
            data = response.json()
            assert data["carPlate"] == plate
            assert "badge" in data
    
    def test_api_prefix_configured(self, integration_client):
        """Test that API prefix is correctly configured"""
        response = integration_client.get("/api?carPlate=1234BBB")
        assert response.status_code == 200
    
    def test_response_structure(self, integration_client):
        """Test response has correct structure"""
        response = integration_client.get("/api?carPlate=1234BBB")
        data = response.json()
        
        # Check top-level keys
        assert "carPlate" in data
        assert "badge" in data
        
        # Check badge structure
        if isinstance(data["badge"], dict) and "error" not in data["badge"]:
            assert "vehicleType" in data["badge"]
            assert "badge" in data["badge"]


class TestAPIDocumentation:
    """Test API documentation endpoints"""
    
    def test_openapi_schema_exists(self, integration_client):
        """Test that OpenAPI schema is available"""
        response = integration_client.get("/openapi.json")
        assert response.status_code == 200
    
    def test_app_metadata(self, integration_client):
        """Test app has correct metadata"""
        from main import app
        assert app.title == "Environmental Badge API"
        assert app.version == "1.0.0"


class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_very_long_plate_string(self, integration_client):
        """Test with very long input"""
        response = integration_client.get("/api?carPlate=" + "A" * 100)
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["badge"] or data["badge"] == "none"
    
    def test_special_characters(self, integration_client):
        """Test with special characters"""
        response = integration_client.get("/api?carPlate=1234@#$")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["badge"] or data["badge"] == "none"
    
    def test_unicode_characters(self, integration_client):
        """Test with unicode characters"""
        response = integration_client.get("/api?carPlate=1234ÁÉÍ")
        assert response.status_code == 200
    
    def test_numeric_only(self, integration_client):
        """Test with only numbers"""
        response = integration_client.get("/api?carPlate=1234567")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["badge"] or data["badge"] == "none"

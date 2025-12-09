"""
Integration tests for itvAPI - End-to-end testing
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import pandas as pd
from datetime import date, timedelta


@pytest.fixture
def mock_csv_data():
    """Mock CSV data for integration tests"""
    today = date.today()
    return pd.DataFrame({
        'plate': [
            '1234BBB',  # vigente (60 days ahead)
            '5678XYZ',  # warning (15 days ahead)
            '0000BBB',  # caducado (100 days ago)
            '1111CCC',  # vigente
            '2222DDD'   # warning
        ],
        'date_itv': [
            (today + timedelta(days=60)).isoformat(),
            (today + timedelta(days=15)).isoformat(),
            (today - timedelta(days=100)).isoformat(),
            (today + timedelta(days=90)).isoformat(),
            (today + timedelta(days=20)).isoformat(),
        ]
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
        """Test complete workflow with valid vigente plate"""
        response = integration_client.get("/api?carPlate=1234BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "1234BBB"
        assert "itv_date" in data
        assert data["itv_date"] == 0  # vigente
    
    def test_full_workflow_expired_plate(self, integration_client):
        """Test complete workflow with expired ITV"""
        response = integration_client.get("/api?carPlate=0000BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "0000BBB"
        assert data["itv_date"] == 1  # caducado
    
    def test_full_workflow_warning_plate(self, integration_client):
        """Test complete workflow with warning (expires soon)"""
        response = integration_client.get("/api?carPlate=5678XYZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["itv_date"] == "warning"
    
    def test_full_workflow_case_insensitive(self, integration_client):
        """Test complete workflow with lowercase input"""
        response = integration_client.get("/api?carPlate=1234bbb")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "1234bbb"
        assert data["itv_date"] == 0  # vigente
    
    def test_full_workflow_with_spaces(self, integration_client):
        """Test complete workflow with spaces"""
        response = integration_client.get("/api?carPlate=1234 BBB")
        
        assert response.status_code == 200
        data = response.json()
        assert "itv_date" in data
    
    def test_full_workflow_plate_not_found(self, integration_client):
        """Test complete workflow when plate not in database"""
        response = integration_client.get("/api?carPlate=9999ZZZ")
        
        assert response.status_code == 200
        data = response.json()
        assert data["carPlate"] == "9999ZZZ"
        assert data["itv_date"] == "none"
    
    def test_full_workflow_invalid_format(self, integration_client):
        """Test complete workflow with invalid plate format"""
        response = integration_client.get("/api?carPlate=INVALID")
        
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["itv_date"]
    
    def test_multiple_requests(self, integration_client):
        """Test multiple sequential requests"""
        plates = ["1234BBB", "5678XYZ", "0000BBB"]
        
        for plate in plates:
            response = integration_client.get(f"/api?carPlate={plate}")
            assert response.status_code == 200
            data = response.json()
            assert data["carPlate"] == plate
            assert "itv_date" in data
    
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
        assert "itv_date" in data
        
        # Check itv_date structure (should be int, string "none", "warning", or dict with error)
        itv_value = data["itv_date"]
        assert isinstance(itv_value, (int, str, dict))
    
    def test_all_state_types(self, integration_client):
        """Test that all three ITV states are returned correctly"""
        # Vigente
        response = integration_client.get("/api?carPlate=1234BBB")
        assert response.json()["itv_date"] == 0
        
        # Warning
        response = integration_client.get("/api?carPlate=5678XYZ")
        assert response.json()["itv_date"] == "warning"
        
        # Caducado
        response = integration_client.get("/api?carPlate=0000BBB")
        assert response.json()["itv_date"] == 1


class TestAPIDocumentation:
    """Test API documentation endpoints"""
    
    def test_openapi_schema_exists(self, integration_client):
        """Test that OpenAPI schema is available"""
        response = integration_client.get("/openapi.json")
        assert response.status_code == 200
    
    def test_app_metadata(self, integration_client):
        """Test app has correct metadata"""
        from main import app
        assert app.title == "ITV API"
        assert app.version == "1.0.0"


class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_very_long_plate_string(self, integration_client):
        """Test with very long input"""
        response = integration_client.get("/api?carPlate=" + "A" * 100)
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["itv_date"] or data["itv_date"] == "none"
    
    def test_special_characters(self, integration_client):
        """Test with special characters"""
        response = integration_client.get("/api?carPlate=1234@#$")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["itv_date"] or data["itv_date"] == "none"
    
    def test_unicode_characters(self, integration_client):
        """Test with unicode characters"""
        response = integration_client.get("/api?carPlate=1234ÁÉÍ")
        assert response.status_code == 200
    
    def test_numeric_only(self, integration_client):
        """Test with only numbers"""
        response = integration_client.get("/api?carPlate=1234567")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data["itv_date"] or data["itv_date"] == "none"
    
    def test_plates_with_vowels(self, integration_client):
        """Test plates with vowels (invalid)"""
        response = integration_client.get("/api?carPlate=1234ABC")
        assert response.status_code == 200
        data = response.json()
        # Should be invalid (A is a vowel)
        assert "error" in data["itv_date"] or data["itv_date"] == "none"
    
    def test_missing_query_parameter(self, integration_client):
        """Test missing required carPlate parameter"""
        response = integration_client.get("/api")
        assert response.status_code == 422  # Validation error


class TestConcurrentRequests:
    """Test handling of concurrent requests"""
    
    def test_rapid_sequential_requests(self, integration_client):
        """Test rapid sequential requests to same endpoint"""
        plates = ["1234BBB"] * 10
        
        responses = []
        for plate in plates:
            response = integration_client.get(f"/api?carPlate={plate}")
            responses.append(response)
        
        # All should succeed
        for response in responses:
            assert response.status_code == 200
            assert response.json()["itv_date"] == 0
    
    def test_different_plates_sequence(self, integration_client):
        """Test sequential requests for different plates"""
        test_cases = [
            ("1234BBB", 0),
            ("5678XYZ", "warning"),
            ("0000BBB", 1),
            ("1111CCC", 0),
        ]
        
        for plate, expected in test_cases:
            response = integration_client.get(f"/api?carPlate={plate}")
            assert response.status_code == 200
            assert response.json()["itv_date"] == expected

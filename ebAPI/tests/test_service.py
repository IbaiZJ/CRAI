"""
Tests for service/service.py - EnvironmentalBadgeService
"""
import pytest
from unittest.mock import patch, MagicMock, mock_open
import pandas as pd


@pytest.fixture
def mock_csv_data():
    """Mock CSV data for testing"""
    return pd.DataFrame({
        'plate': ['1234BBB', '5678XYZ', '0000BBB', '1111CCC'],
        'badge': ['TB', 'MC', 'T0', 'TE']
    })


@pytest.fixture
def service(mock_csv_data):
    """Create service instance with mocked data"""
    with patch('service.service.pd.read_csv', return_value=mock_csv_data):
        with patch('builtins.print'):  # Suppress print statements
            from service.service import EnvironmentalBadgeService
            return EnvironmentalBadgeService()


class TestEnvironmentalBadgeService:
    """Test suite for EnvironmentalBadgeService"""
    
    def test_service_initialization(self, mock_csv_data):
        """Test service initializes correctly"""
        with patch('service.service.pd.read_csv', return_value=mock_csv_data):
            with patch('builtins.print'):
                from service.service import EnvironmentalBadgeService
                service = EnvironmentalBadgeService()
                
                assert service.df is not None
                assert len(service.df) == 4
                assert 'plate' in service.df.columns
                assert 'badge' in service.df.columns
                assert len(service.plate_to_badge) == 4
    
    def test_validate_plate_valid(self, service):
        """Test validation of valid plates"""
        # Valid Spanish plate format: 4 digits + 3 consonants (no vowels)
        assert service.validate_plate("1234BBB") == "1234BBB"
        assert service.validate_plate("5678XYZ") == "5678XYZ"
        assert service.validate_plate("0000CCC") == "0000CCC"
    
    def test_validate_plate_lowercase(self, service):
        """Test validation converts to uppercase"""
        assert service.validate_plate("1234bbb") == "1234BBB"
        assert service.validate_plate("5678xyz") == "5678XYZ"
    
    def test_validate_plate_with_spaces(self, service):
        """Test validation removes spaces"""
        assert service.validate_plate("1234 BBB") == "1234BBB"
        assert service.validate_plate(" 5678XYZ ") == "5678XYZ"
    
    def test_validate_plate_with_dashes(self, service):
        """Test validation removes dashes"""
        assert service.validate_plate("1234-BBB") == "1234BBB"
        assert service.validate_plate("5678-XYZ") == "5678XYZ"
    
    def test_validate_plate_invalid_format(self, service):
        """Test validation rejects invalid formats"""
        # Invalid formats
        assert service.validate_plate("BBBB123") is None  # Letters before numbers
        assert service.validate_plate("1234AEI") is None  # Contains vowels (A, E, I)
        assert service.validate_plate("123BBB") is None   # Only 3 digits
        assert service.validate_plate("12345BB") is None  # 5 digits, 2 letters
        assert service.validate_plate("") is None         # Empty string
        assert service.validate_plate("INVALID") is None  # Complete invalid
        assert service.validate_plate("1234ABC") is None  # ABC contains vowel A
    
    def test_validate_plate_with_vowels(self, service):
        """Test validation rejects plates with vowels"""
        assert service.validate_plate("1234AEI") is None
        assert service.validate_plate("1234OUA") is None
    
    def test_get_badge_from_plate_exists(self, service):
        """Test getting badge for existing plate"""
        assert service.get_badge_from_plate("1234BBB") == "TB"
        assert service.get_badge_from_plate("5678XYZ") == "MC"
        assert service.get_badge_from_plate("0000BBB") == "T0"
    
    def test_get_badge_from_plate_not_exists(self, service):
        """Test getting badge for non-existing plate"""
        assert service.get_badge_from_plate("9999ZZZ") is None
        assert service.get_badge_from_plate("8888XXX") is None
    
    def test_convert_badge_code_turism(self, service):
        """Test badge code conversion for turism"""
        result = service.convert_badge_code_to_name("TB")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "B"
        
        result = service.convert_badge_code_to_name("TC")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "C"
        
        result = service.convert_badge_code_to_name("T0")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "0"
        
        result = service.convert_badge_code_to_name("TE")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "ECO"
    
    def test_convert_badge_code_motorbike(self, service):
        """Test badge code conversion for motorbike"""
        result = service.convert_badge_code_to_name("MB")
        assert result["vehicleType"] == "motorbike"
        assert result["badge"] == "B"
        
        result = service.convert_badge_code_to_name("MC")
        assert result["vehicleType"] == "motorbike"
        assert result["badge"] == "C"
    
    def test_convert_badge_code_unknown(self, service):
        """Test badge code conversion for unknown types"""
        result = service.convert_badge_code_to_name("XB")
        assert result["vehicleType"] is None
        assert result["badge"] == "B"
        
        result = service.convert_badge_code_to_name("YC")
        assert result["vehicleType"] is None
        assert result["badge"] == "C"
    
    def test_convert_badge_code_unknown_badge(self, service):
        """Test badge code with unknown badge letter"""
        result = service.convert_badge_code_to_name("TX")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "Unknown"
        
        result = service.convert_badge_code_to_name("MZ")
        assert result["vehicleType"] == "motorbike"
        assert result["badge"] == "Unknown"
    
    def test_convert_badge_code_single_char(self, service):
        """Test badge code with single character"""
        result = service.convert_badge_code_to_name("T")
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "Unknown"  # No second character
    
    def test_get_badge_by_plate_success(self, service):
        """Test complete flow for valid plate"""
        # Mock data has 1234BBB with badge TB (turism B)
        result = service.get_badge_by_plate("1234BBB")  
        
        # Should find it and convert to dict
        assert isinstance(result, dict)
        assert result["vehicleType"] == "turism"
        assert result["badge"] == "B"
    
    def test_get_badge_by_plate_invalid_format(self, service):
        """Test complete flow for invalid plate format"""
        result = service.get_badge_by_plate("INVALID")
        
        assert isinstance(result, dict)
        assert "error" in result
        assert result["error"] == "Invalid plate format"
    
    def test_get_badge_by_plate_not_found(self, service):
        """Test complete flow for plate not in database"""
        service.get_badge_by_plate("9999ZZZ")
        
    def test_get_badge_by_plate_with_formatting(self, service):
        """Test complete flow with spaces and lowercase"""
        # ABC contains vowel A, so it's invalid format
        result = service.get_badge_by_plate("1234 abc")
        
        assert isinstance(result, dict)
        assert "error" in result
        assert result["error"] == "Invalid plate format"
    
    def test_plate_to_badge_dictionary(self, service):
        """Test internal plate_to_badge dictionary"""
        assert "1234BBB" in service.plate_to_badge
        assert service.plate_to_badge["1234BBB"] == "TB"
        assert len(service.plate_to_badge) == 4


class TestPlateServiceSingleton:
    """Test the plateService singleton"""
    
    def test_plate_service_exists(self):
        """Test that plateService is created"""
        with patch('service.service.pd.read_csv'):
            with patch('builtins.print'):
                from service.service import plateService
                assert plateService is not None

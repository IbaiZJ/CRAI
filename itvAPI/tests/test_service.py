"""
Tests for service/service.py - PlatesItvService
"""
import pytest
from unittest.mock import patch, MagicMock, mock_open
import pandas as pd
from datetime import date, timedelta


@pytest.fixture
def mock_csv_data():
    """Mock CSV data for testing"""
    return pd.DataFrame({
        'plate': ['1234BBB', '5678XYZ', '0000BBB', '1111CCC'],
        'date_itv': ['2026-01-15', '2024-12-01', '2027-06-30', '2025-12-10']
    })


@pytest.fixture
def service(mock_csv_data):
    """Create service instance with mocked data"""
    with patch('service.service.unzip_itv_date_file'):
        with patch('service.service.pd.read_csv', return_value=mock_csv_data):
            with patch('builtins.print'):  # Suppress print statements
                from service.service import PlatesItvService
                return PlatesItvService()


class TestPlatesItvService:
    """Test suite for PlatesItvService"""
    
    def test_service_initialization(self, mock_csv_data):
        """Test service initializes correctly"""
        with patch('service.service.unzip_itv_date_file'):
            with patch('service.service.pd.read_csv', return_value=mock_csv_data):
                with patch('builtins.print'):
                    from service.service import PlatesItvService
                    service = PlatesItvService()
                    
                    assert service.df is not None
                    assert len(service.df) == 4
                    assert 'plate' in service.df.columns
                    assert 'date_itv' in service.df.columns
                    assert len(service.plate_to_itv_date) == 4
    
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
    
    def test_validate_plate_with_vowels(self, service):
        """Test validation rejects plates with vowels"""
        assert service.validate_plate("1234AEI") is None
        assert service.validate_plate("1234OUA") is None
    
    def test_convert_itv_date_code_to_state_expired(self, service):
        """Test ITV date conversion for expired date"""
        # Date in the past
        past_date = (date.today() - timedelta(days=100)).isoformat()
        result = service.convert_itv_date_code_to_state(past_date)
        assert result == 1  # caducado
    
    def test_convert_itv_date_code_to_state_valid(self, service):
        """Test ITV date conversion for valid date (more than 30 days)"""
        # Date more than 30 days in future
        future_date = (date.today() + timedelta(days=60)).isoformat()
        result = service.convert_itv_date_code_to_state(future_date)
        assert result == 0  # vigente
    
    def test_convert_itv_date_code_to_state_warning(self, service):
        """Test ITV date conversion for warning (less than 30 days)"""
        # Date less than 30 days in future
        warning_date = (date.today() + timedelta(days=15)).isoformat()
        result = service.convert_itv_date_code_to_state(warning_date)
        assert result == "warning"
    
    def test_convert_itv_date_code_to_state_today(self, service):
        """Test ITV date conversion for today"""
        today = date.today().isoformat()
        result = service.convert_itv_date_code_to_state(today)
        # Today is technically not expired (same day)
        assert result == "warning"
    
    def test_convert_itv_date_code_to_state_invalid_date(self, service):
        """Test ITV date conversion with invalid date format"""
        result = service.convert_itv_date_code_to_state("invalid-date")
        assert result == 0  # defaults to vigente on error
    
    def test_convert_itv_date_code_to_state_empty_string(self, service):
        """Test ITV date conversion with empty string"""
        result = service.convert_itv_date_code_to_state("")
        assert result == 0  # defaults to vigente on error
    
    def test_get_itv_date_by_plate_success(self, service):
        """Test complete flow for valid plate"""
        # Mock data has 1234BBB with date 2026-01-15
        with patch.object(service, 'convert_itv_date_code_to_state', return_value=0) as mock_convert:
            result = service.get_itv_date_by_plate("1234BBB")
            
            assert result == 0
            mock_convert.assert_called_once_with('2026-01-15')
    
    def test_get_itv_date_by_plate_invalid_format(self, service):
        """Test complete flow for invalid plate format"""
        result = service.get_itv_date_by_plate("INVALID")
        
        assert isinstance(result, dict)
        assert "error" in result
        assert result["error"] == "Invalid plate format"
    
    def test_get_itv_date_by_plate_not_found(self, service):
        """Test complete flow for plate not in database"""
        result = service.get_itv_date_by_plate("9999ZZZ")
        
        assert result == "none"
    
    def test_get_itv_date_by_plate_with_formatting(self, service):
        """Test complete flow with spaces and lowercase"""
        with patch.object(service, 'convert_itv_date_code_to_state', return_value=0):
            result = service.get_itv_date_by_plate("1234 bbb")
            
            assert result == 0
    
    def test_plate_to_itv_date_dictionary(self, service):
        """Test internal plate_to_itv_date dictionary"""
        assert "1234BBB" in service.plate_to_itv_date
        assert service.plate_to_itv_date["1234BBB"] == "2026-01-15"
        assert len(service.plate_to_itv_date) == 4
    
    def test_dataframe_columns(self, service):
        """Test dataframe has correct columns"""
        assert 'plate' in service.df.columns
        assert 'date_itv' in service.df.columns
        assert len(service.df.columns) == 2
    
    def test_service_with_expired_dates(self, service):
        """Test service handles expired dates correctly"""
        # Set a plate with expired date in the mock
        expired_date = "2020-01-01"
        service.plate_to_itv_date["9999XXX"] = expired_date
        
        result = service.convert_itv_date_code_to_state(expired_date)
        assert result == 1  # caducado


class TestPlateServiceSingleton:
    """Test the plateService singleton"""
    
    def test_plate_service_exists(self):
        """Test that plateService is created"""
        with patch('service.service.unzip_itv_date_file'):
            with patch('service.service.pd.read_csv'):
                with patch('builtins.print'):
                    from service.service import plateService
                    assert plateService is not None
    
    def test_plate_service_is_instance(self):
        """Test that plateService is instance of PlatesItvService"""
        with patch('service.service.unzip_itv_date_file'):
            with patch('service.service.pd.read_csv'):
                with patch('builtins.print'):
                    from service.service import plateService, PlatesItvService
                    assert isinstance(plateService, PlatesItvService)


class TestEdgeCases:
    """Test edge cases for PlatesItvService"""
    
    def test_validate_plate_mixed_case(self, service):
        """Test validation with mixed case"""
        assert service.validate_plate("1234BbB") == "1234BBB"
        assert service.validate_plate("5678xYz") == "5678XYZ"
    
    def test_validate_plate_multiple_spaces(self, service):
        """Test validation removes multiple spaces"""
        assert service.validate_plate("1234  BBB") == "1234BBB"
        assert service.validate_plate(" 1 2 3 4 B B B ") == "1234BBB"
    
    def test_convert_itv_boundary_29_days(self, service):
        """Test warning boundary at exactly 29 days"""
        date_29 = (date.today() + timedelta(days=29)).isoformat()
        result = service.convert_itv_date_code_to_state(date_29)
        assert result == "warning"
    
    def test_convert_itv_boundary_30_days(self, service):
        """Test valid boundary at exactly 30 days"""
        date_30 = (date.today() + timedelta(days=30)).isoformat()
        result = service.convert_itv_date_code_to_state(date_30)
        assert result == 0  # vigente
    
    def test_validate_plate_only_numbers(self, service):
        """Test validation rejects only numbers"""
        assert service.validate_plate("1234567") is None
    
    def test_validate_plate_only_letters(self, service):
        """Test validation rejects only letters"""
        assert service.validate_plate("BBBBBBB") is None

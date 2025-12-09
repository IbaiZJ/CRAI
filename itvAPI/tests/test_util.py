"""
Tests for util/util.py - Utility functions
"""
import pytest
import os
from unittest.mock import patch, MagicMock, mock_open
from util.util import unzip_environmental_badge_file


class TestUnzipEnvironmentalBadgeFile:
    """Test suite for unzip_environmental_badge_file function"""
    
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_file_already_exists(self, mock_print, mock_exists):
        """Test when CSV file already exists"""
        # Mock: CSV exists, 7z exists
        mock_exists.side_effect = lambda path: True if 'csv' in path else False
        
        unzip_environmental_badge_file()
        
        # Check that it prints the "already exists" message
        assert any('already exists' in str(call) for call in mock_print.call_args_list)
    
    @patch('util.util.py7zr.SevenZipFile')
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_extract_from_7z_success(self, mock_print, mock_exists, mock_7z):
        """Test successful extraction from 7z file"""
        # Mock: CSV doesn't exist, 7z exists
        mock_exists.side_effect = lambda path: False if 'csv' in path else True
        
        # Mock 7z extraction
        mock_archive = MagicMock()
        mock_7z.return_value.__enter__.return_value = mock_archive
        
        unzip_environmental_badge_file()
        
        # Verify extraction was called
        mock_7z.assert_called_once()
        mock_archive.extractall.assert_called_once_with(path='data')
        
        # Check success message
        assert any('Successfully extracted' in str(call) for call in mock_print.call_args_list)
    
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_7z_file_not_found(self, mock_print, mock_exists):
        """Test when 7z file doesn't exist"""
        # Mock: Neither CSV nor 7z exists
        mock_exists.return_value = False
        
        with pytest.raises(SystemExit) as exc_info:
            unzip_environmental_badge_file()
        
        assert exc_info.value.code == 1
        assert any('not found' in str(call) for call in mock_print.call_args_list)
    
    @patch('util.util.py7zr.SevenZipFile')
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_extraction_error(self, mock_print, mock_exists, mock_7z):
        """Test handling of extraction errors"""
        # Mock: CSV doesn't exist, 7z exists
        mock_exists.side_effect = lambda path: False if 'csv' in path else True
        
        # Mock extraction failure
        mock_7z.side_effect = Exception("Extraction failed")
        
        with pytest.raises(SystemExit) as exc_info:
            unzip_environmental_badge_file()
        
        assert exc_info.value.code == 1
        assert any('Error extracting' in str(call) for call in mock_print.call_args_list)
    
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_import_error_handling(self, mock_print, mock_exists):
        """Test handling of ImportError"""
        # Mock: CSV doesn't exist, 7z exists
        mock_exists.side_effect = lambda path: False if 'csv' in path else True
        
        with patch('util.util.py7zr.SevenZipFile', side_effect=ImportError("py7zr not installed")):
            unzip_environmental_badge_file()
            
            # Should print error about py7zr not being installed
            assert any('py7zr not installed' in str(call) for call in mock_print.call_args_list)
    
    @patch('util.util.os.path.exists')
    @patch('builtins.print')
    def test_checking_message(self, mock_print, mock_exists):
        """Test that checking message is displayed"""
        mock_exists.return_value = True
        
        unzip_environmental_badge_file()
        
        # Check initial message
        assert any('Checking if' in str(call) for call in mock_print.call_args_list)


class TestUtilConstants:
    """Test utility constants"""
    
    def test_txt_file_path(self):
        """Test txt_file constant"""
        from util.util import txt_file
        assert txt_file == "data/environmentalBadge.csv"
    
    def test_zip_file_path(self):
        """Test zip_file constant"""
        from util.util import zip_file
        assert zip_file == "data/environmentalBadge.7z"

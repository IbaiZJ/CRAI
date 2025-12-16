"""
Tests for main.py - FastAPI application initialization
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


class TestMain:
    """Test suite for main.py"""
    
    @patch('util.util.unzip_itv_date_file')
    @patch('service.service.PlatesItvService.__init__', return_value=None)
    def test_app_initialization(self, mock_service_init, mock_unzip):
        """Test that the FastAPI app initializes correctly"""
        # The unzip is called at module level, so we need to import after patching
        import importlib
        import main
        importlib.reload(main)
        
        assert main.app is not None
        assert main.app.title == "ITV API"
        assert main.app.version == "1.0.0"
    
    @patch('util.util.unzip_itv_date_file')
    @patch('service.service.PlatesItvService.__init__', return_value=None)
    def test_app_includes_router(self, mock_service_init, mock_unzip):
        """Test that the router is included in the app"""
        from main import app
        
        routes = [route.path for route in app.routes]
        assert '/api' in routes or any('/api' in route for route in routes)
    
    @patch('util.util.unzip_itv_date_file')
    @patch('service.service.PlatesItvService.__init__', return_value=None)
    def test_app_has_correct_settings(self, mock_service_init, mock_unzip):
        """Test that app uses correct settings"""
        from main import app
        from conf.config import settings
        
        assert app.title == settings.API_TITLE
        assert app.version == settings.API_VERSION
    
    @patch('main.unzip_itv_date_file')
    def test_startup_event_called(self, mock_unzip):
        """Test that startup event calls unzip_itv_date_file"""
        from main import startup_event
        
        startup_event()
        mock_unzip.assert_called_once()

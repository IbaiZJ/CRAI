"""
Tests for conf/config.py - Configuration settings
"""
import pytest
from conf.config import Settings, settings


class TestSettings:
    """Test suite for Settings configuration"""
    
    def test_settings_default_values(self):
        """Test that settings have correct default values"""
        assert settings.API_TITLE == "Environmental Badge API"
        assert settings.API_VERSION == "1.0.0"
        assert settings.API_PREFIX == "/api"
        assert settings.API_TAGS == ["EB API"]
    
    def test_settings_is_instance_of_base_settings(self):
        """Test that settings is an instance of Settings"""
        assert isinstance(settings, Settings)
    
    def test_settings_api_title_type(self):
        """Test API_TITLE is string"""
        assert isinstance(settings.API_TITLE, str)
    
    def test_settings_api_version_type(self):
        """Test API_VERSION is string"""
        assert isinstance(settings.API_VERSION, str)
    
    def test_settings_api_prefix_type(self):
        """Test API_PREFIX is string"""
        assert isinstance(settings.API_PREFIX, str)
    
    def test_settings_api_tags_type(self):
        """Test API_TAGS is list"""
        assert isinstance(settings.API_TAGS, list)
    
    def test_settings_api_prefix_format(self):
        """Test API_PREFIX starts with /"""
        assert settings.API_PREFIX.startswith("/")
    
    def test_settings_api_tags_not_empty(self):
        """Test API_TAGS is not empty"""
        assert len(settings.API_TAGS) > 0
    
    def test_create_new_settings_instance(self):
        """Test creating a new Settings instance"""
        new_settings = Settings()
        assert new_settings.API_TITLE == "Environmental Badge API"
        assert new_settings.API_VERSION == "1.0.0"

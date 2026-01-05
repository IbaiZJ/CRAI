import logging
import sys
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path

class Logger:
    """
    Centralized logging system for the project
    Supports multiple levels, rotating files and custom formatting
    """
    
    DEBUG = logging.DEBUG
    INFO = logging.INFO
    WARNING = logging.WARNING
    ERROR = logging.ERROR
    CRITICAL = logging.CRITICAL
    
    def __init__(
        self,
        name: str = "CRAI",
        level: int = logging.INFO,
        log_to_file: bool = False,
        log_to_console: bool = True,
        log_dir: str = "logs",
        max_file_size: int = 10 * 1024 * 1024,
        backup_count: int = 5
    ):
        """
        Initialize the logging system
        
        Args:
            name: Logger name
            level: Minimum logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            log_to_file: Save logs to file
            log_to_console: Show logs in console
            log_dir: Directory for log files
            max_file_size: Maximum file size before rotation (bytes)
            backup_count: Number of backup files
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Avoid handler duplication
        if self.logger.handlers:
            self.logger.handlers.clear()
        
        # Log format
        self.formatter = self._create_formatter()
        
        # Configure handlers
        if log_to_console:
            self._add_console_handler()
        
        if log_to_file:
            self._add_file_handler(log_dir, max_file_size, backup_count)
    
    def _create_formatter(self) -> logging.Formatter:
        """Create log message format"""
        # Format: [2025-01-04 15:30:45] [INFO] [main.py:45] Message
        log_format = "[%(asctime)s] [%(levelname)-8s] [%(filename)s:%(lineno)d] %(message)s"
        date_format = "%Y-%m-%d %H:%M:%S"
        
        return logging.Formatter(log_format, date_format)
    
    def _add_console_handler(self):
        """Add handler to display logs in console with colors"""
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(ColoredFormatter())
        self.logger.addHandler(console_handler)
    
    def _add_file_handler(self, log_dir: str, max_size: int, backup_count: int):
        """Add handler to save logs in rotating files"""
        # Create logs directory
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        
        # General file (rotates by size)
        log_file = os.path.join(log_dir, "app.log")
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_size,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setFormatter(self.formatter)
        self.logger.addHandler(file_handler)
        
        # Error file (only ERROR and CRITICAL)
        error_log = os.path.join(log_dir, "errors.log")
        error_handler = RotatingFileHandler(
            error_log,
            maxBytes=max_size,
            backupCount=backup_count,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(self.formatter)
        self.logger.addHandler(error_handler)
        
        # Daily file (rotates every day at midnight)
        daily_log = os.path.join(log_dir, "daily.log")
        daily_handler = TimedRotatingFileHandler(
            daily_log,
            when='midnight',
            interval=1,
            backupCount=30,  # Keep 30 days
            encoding='utf-8'
        )
        daily_handler.setFormatter(self.formatter)
        self.logger.addHandler(daily_handler)
    
    # Logging methods
    def debug(self, message: str, *args, **kwargs):
        """DEBUG level log - Detailed information for debugging"""
        self.logger.debug(message, *args, **kwargs)
    
    def info(self, message: str, *args, **kwargs):
        """INFO level log - General flow information"""
        self.logger.info(message, *args, **kwargs)
    
    def warning(self, message: str, *args, **kwargs):
        """WARNING level log - Warnings"""
        self.logger.warning(message, *args, **kwargs)
    
    def error(self, message: str, *args, **kwargs):
        """ERROR level log - Recoverable errors"""
        self.logger.error(message, *args, **kwargs)
    
    def critical(self, message: str, *args, **kwargs):
        """CRITICAL level log - Critical errors"""
        self.logger.critical(message, *args, **kwargs)
    
    def exception(self, message: str, *args, **kwargs):
        """Exception log with full traceback"""
        self.logger.exception(message, *args, **kwargs)


class ColoredFormatter(logging.Formatter):
    """Formatter with colors for console"""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def __init__(self):
        super().__init__(
            "[%(asctime)s] [%(levelname)-8s] [%(filename)s:%(lineno)d] %(message)s",
            "%Y-%m-%d %H:%M:%S"
        )
    
    def format(self, record):
        # Add color according to level
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
        
        return super().format(record)


# ============================================
# Logger singleton for the entire project
# ============================================

_logger_instance = None

def get_logger(
    name: str = "CRAI",
    level: int = logging.INFO,
    log_to_file: bool = True,
    log_to_console: bool = True
) -> Logger:
    """
    Get the logger instance (Singleton)
    
    Args:
        name: Logger name
        level: Logging level
        log_to_file: Save to file
        log_to_console: Show in console
    
    Returns:
        Logger instance
    """
    global _logger_instance
    
    if _logger_instance is None:
        _logger_instance = Logger(
            name=name,
            level=level,
            log_to_file=log_to_file,
            log_to_console=log_to_console
        )
    
    return _logger_instance


# ============================================
# Decorator for automatic logging
# ============================================

def log_function_call(logger: Logger = None):
    """
    Decorator to automatically log function calls
    
    Example:
        @log_function_call()
        def process_image(img):
            # code
            pass
    """
    import functools
    import time
    
    if logger is None:
        logger = get_logger()
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            func_name = func.__name__
            logger.debug(f"→ Calling {func_name}()")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start_time
                logger.debug(f"✓ {func_name}() completed in {elapsed:.3f}s")
                return result
            except Exception as e:
                elapsed = time.time() - start_time
                logger.error(f"✗ {func_name}() failed after {elapsed:.3f}s: {e}")
                raise
        
        return wrapper
    return decorator


# ============================================
# Context manager for code sections
# ============================================

class LogSection:
    """
    Context manager to log code sections
    
    Example:
        with LogSection(logger, "Image processing"):
            # code
            pass
    """
    
    def __init__(self, logger: Logger, section_name: str):
        self.logger = logger
        self.section_name = section_name
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        self.logger.info(f"┌─ Starting: {self.section_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = (datetime.now() - self.start_time).total_seconds()
        
        if exc_type is None:
            self.logger.info(f"└─ Completed: {self.section_name} ({elapsed:.3f}s)")
        else:
            self.logger.error(f"└─ Error in: {self.section_name} ({elapsed:.3f}s) - {exc_val}")
        
        return False
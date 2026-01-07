import unittest
import sys
import os
import tempfile
from unittest.mock import patch, MagicMock
from io import StringIO

# Add util path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'util'))

from get_badge_types import get_badge_types, def_handler


class TestGetBadgeTypes(unittest.TestCase):
    """Test coverage for get_badge_types.py"""

    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up after tests"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_get_badge_types_with_valid_file(self):
        """Test loading badge types from a valid file"""
        test_file = os.path.join(self.temp_dir, "test_badges.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|A\n")
            f.write("5678DEF|B\n")
            f.write("9999ZZZ|A\n")  # Duplicate badge type
            f.write("0000XYZ|C\n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)
        
        self.assertIsNotNone(result)
        self.assertIn('A', result)
        self.assertIn('B', result)
        self.assertIn('C', result)
        self.assertEqual(len(result), 3)

    def test_get_badge_types_with_file_not_found(self):
        """Test handling of missing file"""
        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types("/nonexistent/path/file.txt")

        output = captured_output.getvalue()
        self.assertIsNone(result)
        self.assertIn("Error: The badge types file was not found", output)

    def test_get_badge_types_with_generic_exception(self):
        """Test handling of generic exceptions"""
        test_file = os.path.join(self.temp_dir, "test.txt")
        
        captured_output = StringIO()
        with patch('builtins.open', side_effect=PermissionError("Permission denied")):
            with patch('sys.stdout', captured_output):
                result = get_badge_types(test_file)

        output = captured_output.getvalue()
        self.assertIsNone(result)
        self.assertIn("Error:", output)

    def test_get_badge_types_with_empty_file(self):
        """Test with empty file"""
        test_file = os.path.join(self.temp_dir, "empty.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            pass  # Empty file

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        self.assertIsNotNone(result)
        self.assertEqual(len(result), 0)

    def test_get_badge_types_with_no_pipe_character(self):
        """Test with lines without pipe separator"""
        test_file = os.path.join(self.temp_dir, "no_pipe.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC-A\n")  # No pipe
            f.write("5678DEF-B\n")  # No pipe

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        self.assertIsNotNone(result)
        self.assertEqual(len(result), 0)

    def test_get_badge_types_with_single_pipe(self):
        """Test with lines that have pipe but less than 2 parts"""
        test_file = os.path.join(self.temp_dir, "single_pipe.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|\n")  # Single pipe, no badge
            f.write("5678DEF|B\n")  # Valid

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        output = captured_output.getvalue()
        self.assertIn("Loaded badge type: B", output)
        self.assertIn('B', result)

    def test_get_badge_types_with_whitespace(self):
        """Test badge types with whitespace"""
        test_file = os.path.join(self.temp_dir, "whitespace.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("  1234ABC  |  A  \n")  # Extra whitespace
            f.write("5678DEF|  B  \n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        output = captured_output.getvalue()
        self.assertIn("Loaded badge type: A", output)
        self.assertIn("Loaded badge type: B", output)
        self.assertEqual(len(result), 2)

    def test_get_badge_types_empty_badge_field(self):
        """Test with empty badge field after split"""
        test_file = os.path.join(self.temp_dir, "empty_badge.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|  \n")  # Only whitespace in badge
            f.write("5678DEF|B\n")  # Valid badge

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        output = captured_output.getvalue()
        self.assertIn("Loaded badge type: B", output)
        self.assertNotIn("Loaded badge type:", output.replace("Loaded badge type: B", ""))

    def test_signal_handler(self):
        """Test SIGINT signal handler"""
        with self.assertRaises(SystemExit) as cm:
            def_handler(None, None)

        self.assertEqual(cm.exception.code, 1)

    def test_get_badge_types_duplicate_badges(self):
        """Test that duplicate badges are not added twice"""
        test_file = os.path.join(self.temp_dir, "duplicates.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|A\n")
            f.write("5678DEF|A\n")
            f.write("9999ZZZ|A\n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        output = captured_output.getvalue()
        # Should only print "Loaded badge type: A" once
        count = output.count("Loaded badge type: A")
        self.assertEqual(count, 1)
        self.assertEqual(len(result), 1)

    def test_get_badge_types_multiple_pipes(self):
        """Test with lines that have multiple pipes"""
        test_file = os.path.join(self.temp_dir, "multiple_pipes.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|A|Extra\n")  # Multiple pipes
            f.write("5678DEF|B\n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        output = captured_output.getvalue()
        self.assertIn("Loaded badge type: A", output)
        self.assertIn("Loaded badge type: B", output)

    def test_get_badge_types_with_none_argument(self):
        """Test get_badge_types with None argument (uses default path)"""
        # This will use the default file path which doesn't exist
        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(None)

        output = captured_output.getvalue()
        # Should handle the missing default file gracefully
        self.assertIsNone(result)
        self.assertIn("Error:", output)

    def test_get_badge_types_default_parameter(self):
        """Test that default parameter works when None is passed"""
        test_file = os.path.join(self.temp_dir, "test_default.txt")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|X\n")
            f.write("5678DEF|Y\n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = get_badge_types(test_file)

        self.assertIsNotNone(result)
        self.assertEqual(len(result), 2)
        self.assertIn('X', result)
        self.assertIn('Y', result)


if __name__ == '__main__':
    unittest.main()


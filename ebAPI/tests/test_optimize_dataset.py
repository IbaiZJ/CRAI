import unittest
import sys
import os
import tempfile
import pandas as pd
from unittest.mock import patch, MagicMock
from io import StringIO

# Add util path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'util'))

from optimize_dataset import normalize_plate, optimize_dataset


class TestNormalizePlate(unittest.TestCase):
    """Test coverage for normalize_plate function"""

    def test_normalize_plate_with_spaces(self):
        """Test normalizing plate with spaces"""
        result = normalize_plate("1234 ABC")
        self.assertEqual(result, "1234ABC")

    def test_normalize_plate_with_dashes(self):
        """Test normalizing plate with dashes"""
        result = normalize_plate("1234-ABC")
        self.assertEqual(result, "1234ABC")

    def test_normalize_plate_with_mixed_whitespace(self):
        """Test normalizing plate with mixed whitespace"""
        result = normalize_plate("  1234 ABC  ")
        self.assertEqual(result, "1234ABC")

    def test_normalize_plate_lowercase(self):
        """Test converting lowercase to uppercase"""
        result = normalize_plate("1234abc")
        self.assertEqual(result, "1234ABC")

    def test_normalize_plate_with_non_string(self):
        """Test with non-string input"""
        result = normalize_plate(123)
        self.assertEqual(result, '')

    def test_normalize_plate_with_none(self):
        """Test with None input"""
        result = normalize_plate(None)
        self.assertEqual(result, '')

    def test_normalize_plate_complex(self):
        """Test with complex input"""
        result = normalize_plate("  12 34-abc  ")
        self.assertEqual(result, "1234ABC")


class TestOptimizeDataset(unittest.TestCase):
    """Test coverage for optimize_dataset.py"""

    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up after tests"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_optimize_dataset_success(self):
        """Test successful dataset optimization"""
        test_file = os.path.join(self.temp_dir, "test.txt")
        
        # Create test data (using valid plates with only consonants)
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|16A\n")
            f.write("5678FGH|B\n")
            f.write("1234BCD|16A\n")  # Duplicate
            f.write("9999ZZZ|SIN DISTINTIVO\n")

        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            output_file = optimize_dataset(test_file)

        self.assertIsNotNone(output_file)
        self.assertTrue(os.path.exists(output_file))
        
        # Verify output file content
        df = pd.read_csv(output_file)
        self.assertIn('PLATE', df.columns)
        self.assertIn('BADGE', df.columns)

    def test_optimize_dataset_duplicates_removed(self):
        """Test that duplicates are removed"""
        test_file = os.path.join(self.temp_dir, "duplicates.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|A\n")
            f.write("1234BCD|A\n")
            f.write("5678FGH|B\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        # Should only have 2 unique plates
        self.assertEqual(len(df), 2)

    def test_optimize_dataset_sin_distintivo_removed(self):
        """Test that SIN DISTINTIVO badges are removed"""
        test_file = os.path.join(self.temp_dir, "sin_distintivo.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|A\n")
            f.write("5678FGH|SIN DISTINTIVO\n")
            f.write("9999ZZZ|B\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        # Should only have 2 rows (5678FGH removed)
        self.assertEqual(len(df), 2)
        self.assertNotIn('5678FGH', df['PLATE'].values)

    def test_optimize_dataset_16_prefix_removed(self):
        """Test that '16' prefix is removed from badges"""
        test_file = os.path.join(self.temp_dir, "prefix.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|16A\n")
            f.write("5678FGH|B\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        badge_1234 = df[df['PLATE'] == '1234BCD']['BADGE'].values[0]
        self.assertEqual(badge_1234, 'A')

    def test_optimize_dataset_plate_sorting(self):
        """Test that plates are sorted"""
        test_file = os.path.join(self.temp_dir, "sorting.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("9999ZZZ|A\n")
            f.write("1234BCD|B\n")
            f.write("5678FGH|C\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        # Check if sorted
        sorted_plates = df['PLATE'].tolist()
        self.assertEqual(sorted_plates, sorted(sorted_plates))

    def test_optimize_dataset_plate_normalization(self):
        """Test that plates are normalized"""
        test_file = os.path.join(self.temp_dir, "normalization.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234 BCD|A\n")
            f.write("5678-fgh|B\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        plates = df['PLATE'].tolist()
        self.assertIn('1234BCD', plates)
        self.assertIn('5678FGH', plates)

    def test_optimize_dataset_invalid_plate_pattern(self):
        """Test that invalid plate patterns are filtered"""
        test_file = os.path.join(self.temp_dir, "invalid_plates.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|A\n")
            f.write("BCDF123|B\n")  # Invalid pattern (letters before numbers)
            f.write("123BCD|C\n")   # Too few numbers
            f.write("5678FGH|D\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        # Should only have 2 valid plates
        self.assertEqual(len(df), 2)
        valid_plates = ['1234BCD', '5678FGH']
        self.assertTrue(all(plate in valid_plates for plate in df['PLATE']))

    def test_optimize_dataset_nan_handling(self):
        """Test that NaN values are handled correctly"""
        test_file = os.path.join(self.temp_dir, "nan_values.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|A\n")
            f.write("5678DEF|B\n")

        output_file = optimize_dataset(test_file)
        
        df = pd.read_csv(output_file)
        # No NaN values should exist
        self.assertFalse(df.isnull().values.any())

    def test_optimize_dataset_file_not_found(self):
        """Test handling of missing file"""
        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = optimize_dataset("/nonexistent/file.txt")

        output = captured_output.getvalue()
        self.assertIsNone(result)
        self.assertIn("Error optimizing dataset", output)

    def test_optimize_dataset_output_extension(self):
        """Test that output file has .csv extension"""
        test_file = os.path.join(self.temp_dir, "test.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234ABC|A\n")

        output_file = optimize_dataset(test_file)
        
        self.assertTrue(output_file.endswith('.csv'))

    def test_optimize_dataset_csv_format(self):
        """Test that output is valid CSV format"""
        test_file = os.path.join(self.temp_dir, "csv_test.txt")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write("1234BCD|A\n")
            f.write("5678FGH|B\n")

        output_file = optimize_dataset(test_file)
        
        # Should be readable as CSV
        df = pd.read_csv(output_file)
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 2)

    def test_optimize_dataset_default_file_path(self):
        """Test optimize_dataset with default file path"""
        # This test checks the function behavior with None argument
        # The actual file may not exist, but the function should handle it
        captured_output = StringIO()
        with patch('sys.stdout', captured_output):
            result = optimize_dataset(None)

        # Will likely fail since default file doesn't exist
        self.assertIsNone(result)




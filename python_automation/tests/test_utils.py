"""
Tests for utility functions.
"""
import os
import sys
import json
import tempfile
import unittest
from datetime import datetime

# Add the root directory to the path for module imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Only import functions that don't depend on pandas
from src.utils.data_utils import (
    ensure_directory,
    save_json,
    load_json,
    save_csv,
    get_timestamp,
    safe_filename
)


class TestDataUtils(unittest.TestCase):
    """Tests for data manipulation functions."""
    
    def setUp(self):
        """Setup for each test."""
        # Create a temporary directory for tests
        self.test_dir = tempfile.mkdtemp()
        
        # Sample data
        self.test_data_dict = {"name": "Test", "value": 42, "active": True}
        self.test_data_list = [
            {"id": 1, "name": "Item 1"},
            {"id": 2, "name": "Item 2"},
            {"id": 3, "name": "Item 3"}
        ]
    
    def test_ensure_directory(self):
        """Test the ensure_directory function."""
        test_path = os.path.join(self.test_dir, "new_directory", "subdir")
        
        # Verify the directory doesn't exist
        self.assertFalse(os.path.exists(test_path))
        
        # Create the directory
        result = ensure_directory(test_path)
        
        # Verify the function returned True
        self.assertTrue(result)
        
        # Verify the directory was created
        self.assertTrue(os.path.exists(test_path))
        
        # Call again to test when the directory already exists
        result = ensure_directory(test_path)
        self.assertTrue(result)
    
    def test_save_and_load_json(self):
        """Test the save_json and load_json functions."""
        # Test with a dictionary
        dict_path = os.path.join(self.test_dir, "test_dict.json")
        save_result = save_json(self.test_data_dict, dict_path)
        self.assertTrue(save_result)
        self.assertTrue(os.path.exists(dict_path))
        
        loaded_dict = load_json(dict_path)
        self.assertEqual(loaded_dict, self.test_data_dict)
        
        # Test with a list
        list_path = os.path.join(self.test_dir, "test_list.json")
        save_result = save_json(self.test_data_list, list_path)
        self.assertTrue(save_result)
        
        loaded_list = load_json(list_path)
        self.assertEqual(loaded_list, self.test_data_list)
        
        # Test loading a file that doesn't exist
        nonexistent_path = os.path.join(self.test_dir, "nonexistent_file.json")
        result = load_json(nonexistent_path)
        self.assertIsNone(result)
    
    def test_save_csv(self):
        """Test the save_csv function."""
        csv_path = os.path.join(self.test_dir, "test.csv")
        
        # Save the list as CSV
        result = save_csv(self.test_data_list, csv_path)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(csv_path))
        
        # Verify the CSV content
        with open(csv_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Verify the header is present
            self.assertIn("id,name", content)
            # Verify data is present
            self.assertIn("1,Item 1", content)
            self.assertIn("2,Item 2", content)
            self.assertIn("3,Item 3", content)
        
        # Test with empty list
        result = save_csv([], csv_path)
        self.assertFalse(result)
    
    def test_get_timestamp(self):
        """Test the get_timestamp function."""
        # Default format
        timestamp = get_timestamp()
        self.assertIsInstance(timestamp, str)
        self.assertEqual(len(timestamp), 15)  # Format: YYYYMMDD_HHMMSS
        
        # Custom format
        custom_format = "%Y-%m-%d"
        timestamp = get_timestamp(custom_format)
        today = datetime.now().strftime(custom_format)
        self.assertEqual(timestamp, today)
    
    def test_safe_filename(self):
        """Test the safe_filename function."""
        # Test with unsafe characters
        unsafe = "file?with*invalid:chars|and/slashes\\too.txt"
        safe = safe_filename(unsafe)
        
        # Verify unsafe characters were replaced
        self.assertNotIn("?", safe)
        self.assertNotIn("*", safe)
        self.assertNotIn(":", safe)
        self.assertNotIn("|", safe)
        self.assertNotIn("/", safe)
        self.assertNotIn("\\", safe)
        
        # Test with multiple spaces
        spaced = "file  with    spaces"
        processed = safe_filename(spaced)
        self.assertNotIn("  ", processed)


if __name__ == '__main__':
    unittest.main() 
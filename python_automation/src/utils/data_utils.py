"""
Utilities for data manipulation and processing.
"""
import os
import json
import csv
import logging
import shutil
from datetime import datetime
from typing import Dict, List, Any, Union, Optional, Tuple
import tempfile

# Remove pandas dependency
# import pandas as pd

logger = logging.getLogger(__name__)


def ensure_directory(directory_path: str) -> bool:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory_path: Directory path
        
    Returns:
        True if the directory exists or was created successfully, False otherwise
    """
    try:
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)
            logger.info(f"Directory created: {directory_path}")
        return True
    except Exception as e:
        logger.error(f"Error creating directory {directory_path}: {str(e)}")
        return False


def safe_filename(filename: str) -> str:
    """
    Convert a string to a safe filename by removing or replacing unsafe characters.
    
    Args:
        filename: Original filename
        
    Returns:
        Safe filename
    """
    # Characters to replace with underscore
    unsafe_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    
    for char in unsafe_chars:
        filename = filename.replace(char, '_')
    
    # Replace multiple spaces or underscores with a single one
    while '  ' in filename:
        filename = filename.replace('  ', ' ')
    while '__' in filename:
        filename = filename.replace('__', '_')
    
    return filename.strip()


def save_json(data: Union[List, Dict], filepath: str, pretty: bool = True) -> bool:
    """
    Save data as JSON.
    
    Args:
        data: Data to save
        filepath: File path
        pretty: If True, format JSON in a readable way
        
    Returns:
        True if saved successfully, False otherwise
    """
    try:
        # Ensure parent directory exists
        ensure_directory(os.path.dirname(filepath))
        
        # Use a temporary file for atomic writes
        with tempfile.NamedTemporaryFile(mode='w', delete=False, dir=os.path.dirname(filepath)) as temp_file:
            if pretty:
                json.dump(data, temp_file, ensure_ascii=False, indent=2)
            else:
                json.dump(data, temp_file, ensure_ascii=False)
            
            temp_path = temp_file.name
        
        # Replace the target file with the temporary file
        shutil.move(temp_path, filepath)
        
        logger.info(f"Data saved to: {filepath}")
        return True
    except Exception as e:
        logger.error(f"Error saving JSON to {filepath}: {str(e)}")
        
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
                
        return False


def load_json(filepath: str) -> Optional[Union[List, Dict]]:
    """
    Load data from a JSON file.
    
    Args:
        filepath: File path
        
    Returns:
        Loaded data or None if an error occurs
    """
    try:
        if not os.path.exists(filepath):
            logger.warning(f"File not found: {filepath}")
            return None
            
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {filepath}: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error loading JSON from {filepath}: {str(e)}")
        return None


def save_csv(data: List[Dict], filepath: str, encoding: str = 'utf-8') -> bool:
    """
    Save a list of dictionaries as CSV.
    
    Args:
        data: List of dictionaries to save
        filepath: File path
        encoding: File encoding
        
    Returns:
        True if saved successfully, False otherwise
    """
    if not data:
        logger.warning("Empty data, nothing to save")
        return False
    
    try:
        # Ensure parent directory exists
        ensure_directory(os.path.dirname(filepath))
        
        # Use a temporary file for atomic writes
        with tempfile.NamedTemporaryFile(mode='w', delete=False, dir=os.path.dirname(filepath)) as temp_file:
            writer = csv.DictWriter(temp_file, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
            temp_path = temp_file.name
        
        # Replace the target file with the temporary file
        shutil.move(temp_path, filepath)
        
        logger.info(f"Data saved to CSV: {filepath}")
        return True
    except Exception as e:
        logger.error(f"Error saving CSV to {filepath}: {str(e)}")
        
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
                
        return False


def load_csv(filepath: str, encoding: str = 'utf-8') -> Optional[List[Dict]]:
    """
    Load data from a CSV file.
    
    Args:
        filepath: File path
        encoding: File encoding
        
    Returns:
        List of dictionaries or None if an error occurs
    """
    try:
        if not os.path.exists(filepath):
            logger.warning(f"File not found: {filepath}")
            return None
            
        with open(filepath, 'r', newline='', encoding=encoding) as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        logger.error(f"Error loading CSV from {filepath}: {str(e)}")
        return None


def csv_to_excel(csv_path: str, excel_path: str) -> bool:
    """
    Convert a CSV file to Excel.
    
    This function is a stub that logs a message. The actual implementation 
    requires pandas and openpyxl which are not installed.
    
    Args:
        csv_path: CSV file path
        excel_path: Output Excel file path
        
    Returns:
        False (function is stubbed)
    """
    logger.warning("csv_to_excel is not implemented without pandas and openpyxl")
    return False


def get_timestamp(format_str: str = "%Y%m%d_%H%M%S") -> str:
    """
    Return a formatted timestamp for use in filenames.
    
    Args:
        format_str: Date/time format
        
    Returns:
        Formatted string with the current date/time
    """
    return datetime.now().strftime(format_str)


def backup_file(filepath: str, backup_dir: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Create a backup of a file.
    
    Args:
        filepath: Path to the file to backup
        backup_dir: Directory to store the backup (defaults to same directory)
        
    Returns:
        Tuple of (success, backup_path)
    """
    if not os.path.exists(filepath):
        logger.warning(f"Cannot backup non-existent file: {filepath}")
        return False, None
        
    try:
        # Determine backup directory
        if backup_dir:
            ensure_directory(backup_dir)
        else:
            backup_dir = os.path.dirname(filepath)
            
        # Generate backup filename with timestamp
        filename = os.path.basename(filepath)
        name, ext = os.path.splitext(filename)
        backup_filename = f"{name}_{get_timestamp()}{ext}"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Copy the file
        shutil.copy2(filepath, backup_path)
        
        logger.info(f"Created backup: {backup_path}")
        return True, backup_path
    except Exception as e:
        logger.error(f"Error creating backup of {filepath}: {str(e)}")
        return False, None 
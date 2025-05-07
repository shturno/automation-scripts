"""
Utility for loading configuration from .ini files and environment variables.
"""
import os
import configparser
from typing import Dict, Any, Optional, List, Union
import logging


logger = logging.getLogger(__name__)


class ConfigLoader:
    """Class for loading and accessing configuration settings."""
    
    def __init__(self, config_path: str, env_prefix: str = 'APP_'):
        """
        Initialize the configuration loader.
        
        Args:
            config_path: Path to the .ini file
            env_prefix: Prefix for environment variables
        """
        self.config = configparser.ConfigParser()
        self.env_prefix = env_prefix
        
        # Load configuration from the .ini file if it exists
        if os.path.exists(config_path):
            try:
                self.config.read(config_path)
                logger.info(f"Configuration loaded from: {config_path}")
            except Exception as e:
                logger.error(f"Error loading configuration from {config_path}: {str(e)}")
                logger.info("Using default values and environment variables")
        else:
            logger.warning(f"Configuration file not found: {config_path}")
            logger.info("Using default values and environment variables")
    
    def get(self, section: str, key: str, default: Any = None) -> Any:
        """
        Get a configuration value, checking environment variables first.
        
        Args:
            section: Section in the .ini file
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Configuration value
        """
        # Try to get from environment variable first
        env_var = f"{self.env_prefix}{section.upper()}_{key.upper()}"
        env_value = os.environ.get(env_var)
        
        if env_value is not None:
            logger.debug(f"Using environment variable {env_var}")
            return env_value
        
        # Try to get from the configuration file
        try:
            value = self.config.get(section, key)
            logger.debug(f"Using configuration value from file: [{section}] {key}")
            return value
        except (configparser.NoSectionError, configparser.NoOptionError):
            logger.debug(f"Using default value for: [{section}] {key}")
            return default
    
    def get_int(self, section: str, key: str, default: Optional[int] = None) -> Optional[int]:
        """
        Get an integer value.
        
        Args:
            section: Section in the .ini file
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Integer value or None
        """
        value = self.get(section, key, default)
        if value is None:
            return None
            
        try:
            return int(value)
        except (ValueError, TypeError):
            logger.warning(f"Invalid integer value for [{section}] {key}: {value}")
            return default
    
    def get_float(self, section: str, key: str, default: Optional[float] = None) -> Optional[float]:
        """
        Get a float value.
        
        Args:
            section: Section in the .ini file
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Float value or None
        """
        value = self.get(section, key, default)
        if value is None:
            return None
            
        try:
            return float(value)
        except (ValueError, TypeError):
            logger.warning(f"Invalid float value for [{section}] {key}: {value}")
            return default
    
    def get_boolean(self, section: str, key: str, default: Optional[bool] = None) -> Optional[bool]:
        """
        Get a boolean value.
        
        Args:
            section: Section in the .ini file
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Boolean value or None
        """
        value = self.get(section, key, default)
        if value is None:
            return None
            
        if isinstance(value, bool):
            return value
            
        # Convert string to boolean
        if isinstance(value, str):
            return value.lower() in ('true', 'yes', '1', 'on', 't', 'y')
            
        # Try to use truthiness of value
        return bool(value)
    
    def get_list(self, section: str, key: str, 
                 default: Optional[List] = None, 
                 delimiter: str = ',') -> Optional[List[str]]:
        """
        Get a list of values from a comma-separated string.
        
        Args:
            section: Section in the .ini file
            key: Configuration key
            default: Default value if not found
            delimiter: Character that separates values
            
        Returns:
            List of values or None
        """
        value = self.get(section, key)
        if value is None:
            return default
            
        if isinstance(value, str):
            # Split by delimiter and strip whitespace
            return [item.strip() for item in value.split(delimiter) if item.strip()]
            
        # If already a list or tuple, return as list
        if isinstance(value, (list, tuple)):
            return list(value)
            
        logger.warning(f"Invalid list value for [{section}] {key}: {value}")
        return default
    
    def get_dict(self, section: str) -> Dict[str, str]:
        """
        Get all settings from a section as a dictionary.
        
        Args:
            section: Section name
            
        Returns:
            Dictionary with the settings
        """
        try:
            # Get section from config file
            section_dict = dict(self.config[section])
            
            # Update with environment variables that match the section
            prefix = f"{self.env_prefix}{section.upper()}_"
            for env_name, env_value in os.environ.items():
                if env_name.startswith(prefix):
                    # Extract the key from the environment variable name
                    key = env_name[len(prefix):].lower()
                    section_dict[key] = env_value
                    
            return section_dict
        except KeyError:
            logger.debug(f"Section not found: {section}")
            
            # Check if any environment variables match this section
            prefix = f"{self.env_prefix}{section.upper()}_"
            section_dict = {}
            for env_name, env_value in os.environ.items():
                if env_name.startswith(prefix):
                    key = env_name[len(prefix):].lower()
                    section_dict[key] = env_value
                    
            return section_dict


def get_config_loader(config_path: Optional[str] = None) -> ConfigLoader:
    """
    Get a ConfigLoader instance.
    
    Args:
        config_path: Path to the configuration file
        
    Returns:
        ConfigLoader instance
    """
    if config_path is None:
        # Try to find the configuration file in standard locations
        possible_paths = [
            'settings.ini',
            'config/settings.ini',
            os.path.join(os.path.dirname(__file__), '../../config/settings.ini')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                config_path = path
                break
        
        # If not found, use the example as fallback
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), '../../config/settings.example.ini')
    
    return ConfigLoader(config_path)


def load_config(config_path: Optional[str] = None) -> ConfigLoader:
    """
    Load configuration and return a ConfigLoader instance.
    
    This is a convenience function that's an alias for get_config_loader.
    
    Args:
        config_path: Path to the configuration file
        
    Returns:
        ConfigLoader instance
    """
    return get_config_loader(config_path) 
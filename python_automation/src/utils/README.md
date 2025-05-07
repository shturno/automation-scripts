# Utility Modules

This directory contains utility functions and helper modules that provide common functionality across the project.

## 📋 Available Utilities

### Data Utilities (`data_utils.py`)

Functions for file and data manipulation:
- JSON file operations (save/load)
- CSV file operations (save/load)
- Directory management
- File naming and timestamping
- File backup functionality

**Usage Example:**
```python
from utils.data_utils import save_json, load_json, ensure_directory

# Make sure directory exists
ensure_directory("output/data")

# Save structured data
data = [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]
save_json(data, "output/data/items.json")

# Load the data later
loaded_data = load_json("output/data/items.json")
```

### Configuration Loader (`config_loader.py`)

A configuration management system that:
- Loads settings from .ini files
- Overrides settings with environment variables
- Provides typed access methods (get_int, get_boolean, etc.)
- Supports fallback to default values

**Usage Example:**
```python
from utils.config_loader import ConfigLoader

# Load configuration
config = ConfigLoader('config/settings.ini', env_prefix='APP_')

# Access configuration values with fallbacks
db_host = config.get('database', 'host', 'localhost')
db_port = config.get_int('database', 'port', 5432)
debug_mode = config.get_boolean('app', 'debug', False)

# Get a whole section as dictionary
all_db_settings = config.get_dict('database')
```

## 🧪 Testing

All utility functions have corresponding unit tests in the `tests/` directory. You can run them with:

```bash
python -m unittest discover tests
```

## 🧩 Adding New Utilities

When adding new utility functions:

1. Group related functions in appropriate modules
2. Add comprehensive docstrings explaining purpose and parameters
3. Write unit tests for the new functionality
4. Update this README with examples if needed

For consistency, all utility functions should:
- Have clear error handling
- Return appropriate values (not raise exceptions) for common error conditions
- Log errors and important operations
- Use type annotations for better IDE support 
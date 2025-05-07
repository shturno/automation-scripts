# Python Automation Suite

A collection of Python scripts and utilities for web scraping, data processing, and task automation.

## ✨ Features

- **Web Scraping**: Extract data from websites using BeautifulSoup
- **Data Processing**: Utilities for handling CSV, JSON, and Excel files
- **Task Scheduling**: Automated execution of tasks on predefined schedules
- **Configuration Management**: Load settings from files and environment variables

## 🛠️ Project Structure

```
python_automation/
├── src/
│   ├── scrapers/
│   │   └── basic_scraper.py      # Base scraper class and news scraper implementation
│   ├── utils/
│   │   ├── data_utils.py         # File handling utilities
│   │   └── config_loader.py      # Configuration loading utilities
│   └── automations/
│       └── schedule_task.py      # Task scheduling implementation
├── tests/
│   └── test_utils.py             # Unit tests for utilities
├── config/
│   └── settings.example.ini      # Example configuration file
└── requirements.txt              # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the python_automation directory:
   ```bash
   cd python_automation
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 📖 Usage Examples

### Web Scraping

The `basic_scraper.py` provides a base class for web scraping and a specialized NewsScaper implementation:

```python
from src.scrapers.basic_scraper import NewsScraper

# Create a scraper for a news website
scraper = NewsScraper('https://example-news.com')

# Enable rate limiting to be respectful to servers
scraper.enable_rate_limiting(2.0, 5.0)

# Fetch and parse the page
soup = scraper.get_page('https://example-news.com/latest')

if soup:
    # Extract articles
    articles = scraper.extract_data(soup)
    print(f"Found {len(articles)} articles")
```

### Data Processing

The `data_utils.py` module provides functions for handling different data formats:

```python
from src.utils.data_utils import save_json, load_json, save_csv

# Save data as JSON
data = [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]
save_json(data, "output/data.json")

# Load JSON data
loaded_data = load_json("output/data.json")

# Save as CSV
save_csv(data, "output/data.csv")
```

### Scheduled Tasks

The `schedule_task.py` module allows you to define and run scheduled tasks:

```bash
# Run a specific task immediately
python -m src.automations.schedule_task --run backup

# Run all tasks immediately
python -m src.automations.schedule_task --run all

# Start the scheduler as a daemon
python -m src.automations.schedule_task --daemon
```

## ✅ Testing

Run the tests with:

```bash
python -m unittest discover tests
```

## 🔧 Configuration

Copy `config/settings.example.ini` to `config/settings.ini` and adjust the settings:

```ini
[scraper]
user_agent = Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
timeout = 30
rate_limit = true
min_delay = 2
max_delay = 5

[paths]
data_dir = data
output_dir = data/output
log_dir = logs
```

Environment variables with the prefix `APP_` will override settings from the file:

```
APP_PATHS_DATA_DIR=/custom/data/path
``` 
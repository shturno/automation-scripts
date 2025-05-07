# Web Scraping Modules

This directory contains web scraping modules that can extract data from various websites in a structured format.

## 📋 Available Scrapers

### Basic Scraper (`basic_scraper.py`)

A foundational scraper with two main classes:
- `BasicScraper`: Base class with common scraping functionality
- `NewsScraper`: Specialized scraper for news websites

**Key Features:**
- Rate limiting to respect website servers
- Error handling and logging
- URL resolution and validation
- Structured data extraction

## 📷 Example Output

When running the news scraper, it produces structured data like this:

```json
[
  {
    "title": "Scientists discover new renewable energy source",
    "link": "https://example-news.com/science/renewable-energy",
    "description": "Breakthrough technology promises to revolutionize energy production",
    "date": "2023-05-12",
    "image_url": "https://example-news.com/images/energy.jpg"
  },
  {
    "title": "Global economy shows signs of recovery",
    "link": "https://example-news.com/economy/global-recovery",
    "description": "New economic data points to positive growth in Q3",
    "date": "2023-05-11",
    "image_url": "https://example-news.com/images/economy.jpg"
  }
]
```

## 🚀 Usage

```python
from basic_scraper import NewsScraper

# Create a scraper
scraper = NewsScraper('https://example-news.com')

# Enable rate limiting to be respectful
scraper.enable_rate_limiting(2.0, 5.0)  # Delay between 2-5 seconds

# Fetch and process the page
soup = scraper.get_page('https://example-news.com/latest')
if soup:
    # Extract structured data
    articles = scraper.extract_data(soup)
    print(f"Found {len(articles)} articles")
```

## 🛠️ Creating Your Own Scraper

To create a specialized scraper for a different type of website:

1. Inherit from `BasicScraper`
2. Implement the `extract_data` method
3. Define the specific selectors for your target website

```python
class ProductScraper(BasicScraper):
    """Scraper for e-commerce product listings."""
    
    async def extract_data(self, soup, url):
        products = []
        # Implement your extraction logic here
        # ...
        return products
``` 
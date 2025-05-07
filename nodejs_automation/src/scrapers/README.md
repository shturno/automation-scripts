# Web Scraping Modules (Node.js)

This directory contains web scraping modules built with Node.js, Axios, and Cheerio to extract structured data from websites.

## 📋 Available Scrapers

### Basic Scraper (`basicScraper.js`)

A versatile scraper implementation with two main classes:
- `BaseScraper`: Foundation class with HTTP request handling and parsing
- `NewsScraper`: Specialized implementation for news websites

**Key Features:**
- Configurable HTTP client using Axios
- DOM parsing with Cheerio
- Rate limiting and request throttling
- Comprehensive error handling
- URL resolution and validation

## 📷 Example Output

Running the news scraper produces structured JSON data like this:

```json
[
  {
    "title": "New tech breakthrough announced at conference",
    "link": "https://example-news.com/tech/breakthrough",
    "description": "Industry leaders revealed new advancements in quantum computing",
    "date": "2023-05-15",
    "imageUrl": "https://example-news.com/images/quantum.jpg"
  },
  {
    "title": "Stock markets reach all-time high",
    "link": "https://example-news.com/finance/markets",
    "description": "Global markets surge on positive economic outlook",
    "date": "2023-05-14",
    "imageUrl": "https://example-news.com/images/stocks.jpg"
  }
]
```

## 🚀 Usage

```javascript
const { NewsScraper } = require('./basicScraper');
const path = require('path');

async function runScraper() {
  // Create a scraper instance
  const scraper = new NewsScraper('https://example-news.com', {
    requestDelay: 2000,  // 2 second delay between requests
    timeout: 10000       // 10 second timeout
  });
  
  // Define output path
  const outputPath = path.join('data', `news-${new Date().toISOString()}.json`);
  
  // Run the scraper
  const result = await scraper.run('https://example-news.com/latest', outputPath);
  
  if (result.success) {
    console.log(`Scraping completed: ${result.data.length} items`);
  } else {
    console.error('Scraping failed');
  }
}

runScraper().catch(console.error);
```

## 🛠️ Creating Your Own Scraper

To create a custom scraper for a specific website:

1. Extend the `BaseScraper` class
2. Implement the `extractData` method
3. Define the specific DOM selectors for your target website

```javascript
class ProductScraper extends BaseScraper {
  async extractData($, url) {
    const products = [];
    
    // Use Cheerio selectors to extract data
    $('.product-item').each((i, el) => {
      // Extract product details
      // ...
      products.push(productData);
    });
    
    return products;
  }
}
``` 
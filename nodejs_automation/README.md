# Node.js Automation Suite

A collection of Node.js scripts and utilities for web scraping, data processing, and task automation.

## ✨ Features

- **Web Scraping**: Extract data from websites using Axios and Cheerio
- **Data Processing**: Utilities for handling CSV, JSON, and Excel files
- **Task Scheduling**: Automated execution of tasks using node-cron
- **Logging System**: Comprehensive logging with Winston

## 🛠️ Project Structure

```
nodejs_automation/
├── src/
│   ├── scrapers/
│   │   └── basicScraper.js       # Base scraper class and news scraper implementation
│   ├── utils/
│   │   ├── fileUtils.js          # File handling utilities
│   │   └── logger.js             # Logging configuration
│   ├── automations/
│   │   └── scheduler.js          # Task scheduling with node-cron
│   └── index.js                  # Main entry point
├── tests/
│   ├── utils.test.js             # Unit tests for utilities
│   ├── scraper.test.js           # Unit tests for scrapers
│   └── index.test.js             # Unit tests for main functionality
└── package.json                  # Project dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm (Node package manager)

### Installation

1. Clone the repository
2. Navigate to the nodejs_automation directory:
   ```bash
   cd nodejs_automation
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## 📖 Usage Examples

### Running the Application

The application supports different modes:

```bash
# Show help
node src/index.js

# Start the task scheduler
node src/index.js --scheduler

# Run the web scraper
node src/index.js --scrape --url https://example.com
```

### Web Scraping

The `basicScraper.js` provides a base class for web scraping and a specialized NewsScraper implementation:

```javascript
const { NewsScraper } = require('./src/scrapers/basicScraper');
const path = require('path');

async function runScraper() {
  // Create a scraper instance
  const scraper = new NewsScraper('https://example-news.com');
  
  // Define output path
  const outputPath = path.join('data', `news-${new Date().toISOString()}.json`);
  
  // Run the scraper
  const result = await scraper.run('https://example-news.com/latest', outputPath);
  
  if (result.success) {
    console.log(`Scraping completed: ${result.data.length} items`);
    console.log(`Output saved to: ${outputPath}`);
  } else {
    console.error('Scraping failed');
  }
}

runScraper().catch(console.error);
```

### Data Handling

The `fileUtils.js` module provides functions for handling different data formats:

```javascript
const fileUtils = require('./src/utils/fileUtils');

// Save JSON data
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

fileUtils.saveJson(data, 'output/data.json')
  .then(() => console.log('JSON saved'))
  .catch(console.error);

// Load JSON data
fileUtils.loadJson('output/data.json')
  .then(data => console.log('Loaded data:', data))
  .catch(console.error);

// Save as CSV
fileUtils.saveCsv(data, 'output/data.csv')
  .then(() => console.log('CSV saved'))
  .catch(console.error);
```

### Scheduled Tasks

The `scheduler.js` module allows you to run scheduled tasks:

```javascript
const scheduler = require('./src/automations/scheduler');

// Run specific tasks immediately
scheduler.backupData()
  .then(success => console.log('Backup completed:', success));

scheduler.sendReport()
  .then(success => console.log('Report sent:', success));

// Start the scheduler for periodic execution
scheduler.startScheduler();
```

## ✅ Testing

Run the tests with:

```bash
npm test
```

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file in the project root:

```env
# Schedules (cron expressions)
BACKUP_SCHEDULE=0 2 * * *  # 2:00 AM daily
REPORT_SCHEDULE=0 8 * * 1  # 8:00 AM every Monday
CLEANUP_SCHEDULE=0 */12 * * *  # Every 12 hours

# Paths
LOG_DIR=logs
DATA_DIR=data
OUTPUT_DIR=data/output

# Logging
LOG_LEVEL=info
``` 
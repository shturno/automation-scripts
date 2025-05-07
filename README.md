# Automation Scripts Collection

A comprehensive collection of automation scripts and utilities using Python and Node.js to solve common tasks, increase productivity, and demonstrate modern programming practices.

## 🚀 What's Inside

This repository contains two main projects:

- **Python Automation**: Web scraping, data processing, and scheduled tasks using Python
- **Node.js Automation**: Similar capabilities implemented in Node.js with a modern JavaScript approach

Each project demonstrates best practices in:
- Code organization and project structure
- Error handling and logging
- Configuration management
- Unit testing
- Documentation

## 📋 Projects Overview

### Python Automation

```
python_automation/
├── src/
│   ├── scrapers/        # Web scraping modules
│   ├── utils/           # Utility functions
│   └── automations/     # Scheduled tasks
├── tests/               # Unit tests
├── config/              # Configuration files
└── requirements.txt     # Dependencies
```

**Key Features:**
- Web scraping with BeautifulSoup
- Data processing utilities (CSV, JSON, Excel)
- Task scheduling
- Configurable logging

### Node.js Automation

```
nodejs_automation/
├── src/
│   ├── scrapers/        # Web scraping modules
│   ├── utils/           # Utility functions
│   └── automations/     # Scheduled tasks
├── tests/               # Unit tests
└── package.json         # Dependencies and scripts
```

**Key Features:**
- Web scraping with Axios and Cheerio
- File operations (CSV, JSON, Excel)
- Cron-based task scheduling
- Winston-based logging system

## ⚙️ Getting Started

### Python Project

1. Install dependencies:
   ```bash
   cd python_automation
   pip install -r requirements.txt
   ```

2. Run the web scraper example:
   ```bash
   python -m src.scrapers.basic_scraper
   ```

3. Run the automated tasks:
   ```bash
   python -m src.automations.schedule_task --run all
   ```

4. Run tests:
   ```bash
   python -m unittest discover tests
   ```

### Node.js Project

1. Install dependencies:
   ```bash
   cd nodejs_automation
   npm install
   ```

2. Run the web scraper:
   ```bash
   npm run scrape
   ```

3. Run scheduled tasks:
   ```bash
   npm run automate
   ```

4. Run tests:
   ```bash
   npm test
   ```

## 🔍 Use Cases

These scripts can help you with:

- **Data Collection**: Scrape websites for price monitoring, news aggregation, etc.
- **Automated Reporting**: Generate periodic reports from your data
- **File Management**: Convert between formats, backup files, organize directories
- **Scheduled Tasks**: Run important processes on a schedule without manual intervention

## 🛠️ Technologies Used

**Python Stack:**
- BeautifulSoup4
- Pandas
- Requests
- Schedule

**Node.js Stack:**
- Axios
- Cheerio
- Node-cron
- Winston

## 📄 License

MIT

---

Built with ❤️ as a demonstration of automation skills and best practices. 
/**
 * Main entry point for the project.
 */
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import project modules
const logger = require('./utils/logger');
const scheduler = require('./automations/scheduler');
const scrapers = require('./scrapers/basicScraper');
const fileUtils = require('./utils/fileUtils');

/**
 * Main function.
 */
async function main() {
  const operation = logger.startOperation('Main application');
  
  try {
    // Check command line arguments
    const args = process.argv.slice(2);
    
    // Execution mode based on arguments
    if (args.includes('--scheduler')) {
      // Start task scheduler
      logger.info('Starting task scheduler...');
      const success = scheduler.startScheduler();
      
      if (success) {
        operation.end('Scheduler started');
      } else {
        operation.end('Failed to start scheduler');
        process.exit(1);
      }
    } 
    else if (args.includes('--scrape')) {
      // Run scraper
      logger.info('Starting scraper...');
      
      // Define scraper URL (default or provided)
      let url = 'https://example-news.com';
      const urlIndex = args.indexOf('--url');
      if (urlIndex >= 0 && args.length > urlIndex + 1) {
        url = args[urlIndex + 1];
      }
      
      // Validate URL
      try {
        new URL(url);
      } catch (e) {
        logger.error(`Invalid URL: ${url}`);
        operation.end('Invalid URL provided');
        process.exit(1);
      }
      
      // Define output path
      const outputDir = process.env.OUTPUT_DIR || 'data/output';
      fileUtils.ensureDirectory(outputDir);
      
      const outputPath = path.join(outputDir, `scrape-result-${Date.now()}.json`);
      
      // Create scraper instance and run
      try {
        const scraper = new scrapers.NewsScraper(url);
        const result = await scraper.run(url, outputPath);
        
        if (result.success) {
          operation.end(`Scraping completed: ${result.data.length} items`);
        } else {
          operation.end('Scraping failed');
          process.exit(1);
        }
      } catch (error) {
        logger.error('Error running scraper:', error);
        operation.end('Scraper error');
        process.exit(1);
      }
    }
    else {
      // Show help information
      showHelp();
      operation.end('Showed help');
    }
  } catch (error) {
    operation.error(error);
    process.exit(1);
  }
}

/**
 * Displays program usage information.
 */
function showHelp() {
  console.log(`
NodeJS Automation - Tool for automation and web scraping

Usage:
  node src/index.js [options]

Options:
  --scheduler        Start the task scheduler
  --scrape           Run the web scraper
  --url <URL>        Define the URL for scraping (used with --scrape)
  
Examples:
  node src/index.js --scheduler
  node src/index.js --scrape --url https://example.com
  `);
}

// Execute main function if this file is run directly
if (require.main === module) {
  // Ensure required directories exist
  ['logs', 'data', 'data/output'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  main().catch(error => {
    logger.error('Fatal error in application:', error);
    process.exit(1);
  });
}

module.exports = { main }; 
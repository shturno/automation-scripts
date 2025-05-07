/**
 * Basic web scraper implementation using Axios and Cheerio.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const fileUtils = require('../utils/fileUtils');
const path = require('path');
const url = require('url');  // Node.js URL module for safer URL handling

/**
 * Base class for scrapers.
 */
class BaseScraper {
  /**
   * Initializes the scraper.
   * @param {string} baseUrl - Base URL for the scraper
   * @param {Object} options - Additional options
   */
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
    
    // Default axios configuration
    this.axiosConfig = {
      headers: {
        'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      timeout: options.timeout || 30000,
      maxRedirects: options.maxRedirects || 5,
      validateStatus: status => status >= 200 && status < 300, // Only accept 2xx status codes
    };

    // Add optional rate limiting
    this.requestDelay = options.requestDelay || 0; // Delay in ms between requests
    this.lastRequestTime = 0; // Timestamp of the last request
  }
  
  /**
   * Gets the content of a web page.
   * @param {string} targetUrl - URL of the page
   * @returns {Promise<{$: CheerioStatic, url: string}|null>} Cheerio object and URL or null on error
   */
  async fetchPage(targetUrl) {
    const operation = logger.startOperation(`Fetch page: ${targetUrl}`);
    
    try {
      // Validate URL
      const parsedUrl = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are supported');
      }

      // Apply rate limiting if needed
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.requestDelay) {
        const delay = this.requestDelay - elapsed;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Send the request
      this.lastRequestTime = Date.now();
      const response = await axios.get(targetUrl, this.axiosConfig);
      const $ = cheerio.load(response.data);
      
      operation.end('success');
      return { $, url: response.config.url };
    } catch (error) {
      operation.error(error);
      
      // Detailed error information
      if (error.response) {
        logger.error(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        logger.error('Server did not respond');
      } else {
        logger.error(`Request error: ${error.message}`);
      }
      
      return null;
    }
  }
  
  /**
   * Resolves relative URLs to absolute URLs.
   * @param {string} baseUrl - Base URL
   * @param {string} relativeUrl - Relative URL
   * @returns {string|null} Absolute URL or null if input is invalid
   */
  resolveUrl(baseUrl, relativeUrl) {
    if (!relativeUrl && relativeUrl !== '') return null;
    
    try {
      // Use the URL API for safer URL resolution
      return new URL(relativeUrl, baseUrl).href;
    } catch (error) {
      logger.warn(`Invalid URL resolution: ${baseUrl} + ${relativeUrl}`);
      return null;
    }
  }
  
  /**
   * Extract data from page. Must be implemented by subclasses.
   * @param {CheerioStatic} $ - Cheerio object loaded with HTML
   * @param {string} url - Page URL
   * @returns {Promise<Array|Object>} Extracted data
   */
  async extractData($, url) {
    throw new Error('The extractData method must be implemented by subclasses');
  }
  
  /**
   * Saves the extracted data to a file.
   * @param {Array|Object} data - Extracted data
   * @param {string} outputPath - Output file path
   * @returns {Promise<boolean>} True if data was saved successfully
   */
  async saveData(data, outputPath) {
    const ext = path.extname(outputPath).toLowerCase();
    
    switch (ext) {
      case '.json':
        return await fileUtils.saveJson(data, outputPath);
      case '.csv':
        return await fileUtils.saveCsv(data, outputPath);
      default:
        logger.error(`Unsupported file format: ${ext}`);
        return false;
    }
  }
  
  /**
   * Runs the scraper on a URL and saves the results.
   * @param {string} url - URL to process
   * @param {string} outputPath - Path to save the results
   * @returns {Promise<{success: boolean, data: Array|Object|null}>} Operation result
   */
  async run(url, outputPath) {
    const operation = logger.startOperation(`Scraper on ${url}`);
    
    try {
      const page = await this.fetchPage(url);
      if (!page) {
        operation.end('failed to get page');
        return { success: false, data: null };
      }
      
      const data = await this.extractData(page.$, page.url);
      
      if (outputPath) {
        await this.saveData(data, outputPath);
      }
      
      operation.end(`success (${Array.isArray(data) ? data.length : 1} items)`);
      return { success: true, data };
    } catch (error) {
      operation.error(error);
      return { success: false, data: null };
    }
  }
}

/**
 * Specialized scraper for news sites.
 */
class NewsScraper extends BaseScraper {
  /**
   * Extracts news articles from a page.
   * @param {CheerioStatic} $ - Cheerio object
   * @param {string} url - Page URL
   * @returns {Promise<Array>} Array of news articles
   */
  async extractData($, url) {
    const articles = [];
    
    // Generic selector for news blocks - adjust as needed
    $('article, .news-item, .article, .post').each((i, el) => {
      // Look for title
      const titleElement = $(el).find('h1, h2, h3, .title').first();
      const title = titleElement.text().trim();
      
      // Look for link
      const linkElement = titleElement.find('a').length > 0 
        ? titleElement.find('a') 
        : $(el).find('a').first();
      
      const link = this.resolveUrl(url, linkElement.attr('href'));
      
      // Look for description
      const description = $(el).find('p, .description, .summary').first().text().trim();
      
      // Look for date
      const dateText = $(el).find('.date, time, .published').first().text().trim();
      
      // Look for image
      const imageUrl = this.resolveUrl(
        url, 
        $(el).find('img').first().attr('src')
      );
      
      // Only add if title and link are present
      if (title && link) {
        articles.push({
          title,
          link,
          description: description || null,
          date: dateText || null,
          imageUrl: imageUrl || null
        });
      }
    });
    
    logger.info(`Extracted ${articles.length} articles from ${url}`);
    return articles;
  }
}

/**
 * Example usage of the scraper.
 */
async function example() {
  // Create a scraper instance
  const scraper = new NewsScraper('https://example-news.com');
  
  // Define output path
  const outputPath = path.join('data', `news-${fileUtils.getTimestamp()}.json`);
  
  // Run the scraper
  const result = await scraper.run('https://example-news.com/latest', outputPath);
  
  if (result.success) {
    logger.info(`Scraping completed successfully: ${outputPath}`);
    
    // Show the first 3 results
    const sample = result.data.slice(0, 3);
    logger.info(`Data sample: ${JSON.stringify(sample, null, 2)}`);
  } else {
    logger.error('Scraping failed');
  }
}

module.exports = {
  BaseScraper,
  NewsScraper,
  example
}; 
/**
 * Tests for scraper functionality.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { BaseScraper, NewsScraper } = require('../src/scrapers/basicScraper');

// Mock dependencies
jest.mock('axios');
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  startOperation: jest.fn().mockReturnValue({
    end: jest.fn(),
    error: jest.fn()
  })
}));
jest.mock('../src/utils/fileUtils', () => ({
  ensureDirectory: jest.fn().mockReturnValue(true),
  saveJson: jest.fn().mockResolvedValue(true),
  getTimestamp: jest.fn().mockReturnValue('20230101_120000')
}));

// Sample HTML content for tests
const sampleHtml = `
<!DOCTYPE html>
<html>
<body>
  <article>
    <h2><a href="/article1">Test Article 1</a></h2>
    <p>Description of article 1</p>
    <time>2023-01-01</time>
    <img src="/image1.jpg" alt="Image 1">
  </article>
  <article>
    <h2><a href="https://example.com/article2">Test Article 2</a></h2>
    <p>Description of article 2</p>
    <time>2023-01-02</time>
  </article>
</body>
</html>
`;

describe('Scraper', () => {
  let axios;
  let tempDir;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Import axios inside test to access the mocked version
    axios = require('axios');
    
    // Set up successful response
    axios.get.mockResolvedValue({
      data: sampleHtml,
      config: { url: 'https://example.com/test' }
    });
    
    // Create temp directory for file outputs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scraper-test-'));
  });
  
  afterEach(() => {
    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error cleaning up temp directory: ${tempDir}`, error);
    }
  });
  
  describe('BaseScraper', () => {
    test('should initialize with default options', () => {
      const scraper = new BaseScraper('https://example.com');
      
      expect(scraper.baseUrl).toBe('https://example.com');
      expect(scraper.axiosConfig).toBeDefined();
      expect(scraper.axiosConfig.headers).toBeDefined();
      expect(scraper.axiosConfig.timeout).toBeDefined();
    });
    
    test('should fetch and parse a page', async () => {
      const scraper = new BaseScraper('https://example.com');
      const result = await scraper.fetchPage('https://example.com/test');
      
      expect(axios.get).toHaveBeenCalledWith('https://example.com/test', expect.any(Object));
      expect(result).toBeDefined();
      expect(result.$).toBeDefined(); // Cheerio object
      expect(result.url).toBe('https://example.com/test');
    });
    
    test('should handle fetch errors gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));
      
      const scraper = new BaseScraper('https://example.com');
      const result = await scraper.fetchPage('https://example.com/error');
      
      expect(result).toBeNull();
    });
    
    test('should correctly resolve relative URLs', () => {
      const scraper = new BaseScraper('https://example.com');
      
      expect(scraper.resolveUrl('https://example.com', '/path')).toBe('https://example.com/path');
      expect(scraper.resolveUrl('https://example.com/', 'path')).toBe('https://example.com/path');
      expect(scraper.resolveUrl('https://example.com', 'https://other.com/path')).toBe('https://other.com/path');
      expect(scraper.resolveUrl('https://example.com', null)).toBeNull();
      expect(scraper.resolveUrl('https://example.com', '')).toBe('https://example.com/');
    });
    
    test('should throw error when extractData is not implemented', async () => {
      const scraper = new BaseScraper('https://example.com');
      
      await expect(scraper.extractData({}, 'https://example.com')).rejects.toThrow(
        'The extractData method must be implemented by subclasses'
      );
    });
  });
  
  describe('NewsScraper', () => {
    test('should extract articles from HTML', async () => {
      // Create a cheerio object with sample HTML
      const cheerio = require('cheerio');
      const $ = cheerio.load(sampleHtml);
      
      const scraper = new NewsScraper('https://example.com');
      const articles = await scraper.extractData($, 'https://example.com/test');
      
      expect(articles).toHaveLength(2);
      
      // Check first article
      expect(articles[0].title).toBe('Test Article 1');
      expect(articles[0].link).toBe('https://example.com/article1');
      expect(articles[0].description).toBe('Description of article 1');
      expect(articles[0].date).toBe('2023-01-01');
      expect(articles[0].imageUrl).toBe('https://example.com/image1.jpg');
      
      // Check second article
      expect(articles[1].title).toBe('Test Article 2');
      expect(articles[1].link).toBe('https://example.com/article2');
    });
    
    test('should run complete scraping process', async () => {
      const scraper = new NewsScraper('https://example.com');
      const outputPath = path.join(tempDir, 'output.json');
      
      const result = await scraper.run('https://example.com/test', outputPath);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    
    test('should handle errors in scraping process', async () => {
      // Set up a failure
      axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
      
      const scraper = new NewsScraper('https://example.com');
      const result = await scraper.run('https://example.com/test', path.join(tempDir, 'output.json'));
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });
}); 
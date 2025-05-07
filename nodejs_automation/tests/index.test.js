/**
 * Tests for the main application entry point.
 */
const { main } = require('../src/index');

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
process.exit = jest.fn();

// Mock dependencies
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  startOperation: jest.fn().mockReturnValue({
    end: jest.fn(),
    error: jest.fn()
  })
}));

jest.mock('../src/automations/scheduler', () => ({
  startScheduler: jest.fn().mockReturnValue(true)
}));

jest.mock('../src/scrapers/basicScraper', () => {
  const mockScraper = {
    run: jest.fn().mockResolvedValue({ success: true, data: [{ title: 'Test', link: 'http://example.com' }] })
  };
  
  return {
    NewsScraper: jest.fn().mockImplementation(() => mockScraper)
  };
});

jest.mock('../src/utils/fileUtils', () => ({
  ensureDirectory: jest.fn().mockReturnValue(true)
}));

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

describe('Main Application', () => {
  const originalArgv = process.argv;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.argv
    process.argv = [...originalArgv];
  });
  
  afterAll(() => {
    // Restore process.exit
    process.exit = originalExit;
  });
  
  test('should show help when no arguments are provided', async () => {
    // Save and mock console.log
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    
    // Run main with no arguments
    process.argv = ['node', 'src/index.js'];
    await main();
    
    // Help should be shown
    expect(console.log).toHaveBeenCalled();
    expect(console.log.mock.calls[0][0]).toContain('Usage:');
    
    // Restore console.log
    console.log = originalConsoleLog;
  });
  
  test('should start scheduler when --scheduler argument is provided', async () => {
    const scheduler = require('../src/automations/scheduler');
    
    // Run main with scheduler argument
    process.argv = ['node', 'src/index.js', '--scheduler'];
    await main();
    
    // Should call startScheduler
    expect(scheduler.startScheduler).toHaveBeenCalled();
  });
  
  test('should run scraper when --scrape argument is provided', async () => {
    const scrapers = require('../src/scrapers/basicScraper');
    
    // Run main with scrape argument
    process.argv = ['node', 'src/index.js', '--scrape'];
    await main();
    
    // Should create and run a scraper
    expect(scrapers.NewsScraper).toHaveBeenCalled();
    expect(scrapers.NewsScraper.mock.results[0].value.run).toHaveBeenCalled();
  });
  
  test('should use custom URL when --url argument is provided', async () => {
    const scrapers = require('../src/scrapers/basicScraper');
    
    // Run main with scrape and custom URL arguments
    process.argv = ['node', 'src/index.js', '--scrape', '--url', 'https://custom-url.com'];
    await main();
    
    // Should create scraper with custom URL
    expect(scrapers.NewsScraper).toHaveBeenCalledWith('https://custom-url.com');
    expect(scrapers.NewsScraper.mock.results[0].value.run).toHaveBeenCalledWith(
      'https://custom-url.com',
      expect.any(String)
    );
  });
  
  test('should handle scraper failures', async () => {
    const scrapers = require('../src/scrapers/basicScraper');
    const logger = require('../src/utils/logger');
    
    // Mock scraper to fail
    const mockScraper = {
      run: jest.fn().mockResolvedValue({ success: false, data: null })
    };
    scrapers.NewsScraper.mockImplementationOnce(() => mockScraper);
    
    // Run main with scrape argument
    process.argv = ['node', 'src/index.js', '--scrape'];
    await main();
    
    // Should log failure and exit
    expect(process.exit).toHaveBeenCalledWith(1);
  });
  
  test('should handle invalid URLs', async () => {
    const logger = require('../src/utils/logger');
    
    // Run main with invalid URL
    process.argv = ['node', 'src/index.js', '--scrape', '--url', 'invalid-url'];
    await main();
    
    // Should log error and exit
    expect(logger.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
  
  test('should handle scheduler failures', async () => {
    const scheduler = require('../src/automations/scheduler');
    
    // Mock scheduler to fail
    scheduler.startScheduler.mockReturnValueOnce(false);
    
    // Run main with scheduler argument
    process.argv = ['node', 'src/index.js', '--scheduler'];
    await main();
    
    // Should exit with error code
    expect(process.exit).toHaveBeenCalledWith(1);
  });
}); 
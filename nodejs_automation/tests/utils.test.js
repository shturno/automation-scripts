/**
 * Tests for utility functions.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const fileUtils = require('../src/utils/fileUtils');

// Mock the logger module
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('File Utilities', () => {
  let tempDir;
  
  // Create temporary directory before each test
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-utils-test-'));
  });
  
  // Clean up after each test
  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error cleaning up temp directory: ${tempDir}`, error);
    }
  });
  
  describe('ensureDirectory', () => {
    test('should create a directory if it does not exist', () => {
      const testDir = path.join(tempDir, 'new-dir');
      expect(fs.existsSync(testDir)).toBe(false);
      
      const result = fileUtils.ensureDirectory(testDir);
      
      expect(result).toBe(true);
      expect(fs.existsSync(testDir)).toBe(true);
    });
    
    test('should return true if the directory already exists', () => {
      const result = fileUtils.ensureDirectory(tempDir);
      expect(result).toBe(true);
    });
    
    test('should handle nested subdirectories', () => {
      const nestedDir = path.join(tempDir, 'level1', 'level2', 'level3');
      expect(fs.existsSync(nestedDir)).toBe(false);
      
      const result = fileUtils.ensureDirectory(nestedDir);
      
      expect(result).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });
    
    test('should fail gracefully with invalid path', () => {
      // This test depends on OS restrictions which may vary
      // For example, on Windows, certain characters are invalid in paths
      const invalidChars = process.platform === 'win32' 
        ? ['<', '>', ':', '"', '|', '?', '*'] 
        : ['\0'];  // Null byte is invalid on most filesystems
        
      if (invalidChars.length > 0) {
        // Test with one invalid character
        const invalidDir = path.join(tempDir, `invalid${invalidChars[0]}dir`);
        const result = fileUtils.ensureDirectory(invalidDir);
        expect(result).toBe(false);
      }
    });
  });
  
  describe('saveJson and loadJson', () => {
    test('should save and load a JSON object', async () => {
      const testData = { name: 'Test', value: 42, active: true };
      const jsonPath = path.join(tempDir, 'test.json');
      
      const saveResult = await fileUtils.saveJson(testData, jsonPath);
      expect(saveResult).toBe(true);
      expect(fs.existsSync(jsonPath)).toBe(true);
      
      const loadedData = await fileUtils.loadJson(jsonPath);
      expect(loadedData).toEqual(testData);
    });
    
    test('should save and load a JSON array', async () => {
      const testArray = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      const jsonPath = path.join(tempDir, 'array.json');
      
      const saveResult = await fileUtils.saveJson(testArray, jsonPath);
      expect(saveResult).toBe(true);
      
      const loadedArray = await fileUtils.loadJson(jsonPath);
      expect(loadedArray).toEqual(testArray);
    });
    
    test('should save JSON with proper formatting when pretty=true', async () => {
      const testData = { name: 'Test', value: 42 };
      const prettyPath = path.join(tempDir, 'pretty.json');
      const minifiedPath = path.join(tempDir, 'minified.json');
      
      await fileUtils.saveJson(testData, prettyPath, true);
      await fileUtils.saveJson(testData, minifiedPath, false);
      
      const prettyContent = fs.readFileSync(prettyPath, 'utf8');
      const minifiedContent = fs.readFileSync(minifiedPath, 'utf8');
      
      // Pretty JSON should have more lines and spaces
      expect(prettyContent.length).toBeGreaterThan(minifiedContent.length);
      expect(prettyContent).toContain('\n');
      expect(minifiedContent).not.toContain('\n');
    });
    
    test('should return null when loading a non-existent file', async () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist.json');
      const result = await fileUtils.loadJson(nonExistentPath);
      expect(result).toBeNull();
    });
    
    test('should return null when loading invalid JSON', async () => {
      const invalidJsonPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(invalidJsonPath, '{"broken": "json"', 'utf8');
      
      const result = await fileUtils.loadJson(invalidJsonPath);
      expect(result).toBeNull();
    });
  });
  
  describe('getTimestamp', () => {
    test('should return a timestamp in the default format', () => {
      const timestamp = fileUtils.getTimestamp();
      
      // Default format: YYYYMMDD_HHMMSS
      expect(timestamp).toMatch(/^\d{8}_\d{6}$/);
    });
    
    test('should return an ISO timestamp when requested', () => {
      const timestamp = fileUtils.getTimestamp('iso');
      
      // ISO format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
    
    test('should use ISO format as fallback for unrecognized formats', () => {
      const timestamp = fileUtils.getTimestamp('unknown-format');
      
      // Should default to ISO
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });
  
  describe('saveCsv', () => {
    test('should return false for empty data', async () => {
      const csvPath = path.join(tempDir, 'empty.csv');
      const result = await fileUtils.saveCsv([], csvPath);
      expect(result).toBe(false);
    });
    
    test('should save CSV data correctly', async () => {
      const testData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      
      const csvPath = path.join(tempDir, 'test.csv');
      const headers = [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' }
      ];
      
      const result = await fileUtils.saveCsv(testData, csvPath, headers);
      expect(result).toBe(true);
      expect(fs.existsSync(csvPath)).toBe(true);
      
      // Read file content to verify CSV structure
      const content = fs.readFileSync(csvPath, 'utf8');
      expect(content).toContain('ID,Name');  // Headers
      expect(content).toContain('1,Test 1'); // Data line 1
      expect(content).toContain('2,Test 2'); // Data line 2
    });
    
    test('should generate headers automatically if not provided', async () => {
      const testData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      
      const csvPath = path.join(tempDir, 'auto-headers.csv');
      
      const result = await fileUtils.saveCsv(testData, csvPath);
      expect(result).toBe(true);
      
      // Read file content to verify automatic headers
      const content = fs.readFileSync(csvPath, 'utf8');
      expect(content).toContain('id,name');  // Auto-generated headers
    });
  });

  // End-to-end test that combines multiple utility functions
  describe('End-to-end data flow', () => {
    test('should handle a complete data workflow', async () => {
      // 1. Create a directory structure
      const dataDir = path.join(tempDir, 'data-flow');
      const outputDir = path.join(dataDir, 'output');
      
      fileUtils.ensureDirectory(dataDir);
      fileUtils.ensureDirectory(outputDir);
      
      // 2. Save JSON data
      const testData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
      ];
      
      const jsonPath = path.join(dataDir, 'data.json');
      await fileUtils.saveJson(testData, jsonPath);
      
      // 3. Load JSON data
      const loadedJson = await fileUtils.loadJson(jsonPath);
      expect(loadedJson).toEqual(testData);
      
      // 4. Save as CSV
      const csvPath = path.join(outputDir, 'data.csv');
      await fileUtils.saveCsv(loadedJson, csvPath);
      
      // Verify final output exists
      expect(fs.existsSync(csvPath)).toBe(true);
    });
  });
}); 
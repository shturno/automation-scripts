/**
 * File manipulation utilities.
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const logger = require('./logger');

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - Directory path
 * @returns {boolean} True if the directory exists or was created successfully
 */
function ensureDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Directory created: ${dirPath}`);
    }
    return true;
  } catch (error) {
    logger.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
}

/**
 * Saves data to a JSON file.
 * @param {Object|Array} data - Data to be saved
 * @param {string} filePath - File path
 * @param {boolean} [pretty=true] - If true, formats JSON in a readable way
 * @returns {Promise<boolean>} Promise that resolves to true on success
 */
async function saveJson(data, filePath, pretty = true) {
  try {
    // Ensure parent directory exists
    ensureDirectory(path.dirname(filePath));
    
    // Format JSON data
    const jsonData = pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    // Write to file
    await fs.promises.writeFile(filePath, jsonData, 'utf8');
    logger.info(`Data saved to JSON: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Error saving JSON to ${filePath}:`, error);
    return false;
  }
}

/**
 * Loads data from a JSON file.
 * @param {string} filePath - File path
 * @returns {Promise<Object|Array|null>} Loaded data or null on error
 */
async function loadJson(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found: ${filePath}`);
      return null;
    }
    
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error loading JSON from ${filePath}:`, error);
    return null;
  }
}

/**
 * Saves an array of objects to a CSV file.
 * @param {Array<Object>} data - Array of objects to save
 * @param {string} filePath - File path
 * @param {Array<Object>} headers - Array of { id, title } objects for headers
 * @returns {Promise<boolean>} Promise that resolves to true on success
 */
async function saveCsv(data, filePath, headers) {
  if (!data || data.length === 0) {
    logger.warn('Empty data, nothing to save');
    return false;
  }
  
  try {
    // Ensure parent directory exists
    ensureDirectory(path.dirname(filePath));
    
    // Generate headers automatically if not provided
    if (!headers) {
      const sampleObj = data[0];
      headers = Object.keys(sampleObj).map(key => ({
        id: key,
        title: key
      }));
    }
    
    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filePath,
      header: headers
    });
    
    // Write data
    await csvWriter.writeRecords(data);
    logger.info(`Data saved to CSV: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Error saving CSV to ${filePath}:`, error);
    return false;
  }
}

/**
 * Loads data from a CSV file.
 * @param {string} filePath - File path
 * @returns {Promise<Array<Object>|null>} Loaded data or null on error
 */
function loadCsv(filePath) {
  return new Promise((resolve, reject) => {
    // Check if file exists first
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found: ${filePath}`);
      resolve(null);
      return;
    }
    
    const results = [];
    
    fs.createReadStream(filePath)
      .on('error', (error) => {
        logger.error(`Error reading CSV from ${filePath}:`, error);
        reject(error);
      })
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        logger.info(`CSV loaded: ${filePath} (${results.length} records)`);
        resolve(results);
      })
      .on('error', (error) => {
        logger.error(`Error processing CSV from ${filePath}:`, error);
        reject(error);
      });
  }).catch(error => {
    logger.error(`Failed to load CSV from ${filePath}:`, error);
    return null;
  });
}

/**
 * Converts CSV to Excel.
 * @param {string} csvPath - CSV file path
 * @param {string} excelPath - Output Excel file path
 * @returns {Promise<boolean>} Promise that resolves to true on success
 */
async function csvToExcel(csvPath, excelPath) {
  try {
    const data = await loadCsv(csvPath);
    if (!data || data.length === 0) {
      logger.warn(`No data to convert from ${csvPath}`);
      return false;
    }
    
    ensureDirectory(path.dirname(excelPath));
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Add data
    data.forEach(row => {
      const values = headers.map(header => row[header]);
      worksheet.addRow(values);
    });
    
    // Basic styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach(column => {
      column.width = Math.max(
        15,
        (column.header && column.header.length) || 15
      );
    });
    
    await workbook.xlsx.writeFile(excelPath);
    logger.info(`CSV converted to Excel: ${excelPath}`);
    return true;
  } catch (error) {
    logger.error(`Error converting CSV to Excel:`, error);
    return false;
  }
}

/**
 * Generates a formatted timestamp for use in filenames.
 * @param {string} [format='YYYYMMDD_HHmmss'] - Desired format
 * @returns {string} Formatted timestamp
 */
function getTimestamp(format = 'YYYYMMDD_HHmmss') {
  const now = new Date();
  
  if (format === 'YYYYMMDD_HHmmss') {
    return now.toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/[-:]/g, '');
  }
  
  if (format === 'iso') {
    return now.toISOString();
  }
  
  return now.toISOString();
}

module.exports = {
  ensureDirectory,
  saveJson,
  loadJson,
  saveCsv,
  loadCsv,
  csvToExcel,
  getTimestamp
}; 
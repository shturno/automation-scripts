# Utility Modules (Node.js)

This directory contains utility functions and helper modules that provide common functionality across the project.

## 📋 Available Utilities

### File Utilities (`fileUtils.js`)

Functions for file and data manipulation:
- JSON file operations (save/load)
- CSV file operations (save/load)
- Excel file conversion
- Directory management
- Timestamp generation for file naming

**Usage Example:**
```javascript
const fileUtils = require('./fileUtils');

// Ensure directory exists
fileUtils.ensureDirectory('data/output');

// Save data as JSON
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];
fileUtils.saveJson(data, 'data/output/items.json')
  .then(() => console.log('JSON saved'))
  .catch(err => console.error('Error:', err));

// Load JSON data
fileUtils.loadJson('data/output/items.json')
  .then(data => console.log('Loaded data:', data))
  .catch(err => console.error('Error:', err));

// Generate a timestamp for unique filenames
const timestamp = fileUtils.getTimestamp();
console.log(`Generated timestamp: ${timestamp}`);
```

### Logging System (`logger.js`)

A comprehensive logging system built on Winston that provides:
- Configurable log levels
- File and console output
- Timestamp formatting
- Log file rotation
- Operation tracking with start/end/error methods

**Usage Example:**
```javascript
const logger = require('./logger');

// Basic logging
logger.info('Application starting');
logger.warn('Resource usage high');
logger.error('Failed to connect to database', { database: 'users', port: 5432 });

// Operation tracking
const operation = logger.startOperation('Data processing');
try {
  // Do some work
  // ...
  
  operation.end('completed successfully');
} catch (error) {
  operation.error(error);
}
```

## 🧪 Testing

All utility functions have comprehensive test coverage. You can run tests with:

```bash
npm test
```

## 🖼️ Example Logger Output

The logger produces formatted output like this:

```
2023-05-15 12:34:56 INFO: Application starting
2023-05-15 12:35:01 INFO: Starting operation: Data processing
2023-05-15 12:35:03 INFO: Operation Data processing: completed successfully
2023-05-15 12:35:10 WARN: Resource usage high
2023-05-15 12:35:20 ERROR: Failed to connect to database
{
  "database": "users",
  "port": 5432
}
```

## 🧩 Adding New Utilities

When adding new utility functions:

1. Group related functions in appropriate modules
2. Add JSDoc comments for documentation
3. Write unit tests in the `tests/` directory
4. Use promises or async/await for asynchronous operations
5. Handle errors gracefully

All utility functions should follow the project's error handling patterns and include appropriate logging. 
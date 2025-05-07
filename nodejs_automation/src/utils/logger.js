/**
 * Logger configuration module for the project.
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Ensure log directory exists
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format date for filename
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '');
};

// Create format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let metaStr = '';
    if (Object.keys(metadata).length > 0 && metadata.stack !== undefined) {
      metaStr = `\n${metadata.stack}`;
    } else if (Object.keys(metadata).length > 0) {
      metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return `${timestamp} ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// Configure the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'nodejs-automation' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    
    // File output
    new winston.transports.File({
      filename: path.join(logDir, `error-${getTimestamp()}.log`),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, `combined-${getTimestamp()}.log`),
    }),
  ],
});

// Add convenience methods
logger.startOperation = (operationName) => {
  logger.info(`Starting operation: ${operationName}`);
  return {
    end: (result = 'completed') => {
      logger.info(`Operation ${operationName}: ${result}`);
    },
    error: (error) => {
      logger.error(`Error in operation ${operationName}: ${error.message || error}`, 
        { error });
    }
  };
};

module.exports = logger; 
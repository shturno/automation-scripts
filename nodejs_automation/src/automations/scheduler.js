/**
 * Automated task scheduler using node-cron.
 */
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const fileUtils = require('../utils/fileUtils');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Directory for logs
const logDir = process.env.LOG_DIR || 'logs';
fileUtils.ensureDirectory(logDir);

/**
 * Task to backup data.
 * @returns {Promise<boolean>} True if the backup was successful
 */
async function backupData() {
  const operation = logger.startOperation('Data backup');
  
  try {
    const dataDir = process.env.DATA_DIR || 'data';
    const backupDir = path.join(dataDir, 'backups');
    
    // Ensure backup directory exists
    fileUtils.ensureDirectory(backupDir);
    
    // Find files to backup
    if (!fs.existsSync(dataDir)) {
      logger.info('Data directory does not exist');
      operation.end('no data directory');
      return true;
    }
    
    const filesToBackup = fs.readdirSync(dataDir)
      .filter(file => !file.startsWith('.') && file !== 'backups')
      .map(file => path.join(dataDir, file));
    
    if (filesToBackup.length === 0) {
      logger.info('No files to backup');
      operation.end('no files');
      return true;
    }
    
    // Create backup filename
    const backupFileName = `backup_${fileUtils.getTimestamp()}.zip`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Here you can implement the actual backup logic
    // For example, zipping files, copying to another location, etc.
    
    // Example of backup simulation
    logger.info(`Simulated backup: ${filesToBackup.length} files to ${backupPath}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulates processing time
    
    operation.end(`simulated backup completed: ${backupFileName}`);
    return true;
  } catch (error) {
    operation.error(error);
    return false;
  }
}

/**
 * Task to send reports.
 * @returns {Promise<boolean>} True if the report was sent successfully
 */
async function sendReport() {
  const operation = logger.startOperation('Report sending');
  
  try {
    // Logic to generate and send the report
    logger.info('Generating report...');
    
    // Sending simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    operation.end('simulated report sent');
    return true;
  } catch (error) {
    operation.error(error);
    return false;
  }
}

/**
 * Task to clean temporary files.
 * @returns {Promise<boolean>} True if the cleanup was successful
 */
async function cleanupTempFiles() {
  const operation = logger.startOperation('Temporary files cleanup');
  
  try {
    // Example: clean .tmp files in data directory
    const dataDir = process.env.DATA_DIR || 'data';
    
    if (!fs.existsSync(dataDir)) {
      operation.end('data directory does not exist');
      return true;
    }
    
    // Simulate search for temporary files
    const tempFiles = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.tmp'))
      .map(file => path.join(dataDir, file));
    
    logger.info(`Found ${tempFiles.length} temporary files`);
    
    // Here you would delete the actual files
    // tempFiles.forEach(file => fs.unlinkSync(file));
    
    operation.end(`simulated cleanup: ${tempFiles.length} files`);
    return true;
  } catch (error) {
    operation.error(error);
    return false;
  }
}

/**
 * Configures and starts the task scheduler.
 * @returns {boolean} True if the scheduler started successfully
 */
function startScheduler() {
  // Cron expressions from environment variables or defaults
  const backupSchedule = process.env.BACKUP_SCHEDULE || '0 2 * * *';    // 2:00 AM daily
  const reportSchedule = process.env.REPORT_SCHEDULE || '0 8 * * 1';    // 8:00 AM every Monday
  const cleanupSchedule = process.env.CLEANUP_SCHEDULE || '0 */12 * * *'; // Every 12 hours
  
  // Validate cron expressions
  const schedules = [
    { name: 'Backup', expression: backupSchedule },
    { name: 'Report', expression: reportSchedule },
    { name: 'Cleanup', expression: cleanupSchedule }
  ];
  
  let allValid = true;
  
  for (const schedule of schedules) {
    if (!cron.validate(schedule.expression)) {
      logger.error(`Invalid cron expression for ${schedule.name}: ${schedule.expression}`);
      allValid = false;
    }
  }
  
  if (!allValid) {
    logger.error('Error in cron expressions. Check the .env file');
    return false;
  }
  
  // Task scheduling
  logger.info(`Scheduling backup: ${backupSchedule}`);
  cron.schedule(backupSchedule, () => {
    backupData().catch(error => {
      logger.error('Error in backup task:', error);
    });
  });
  
  logger.info(`Scheduling report sending: ${reportSchedule}`);
  cron.schedule(reportSchedule, () => {
    sendReport().catch(error => {
      logger.error('Error in report task:', error);
    });
  });
  
  logger.info(`Scheduling file cleanup: ${cleanupSchedule}`);
  cron.schedule(cleanupSchedule, () => {
    cleanupTempFiles().catch(error => {
      logger.error('Error in cleanup task:', error);
    });
  });
  
  logger.info('Scheduler started successfully');
  return true;
}

// For direct execution
if (require.main === module) {
  // Run tasks now if requested
  const args = process.argv.slice(2);
  
  if (args.includes('--now')) {
    (async () => {
      if (args.includes('--backup')) {
        await backupData();
      }
      
      if (args.includes('--report')) {
        await sendReport();
      }
      
      if (args.includes('--cleanup')) {
        await cleanupTempFiles();
      }
      
      // If no specific task is requested, run all
      if (!args.includes('--backup') && !args.includes('--report') && !args.includes('--cleanup')) {
        await backupData();
        await sendReport();
        await cleanupTempFiles();
      }
    })();
  } else {
    // Start the scheduler
    startScheduler();
    logger.info('Scheduler running. Press Ctrl+C to exit');
  }
}

module.exports = {
  backupData,
  sendReport,
  cleanupTempFiles,
  startScheduler
}; 
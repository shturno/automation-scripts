# Task Automation Modules (Node.js)

This directory contains task automation scripts for scheduling and running recurring jobs using node-cron.

## 📋 Available Scripts

### Task Scheduler (`scheduler.js`)

A robust scheduler built on the `node-cron` library that provides:
- Configurable task scheduling with cron expressions
- Error handling and logging for each task
- Command-line interface for manual task execution
- Environment variable-based configuration

**Default Tasks:**
- `backupData`: Creates backups of important data files
- `sendReport`: Generates and distributes periodic reports
- `cleanupTempFiles`: Removes temporary files to free up space

## 🖼️ Example Usage

### Running as a Background Service

![Task Scheduler Running](../../docs/images/nodejs_scheduler.png)

### Command-line Arguments

```bash
# Start the scheduler service
node src/automations/scheduler.js

# Run specific tasks immediately
node src/automations/scheduler.js --now --backup
node src/automations/scheduler.js --now --report
node src/automations/scheduler.js --now --cleanup

# Run all tasks immediately
node src/automations/scheduler.js --now
```

## 🧩 Creating Your Own Tasks

You can add custom tasks by following this pattern:

```javascript
/**
 * Task to perform custom operation.
 * @returns {Promise<boolean>} True if the operation was successful
 */
async function customTask() {
  const operation = logger.startOperation('Custom operation');
  
  try {
    // Your task logic here
    // ...
    
    operation.end('custom task completed');
    return true;
  } catch (error) {
    operation.error(error);
    return false;
  }
}
```

Then register it in the scheduler:

```javascript
function startScheduler() {
  // Existing tasks
  schedule.scheduleJob(backupSchedule, backupData);
  schedule.scheduleJob(reportSchedule, sendReport);
  schedule.scheduleJob(cleanupSchedule, cleanupTempFiles);
  
  // Your custom task - run every 4 hours
  const customTaskSchedule = process.env.CUSTOM_SCHEDULE || '0 */4 * * *';
  schedule.scheduleJob(customTaskSchedule, customTask);
  
  logger.info('Scheduler started successfully');
  return true;
}
```

## 📊 Sample Output

Here's an example of the scheduler's log output:

```
2023-05-15 08:00:00 INFO: Starting task scheduler...
2023-05-15 08:00:00 INFO: Scheduling backup: 0 2 * * *
2023-05-15 08:00:00 INFO: Scheduling report sending: 0 8 * * 1
2023-05-15 08:00:00 INFO: Scheduling file cleanup: 0 */12 * * *
2023-05-15 08:00:00 INFO: Scheduler started successfully
2023-05-15 08:00:00 INFO: Scheduler running. Press Ctrl+C to exit
2023-05-15 12:00:00 INFO: Starting operation: Temporary files cleanup
2023-05-15 12:00:00 INFO: Found 3 temporary files
2023-05-15 12:00:00 INFO: Operation Temporary files cleanup: simulated cleanup: 3 files
```

## ⚙️ Configuration

The scheduler uses environment variables for configuration:

```
# Cron Schedules
BACKUP_SCHEDULE=0 2 * * *        # Daily at 2 AM
REPORT_SCHEDULE=0 8 * * 1        # Mondays at 8 AM
CLEANUP_SCHEDULE=0 */12 * * *    # Every 12 hours

# Paths
LOG_DIR=logs
DATA_DIR=data
``` 
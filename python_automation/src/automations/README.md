# Task Automation Modules

This directory contains automation scripts for scheduling and executing recurring tasks.

## 📋 Available Scripts

### Task Scheduler (`schedule_task.py`)

A flexible task scheduler built on the `schedule` library that handles:
- Task definitions with proper error handling
- Scheduling with various frequencies (daily, weekly, hourly)
- Command-line interface for manual execution
- Graceful shutdown handling
- Logging of task execution

**Default Tasks:**
- `task_backup_data`: Creates backups of data files
- `task_send_report`: Generates and sends summary reports 
- `task_clean_temp_files`: Cleans up temporary files periodically

## 🖼️ Example Usage

### Running as a Daemon

![Task Scheduler Running](../../docs/images/scheduler_running.png)

### Command-line Arguments

```bash
# Run specific task now
python -m src.automations.schedule_task --run backup

# Run all tasks now
python -m src.automations.schedule_task --run all

# Start scheduler as daemon
python -m src.automations.schedule_task --daemon
```

## 🧩 Adding Your Own Tasks

You can easily add your own tasks by following this pattern:

```python
def task_custom_name():
    """Custom task description."""
    logger.info(f"Executing custom task: {datetime.now()}")
    
    try:
        # Your task logic here
        # ...
        
        return True
    except Exception as e:
        logger.error(f"Error in custom task: {str(e)}")
        return False
```

Then add it to the scheduler:

```python
def setup_schedule():
    # Existing tasks
    schedule.every().day.at("02:00").do(task_backup_data)
    schedule.every().monday.at("08:00").do(task_send_report)
    schedule.every(12).hours.do(task_clean_temp_files)
    
    # Your custom task
    schedule.every().hour.do(task_custom_name)
    
    logger.info("Task scheduling configured")
```

## 📊 Sample Output

Here's what the log output looks like during execution:

```
2023-05-15 08:00:01 - Scheduler - INFO - Starting task scheduler...
2023-05-15 08:00:01 - Scheduler - INFO - Task scheduling configured
2023-05-15 08:00:01 - Scheduler - INFO - Scheduling backup: 0 2 * * *
2023-05-15 08:00:01 - Scheduler - INFO - Scheduling report sending: 0 8 * * 1
2023-05-15 08:00:01 - Scheduler - INFO - Scheduling file cleanup: 0 */12 * * *
2023-05-15 08:00:01 - Scheduler - INFO - Scheduler running. Press Ctrl+C to exit
2023-05-15 08:00:01 - Scheduler - INFO - Next tasks:
2023-05-15 08:00:01 - Scheduler - INFO - - Backup at 2023-05-16 02:00:00
2023-05-15 08:00:01 - Scheduler - INFO - - Report at 2023-05-20 08:00:00
2023-05-15 08:00:01 - Scheduler - INFO - - Cleanup at 2023-05-15 12:00:00
``` 
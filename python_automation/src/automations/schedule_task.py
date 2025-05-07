"""
Example of automated task scheduling.
"""
import time
import logging
import schedule
from datetime import datetime
import sys
import os
import signal
import argparse

# Add the root directory to the path for module imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.utils.data_utils import get_timestamp, ensure_directory


# Logging configuration
LOG_DIR = 'logs'
ensure_directory(LOG_DIR)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(LOG_DIR, f"scheduler_{get_timestamp()}.log"))
    ]
)

logger = logging.getLogger(__name__)


def task_backup_data():
    """Example task to backup data."""
    logger.info(f"Executing data backup: {datetime.now()}")
    # Backup implementation here
    
    # For example:
    # 1. List files to backup
    # 2. Compress them
    # 3. Store in backup location
    return True
    
    
def task_send_report():
    """Example task to send a report."""
    logger.info(f"Sending report: {datetime.now()}")
    # Report sending implementation here
    
    # For example:
    # 1. Generate report
    # 2. Format it
    # 3. Email to recipients
    return True
    
    
def task_clean_temp_files():
    """Example task to clean temporary files."""
    logger.info(f"Cleaning temporary files: {datetime.now()}")
    # Cleaning implementation here
    
    # For example:
    # 1. Find files older than X days
    # 2. Delete them
    return True


def setup_schedule():
    """Configure task scheduling."""
    # Run daily at 2:00 AM
    schedule.every().day.at("02:00").do(task_backup_data)
    
    # Run every Monday at 8:00 AM
    schedule.every().monday.at("08:00").do(task_send_report)
    
    # Run every 12 hours
    schedule.every(12).hours.do(task_clean_temp_files)
    
    logger.info("Task scheduling configured")


def handle_signal(signum, frame):
    """Handle termination signals gracefully."""
    logger.info(f"Received signal {signum}. Shutting down scheduler...")
    sys.exit(0)


def run_scheduler():
    """Run the scheduler in a loop."""
    # Register signal handlers
    signal.signal(signal.SIGINT, handle_signal)  # Handle Ctrl+C
    signal.signal(signal.SIGTERM, handle_signal) # Handle termination
    
    # Setup task scheduling
    setup_schedule()
    
    logger.info("Starting task scheduler...")
    
    # Run scheduled tasks
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("Scheduler interrupted by user")
    except Exception as e:
        logger.error(f"Scheduler error: {str(e)}")
        return False
        
    return True


def run_task_now(task_name):
    """
    Run a specific task immediately.
    
    Args:
        task_name: Name of the task to run
        
    Returns:
        True if the task was run successfully, False otherwise
    """
    tasks = {
        'backup': task_backup_data,
        'report': task_send_report,
        'clean': task_clean_temp_files
    }
    
    if task_name in tasks:
        logger.info(f"Running task '{task_name}' immediately")
        try:
            result = tasks[task_name]()
            logger.info(f"Task '{task_name}' completed")
            return result
        except Exception as e:
            logger.error(f"Error running task '{task_name}': {str(e)}")
            return False
    else:
        logger.error(f"Unknown task: {task_name}")
        return False


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Task scheduler')
    parser.add_argument('--run', choices=['backup', 'report', 'clean', 'all'],
                      help='Run a specific task immediately')
    parser.add_argument('--daemon', action='store_true',
                      help='Run the scheduler as a daemon')
    
    return parser.parse_args()


if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()
    
    # Ensure log directory exists
    ensure_directory(LOG_DIR)
    
    if args.run:
        # Run a specific task immediately
        if args.run == 'all':
            logger.info("Running all tasks")
            task_backup_data()
            task_send_report()
            task_clean_temp_files()
        else:
            run_task_now(args.run)
    else:
        # Start the scheduler
        run_scheduler() 
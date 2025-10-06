"""
Logging utility for AI Service.

Provides structured logging with different levels and formatting.
"""

import logging
import sys
from typing import Optional
from datetime import datetime
from ..config.settings import settings


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output."""

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m',       # Reset
    }

    def format(self, record):
        """Format log record with colors."""
        log_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']

        # Add color to levelname
        record.levelname = f"{log_color}{record.levelname}{reset}"

        # Format timestamp
        record.asctime = datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')

        return super().format(record)


def setup_logger(
    name: str,
    level: Optional[str] = None,
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Set up a logger with console and optional file handlers.

    Args:
        name: Logger name (usually __name__)
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path to write logs

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Set log level
    if level is None:
        level = 'DEBUG' if settings.environment == 'development' else 'INFO'

    logger.setLevel(getattr(logging, level.upper()))

    # Remove existing handlers
    logger.handlers = []

    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = ColoredFormatter(
        fmt='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger


# Create default logger
logger = setup_logger('ai-service')


def log_request(user_id: int, endpoint: str, method: str = "POST"):
    """Log incoming API request."""
    logger.info(f"📨 Request: {method} {endpoint} | User: {user_id}")


def log_response(user_id: int, endpoint: str, status: str = "success", duration_ms: Optional[float] = None):
    """Log API response."""
    duration_str = f" | Duration: {duration_ms:.2f}ms" if duration_ms else ""
    status_emoji = "✅" if status == "success" else "❌"
    logger.info(f"{status_emoji} Response: {endpoint} | User: {user_id} | Status: {status}{duration_str}")


def log_agent_action(action: str, details: Optional[str] = None):
    """Log AI agent actions."""
    details_str = f" | {details}" if details else ""
    logger.info(f"🤖 Agent: {action}{details_str}")


def log_tool_call(tool_name: str, user_id: int, success: bool = True):
    """Log agent tool execution."""
    status = "✓" if success else "✗"
    logger.debug(f"🔧 Tool: {tool_name} {status} | User: {user_id}")


def log_research(query: str, results_count: int):
    """Log research/web search."""
    logger.debug(f"🔍 Research: '{query}' | Found: {results_count} results")


def log_error(error: Exception, context: Optional[str] = None):
    """Log error with context."""
    context_str = f" | Context: {context}" if context else ""
    logger.error(f"❌ Error: {type(error).__name__}: {str(error)}{context_str}", exc_info=True)


def log_database_query(query_type: str, table: str, user_id: Optional[int] = None):
    """Log database queries."""
    user_str = f" | User: {user_id}" if user_id else ""
    logger.debug(f"💾 DB Query: {query_type} {table}{user_str}")


def log_cache_hit(key: str, hit: bool = True):
    """Log cache operations."""
    status = "HIT ✓" if hit else "MISS ✗"
    logger.debug(f"💨 Cache: {status} | Key: {key}")


# Export commonly used functions
__all__ = [
    'logger',
    'setup_logger',
    'log_request',
    'log_response',
    'log_agent_action',
    'log_tool_call',
    'log_research',
    'log_error',
    'log_database_query',
    'log_cache_hit',
]

import logging
import sys
from typing import Any, Dict
import structlog
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlAlchemyIntegration
from app.core.config import settings


def setup_logging() -> None:
    """Configure structured logging and Sentry error tracking."""
    
    # Configure Sentry if DSN is provided
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[
                FastApiIntegration(
                    auto_enabling_integrations=True,
                    transaction_style="endpoint"
                ),
                SqlAlchemyIntegration(),
            ],
            traces_sample_rate=0.1,  # Adjust for production
            profiles_sample_rate=0.1,
            environment=settings.NODE_ENV,
            release=settings.VERSION,
            before_send=filter_sentry_events,
        )

    # Configure structlog
    timestamper = structlog.processors.TimeStamper(fmt="ISO")
    
    shared_processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.DEBUG:
        # Pretty console output for development
        structlog.configure(
            processors=shared_processors + [
                structlog.dev.ConsoleRenderer(colors=True)
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
    else:
        # JSON output for production
        structlog.configure(
            processors=shared_processors + [
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )

    # Set log level based on settings
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # Reduce noise from external libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def filter_sentry_events(event: Dict[str, Any], hint: Dict[str, Any]) -> Dict[str, Any] | None:
    """Filter out unwanted events from Sentry."""
    
    # Don't send 4xx errors to Sentry
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        if hasattr(exc_value, 'status_code') and 400 <= exc_value.status_code < 500:
            return None
    
    # Filter out specific exceptions
    ignored_exceptions = [
        'ValidationError',
        'HTTPException',
    ]
    
    if event.get('exception', {}).get('values'):
        for exc in event['exception']['values']:
            if exc.get('type') in ignored_exceptions:
                return None
    
    return event


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


# Application-specific loggers
security_logger = get_logger("security")
analytics_logger = get_logger("analytics")
payment_logger = get_logger("payment")
ai_logger = get_logger("ai")

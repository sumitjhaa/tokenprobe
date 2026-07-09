"""
Comprehensive logging infrastructure for tokenprobe.

Provides phase logging (tracking build/execution phases) and error logging
with structured output to both console and log files.
"""

import logging
import sys
from datetime import datetime
from enum import Enum
from pathlib import Path


class Phase(Enum):
    """Execution phases for structured logging."""
    INIT = "INIT"
    DECODING = "DECODING"
    STATIC_CHECK = "STATIC_CHECK"
    ACTIVE_CHECK = "ACTIVE_CHECK"
    REPORTING = "REPORTING"
    CLI = "CLI"
    SHUTDOWN = "SHUTDOWN"


class LogLevel(Enum):
    """Custom log levels for phase tracking."""
    PHASE = 25
    PHASE_START = 24
    PHASE_END = 23
    CHECK_START = 22
    CHECK_END = 21
    ERROR_DETAIL = 15


LOG_DIR = Path("logs")
PHASE_LOG_FILE = LOG_DIR / "phases.log"
ERROR_LOG_FILE = LOG_DIR / "errors.log"
APP_LOG_FILE = LOG_DIR / "tokenprobe.log"


def _ensure_log_dir() -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)


def setup_logging(
    verbose: bool = False,
    log_to_file: bool = True,
    log_dir: Path | None = None,
) -> logging.Logger:
    """
    Configure the logging system for tokenprobe.

    Args:
        verbose: Enable debug-level console output.
        log_to_file: Write logs to files in addition to console.
        log_dir: Custom log directory (defaults to ./logs/).

    Returns:
        The configured root logger for tokenprobe.
    """
    global LOG_DIR, PHASE_LOG_FILE, ERROR_LOG_FILE, APP_LOG_FILE

    if log_dir:
        LOG_DIR = Path(log_dir)
        PHASE_LOG_FILE = LOG_DIR / "phases.log"
        ERROR_LOG_FILE = LOG_DIR / "errors.log"
        APP_LOG_FILE = LOG_DIR / "tokenprobe.log"

    if log_to_file:
        _ensure_log_dir()

    logging.addLevelName(LogLevel.PHASE.value, "PHASE")
    logging.addLevelName(LogLevel.PHASE_START.value, "PHASE_START")
    logging.addLevelName(LogLevel.PHASE_END.value, "PHASE_END")
    logging.addLevelName(LogLevel.CHECK_START.value, "CHECK_START")
    logging.addLevelName(LogLevel.CHECK_END.value, "CHECK_END")
    logging.addLevelName(LogLevel.ERROR_DETAIL.value, "ERROR_DETAIL")

    root_logger = logging.getLogger("tokenprobe")
    root_logger.setLevel(logging.DEBUG)
    root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stderr)
    console_level = logging.DEBUG if verbose else logging.WARNING
    console_handler.setLevel(console_level)
    console_fmt = logging.Formatter(
        "%(asctime)s [%(levelname)-8s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    console_handler.setFormatter(console_fmt)
    root_logger.addHandler(console_handler)

    if log_to_file:
        app_handler = logging.FileHandler(APP_LOG_FILE, mode="a")
        app_handler.setLevel(logging.DEBUG)
        app_fmt = logging.Formatter(
            "%(asctime)s [%(levelname)-8s] %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        app_handler.setFormatter(app_fmt)
        root_logger.addHandler(app_handler)

        phase_handler = logging.FileHandler(PHASE_LOG_FILE, mode="a")
        phase_handler.setLevel(LogLevel.PHASE_END.value)
        phase_fmt = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        phase_handler.setFormatter(phase_fmt)
        root_logger.addHandler(phase_handler)

        error_handler = logging.FileHandler(ERROR_LOG_FILE, mode="a")
        error_handler.setLevel(logging.ERROR)
        error_fmt = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        error_handler.setFormatter(error_fmt)
        root_logger.addHandler(error_handler)

    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Get a child logger under the tokenprobe namespace."""
    return logging.getLogger(f"tokenprobe.{name}")


class PhaseLogger:
    """
    Structured phase logger for tracking execution flow.

    Usage:
        pl = PhaseLogger("decoder")
        pl.start("Decoding JWT token")
        try:
            result = decode(token)
            pl.end("Decoding complete", success=True)
        except Exception as e:
            pl.end("Decoding failed", success=False, error=e)
    """

    def __init__(self, component: str):
        self.logger = get_logger(f"phase.{component}")
        self.component = component
        self._start_time: datetime | None = None

    def start(self, description: str, **context) -> None:
        self._start_time = datetime.now()
        ctx_str = f" | context={context}" if context else ""
        self.logger.log(
            LogLevel.PHASE_START.value,
            f"[{self.component}] START: {description}{ctx_str}",
        )

    def end(
        self,
        description: str,
        success: bool = True,
        error: Exception | None = None,
        **context,
    ) -> None:
        elapsed = ""
        if self._start_time:
            delta = datetime.now() - self._start_time
            elapsed = f" | elapsed={delta.total_seconds():.3f}s"

        status = "OK" if success else "FAIL"
        ctx_str = f" | context={context}" if context else ""
        err_str = f" | error={error}" if error else ""

        self.logger.log(
            LogLevel.PHASE_END.value,
            f"[{self.component}] END({status}): {description}{elapsed}{err_str}{ctx_str}",
        )
        self._start_time = None

    def info(self, message: str, **context) -> None:
        ctx_str = f" | {context}" if context else ""
        self.logger.log(LogLevel.PHASE.value, f"[{self.component}] {message}{ctx_str}")

    def check_start(self, check_name: str, token_preview: str = "") -> None:
        preview = f" | token={token_preview}..." if token_preview else ""
        self.logger.log(
            LogLevel.CHECK_START.value,
            f"[{self.component}] CHECK_START: {check_name}{preview}",
        )

    def check_end(self, check_name: str, findings_count: int, elapsed_ms: float) -> None:
        self.logger.log(
            LogLevel.CHECK_END.value,
            f"[{self.component}] CHECK_END: {check_name} | findings={findings_count} | elapsed={elapsed_ms:.1f}ms",
        )


class ErrorLogger:
    """
    Structured error logger with context capture.

    Usage:
        el = ErrorLogger("decoder")
        el.capture(e, context={"token_length": len(token)})
    """

    def __init__(self, component: str):
        self.logger = get_logger(f"error.{component}")
        self.component = component

    def capture(
        self,
        error: Exception,
        context: dict | None = None,
        severity: str = "error",
    ) -> None:
        ctx_str = f" | context={context}" if context else ""
        self.logger.log(
            LogLevel.ERROR_DETAIL.value if severity == "detail" else logging.ERROR,
            f"[{self.component}] {type(error).__name__}: {error}{ctx_str}",
            exc_info=(severity != "detail"),
        )

    def warning(self, message: str, **context) -> None:
        ctx_str = f" | {context}" if context else ""
        self.logger.warning(f"[{self.component}] {message}{ctx_str}")

    def critical(self, message: str, error: Exception | None = None, **context) -> None:
        ctx_str = f" | {context}" if context else ""
        err_str = f" | {type(error).__name__}: {error}" if error else ""
        self.logger.critical(f"[{self.component}] {message}{err_str}{ctx_str}")

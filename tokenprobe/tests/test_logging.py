"""
Test logging infrastructure.

Provides structured logging for test execution with
detailed output for debugging and reporting.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

TEST_LOG_DIR = Path("logs/tests")
TEST_LOG_FILE = TEST_LOG_DIR / "test_execution.log"
TEST_RESULT_FILE = TEST_LOG_DIR / "test_results.log"


def setup_test_logging() -> logging.Logger:
    """Configure test logging."""
    TEST_LOG_DIR.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("tokenprobe.tests")
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()

    file_handler = logging.FileHandler(TEST_LOG_FILE, mode="a")
    file_handler.setLevel(logging.DEBUG)
    file_fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(file_fmt)
    logger.addHandler(file_handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_fmt = logging.Formatter("%(levelname)-8s | %(message)s")
    console_handler.setFormatter(console_fmt)
    logger.addHandler(console_handler)

    return logger


def get_test_logger(name: str) -> logging.Logger:
    """Get a test logger."""
    return logging.getLogger(f"tokenprobe.tests.{name}")


class TestResultLogger:
    """Logger for test results."""

    def __init__(self):
        TEST_LOG_DIR.mkdir(parents=True, exist_ok=True)
        self.logger = logging.getLogger("tokenprobe.tests.results")
        self.logger.setLevel(logging.INFO)

        if not self.logger.handlers:
            handler = logging.FileHandler(TEST_RESULT_FILE, mode="a")
            handler.setFormatter(
                logging.Formatter(
                    "%(asctime)s | %(message)s",
                    datefmt="%Y-%m-%d %H:%M:%S",
                )
            )
            self.logger.addHandler(handler)

    def log_test_start(self, test_name: str, module: str) -> None:
        """Log test start."""
        self.logger.info(f"START | {module}::{test_name}")

    def log_test_pass(self, test_name: str, module: str, duration_ms: float) -> None:
        """Log test pass."""
        self.logger.info(f"PASS  | {module}::{test_name} | {duration_ms:.2f}ms")

    def log_test_fail(self, test_name: str, module: str, error: str, duration_ms: float) -> None:
        """Log test failure."""
        self.logger.info(f"FAIL  | {module}::{test_name} | {duration_ms:.2f}ms | {error}")

    def log_test_skip(self, test_name: str, module: str, reason: str) -> None:
        """Log test skip."""
        self.logger.info(f"SKIP  | {module}::{test_name} | {reason}")

    def log_suite_start(self, suite_name: str, test_count: int) -> None:
        """Log test suite start."""
        self.logger.info(f"SUITE_START | {suite_name} | tests={test_count}")

    def log_suite_end(self, suite_name: str, passed: int, failed: int, skipped: int) -> None:
        """Log test suite end."""
        self.logger.info(
            f"SUITE_END   | {suite_name} | passed={passed} failed={failed} skipped={skipped}"
        )


_test_result_logger: TestResultLogger | None = None


def get_result_logger() -> TestResultLogger:
    """Get the test result logger."""
    global _test_result_logger
    if _test_result_logger is None:
        _test_result_logger = TestResultLogger()
    return _test_result_logger

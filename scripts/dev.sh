#!/usr/bin/env bash
# Development workflow script for jwtcheck
# Provides common development tasks

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

show_help() {
    echo "=== JWT Misconfiguration Checker - Dev Workflow ==="
    echo ""
    echo "Usage: ./scripts/dev.sh <command>"
    echo ""
    echo "Commands:"
    echo "  test          Run all tests"
    echo "  test-verbose  Run tests with verbose output"
    echo "  test-cov      Run tests with coverage report"
    echo "  lint          Run linter (ruff)"
    echo "  lint-fix      Auto-fix linting issues"
    echo "  format        Format code (ruff format)"
    echo "  check         Run all checks (lint + test)"
    echo "  clean         Clean build artifacts and logs"
    echo "  demo          Run demo with sample tokens"
    echo "  help          Show this help message"
    echo ""
}

run_test() {
    echo -e "${BLUE}Running tests...${NC}"
    pytest -v
}

run_test_verbose() {
    echo -e "${BLUE}Running tests (verbose)...${NC}"
    pytest -v -s
}

run_test_cov() {
    echo -e "${BLUE}Running tests with coverage...${NC}"
    pytest --cov=jwtcheck --cov-report=term-missing --cov-report=html
    echo -e "${GREEN}Coverage report: htmlcov/index.html${NC}"
}

run_lint() {
    echo -e "${BLUE}Running linter...${NC}"
    ruff check jwtcheck/
}

run_lint_fix() {
    echo -e "${BLUE}Auto-fixing linting issues...${NC}"
    ruff check --fix jwtcheck/
}

run_format() {
    echo -e "${BLUE}Formatting code...${NC}"
    ruff format jwtcheck/
}

run_check() {
    echo -e "${BLUE}Running all checks...${NC}"
    echo ""
    run_lint
    echo ""
    run_test
}

run_clean() {
    echo -e "${BLUE}Cleaning build artifacts...${NC}"
    rm -rf build/ dist/ *.egg-info/ .pytest_cache/ .coverage htmlcov/
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    echo -e "${GREEN}✓ Cleaned${NC}"
}

run_demo() {
    echo -e "${BLUE}Running demo...${NC}"
    echo ""
    echo "1. Clean token (gold standard):"
    python3 -c "from jwtcheck.tests.fixtures.tokens import GOLD_STANDARD_TOKEN; print(GOLD_STANDARD_TOKEN)" | \
        xargs jwtcheck --no-log-file 2>&1 | head -20
    echo ""
    echo "2. Token with alg: none (Critical):"
    python3 -c "from jwtcheck.tests.fixtures.tokens import ALG_NONE_TOKEN; print(ALG_NONE_TOKEN)" | \
        xargs jwtcheck --no-log-file 2>&1 | head -20
    echo ""
    echo "3. JSON output:"
    python3 -c "from jwtcheck.tests.fixtures.tokens import ALG_NONE_TOKEN; print(ALG_NONE_TOKEN)" | \
        xargs jwtcheck --json --no-log-file 2>&1 | grep -v "^PHASE" | grep -v "^ERROR" | head -20
}

case "${1:-help}" in
    test)
        run_test
        ;;
    test-verbose)
        run_test_verbose
        ;;
    test-cov)
        run_test_cov
        ;;
    lint)
        run_lint
        ;;
    lint-fix)
        run_lint_fix
        ;;
    format)
        run_format
        ;;
    check)
        run_check
        ;;
    clean)
        run_clean
        ;;
    demo)
        run_demo
        ;;
    help|*)
        show_help
        ;;
esac

#!/usr/bin/env bash
# Installation script for jwtcheck
# Sets up the project in development mode

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== JWT Misconfiguration Checker - Installation ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Step 1: Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
    echo -e "${RED}✗ Python 3.11+ required (found $PYTHON_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $PYTHON_VERSION${NC}"
echo ""

echo "Step 2: Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}! Virtual environment already exists${NC}"
fi
echo ""

echo "Step 3: Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

echo "Step 4: Upgrading pip..."
pip install --upgrade pip --quiet
echo -e "${GREEN}✓ pip upgraded${NC}"
echo ""

echo "Step 5: Installing jwtcheck in development mode..."
pip install -e ".[dev]" --quiet
echo -e "${GREEN}✓ jwtcheck installed${NC}"
echo ""

echo "Step 6: Creating log directories..."
mkdir -p logs logs/tests
echo -e "${GREEN}✓ Log directories created${NC}"
echo ""

echo "Step 7: Verifying installation..."
if jwtcheck --version &> /dev/null; then
    echo -e "${GREEN}✓ jwtcheck command available${NC}"
else
    echo -e "${RED}✗ jwtcheck command not found${NC}"
    exit 1
fi
echo ""

echo "Step 8: Running tests..."
if pytest --tb=short -q; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${YELLOW}! Some tests failed (check logs)${NC}"
fi
echo ""

echo -e "${GREEN}=== Installation complete ===${NC}"
echo ""
echo "To activate the virtual environment:"
echo "  source venv/bin/activate"
echo ""
echo "To run jwtcheck:"
echo "  jwtcheck <token>"
echo ""
echo "To run tests:"
echo "  pytest"
echo ""
echo "To check environment:"
echo "  ./scripts/check_env.sh"

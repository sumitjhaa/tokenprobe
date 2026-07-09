#!/usr/bin/env bash
# Environment check script for jwtcheck
# Verifies all dependencies and configuration are correct

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== JWT Misconfiguration Checker - Environment Check ==="
echo ""

ERRORS=0

check_command() {
    local cmd=$1
    local desc=$2
    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $desc: $(command -v $cmd)"
    else
        echo -e "${RED}✗${NC} $desc: NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
}

check_python_version() {
    local required=$1
    local current=$(python3 --version 2>&1 | awk '{print $2}')
    local current_major=$(echo $current | cut -d. -f1)
    local current_minor=$(echo $current | cut -d. -f2)
    local required_major=$(echo $required | cut -d. -f1)
    local required_minor=$(echo $required | cut -d. -f2)

    if [ "$current_major" -gt "$required_major" ] || \
       ([ "$current_major" -eq "$required_major" ] && [ "$current_minor" -ge "$required_minor" ]); then
        echo -e "${GREEN}✓${NC} Python version: $current (required: >=$required)"
    else
        echo -e "${RED}✗${NC} Python version: $current (required: >=$required)"
        ERRORS=$((ERRORS + 1))
    fi
}

check_directory() {
    local dir=$1
    local desc=$2
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $desc: $dir exists"
    else
        echo -e "${YELLOW}!${NC} $desc: $dir not found (will be created)"
        mkdir -p "$dir"
    fi
}

echo "Checking Python installation..."
check_python_version "3.11"
check_command "python3" "Python 3"
check_command "pip3" "pip3"
echo ""

echo "Checking project structure..."
check_directory "jwtcheck" "Source directory"
check_directory "jwtcheck/tests" "Test directory"
check_directory "logs" "Log directory"
echo ""

echo "Checking required files..."
for file in pyproject.toml README.md LICENSE; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

echo "Checking Python dependencies..."
if pip3 show pyjwt &> /dev/null; then
    echo -e "${GREEN}✓${NC} pyjwt installed"
else
    echo -e "${YELLOW}!${NC} pyjwt not installed (run install.sh)"
fi

if pip3 show click &> /dev/null; then
    echo -e "${GREEN}✓${NC} click installed"
else
    echo -e "${YELLOW}!${NC} click not installed (run install.sh)"
fi

if pip3 show rich &> /dev/null; then
    echo -e "${GREEN}✓${NC} rich installed"
else
    echo -e "${YELLOW}!${NC} rich not installed (run install.sh)"
fi
echo ""

echo "Checking development tools..."
check_command "pytest" "pytest"
check_command "ruff" "ruff"
echo ""

echo "Checking jwtcheck installation..."
if command -v jwtcheck &> /dev/null; then
    echo -e "${GREEN}✓${NC} jwtcheck installed: $(jwtcheck --version 2>&1 | head -1)"
else
    echo -e "${YELLOW}!${NC} jwtcheck not installed (run install.sh)"
fi
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}=== Environment check passed ===${NC}"
    exit 0
else
    echo -e "${RED}=== Environment check failed with $ERRORS error(s) ===${NC}"
    exit 1
fi

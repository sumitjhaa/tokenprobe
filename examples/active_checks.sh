#!/usr/bin/env bash
# Example: Active checks with safety confirmation
# Usage: ./examples/active_checks.sh <jwt_token> <target_url>

set -euo pipefail

if [ $# -lt 2 ]; then
    echo "Usage: $0 <jwt_token> <target_url>"
    echo "Example: $0 eyJhbGci... https://api.example.com/auth"
    echo ""
    echo "WARNING: Active checks probe a live endpoint."
    echo "Only use on systems you own or have permission to test."
    exit 1
fi

TOKEN="$1"
TARGET="$2"

echo "=== Active JWT Security Check ==="
echo ""
echo "Target: $TARGET"
echo "Token:  ${TOKEN:0:50}..."
echo ""
echo "WARNING: This will probe the target endpoint."
echo "Only proceed if you own or have authorization to test this system."
echo ""

read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Running active checks..."
echo ""

# Run jwtcheck with active checks
jwtcheck --active --target "$TARGET" --i-own-this-system "$TOKEN"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ No critical security issues detected"
else
    echo "✗ Security issues detected (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

#!/usr/bin/env bash
# Example: Basic JWT audit
# Usage: ./examples/basic_audit.sh <jwt_token>

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <jwt_token>"
    echo "Example: $0 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    exit 1
fi

TOKEN="$1"

echo "=== JWT Security Audit ==="
echo ""
echo "Token: ${TOKEN:0:50}..."
echo ""

# Run tokenprobe with text output
tokenprobe "$TOKEN"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ No critical/high security issues found"
else
    echo "✗ Security issues detected (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

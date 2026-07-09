#!/usr/bin/env bash
# Example: CI integration with JSON output
# Usage: ./examples/ci_integration.sh <jwt_token>

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <jwt_token>"
    exit 1
fi

TOKEN="$1"
REPORT_FILE="jwt-audit-report.json"

echo "Running JWT security audit..."

# Run tokenprobe with JSON output
tokenprobe --json "$TOKEN" > "$REPORT_FILE"

EXIT_CODE=$?

# Parse the report
CRITICAL=$(jq -r '.summary.critical' "$REPORT_FILE")
HIGH=$(jq -r '.summary.high' "$REPORT_FILE")
MEDIUM=$(jq -r '.summary.medium' "$REPORT_FILE")
TOTAL=$(jq -r '.summary.total' "$REPORT_FILE")

echo ""
echo "=== Audit Summary ==="
echo "Critical: $CRITICAL"
echo "High:     $HIGH"
echo "Medium:   $MEDIUM"
echo "Total:    $TOTAL"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ Audit passed"
else
    echo "✗ Audit failed with $CRITICAL critical and $HIGH high severity issues"
    echo ""
    echo "Findings:"
    jq -r '.findings[] | "  [\(.severity | ascii_upcase)] \(.check): \(.message)"' "$REPORT_FILE"
fi

echo ""
echo "Full report saved to: $REPORT_FILE"

exit $EXIT_CODE

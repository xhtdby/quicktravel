#!/bin/bash
# QuickTravel Test Runner - Unix Shell Script

echo ""
echo "========================================================"
echo "  QuickTravel Automated Tests"
echo "========================================================"
echo ""

# Run validation tests
echo "[1/1] Running validation tests..."
echo ""
node validate-routes.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================================"
    echo "  ALL TESTS PASSED!"
    echo "========================================================"
    exit 0
else
    echo ""
    echo "========================================================"
    echo "  TESTS FAILED - Review output above"
    echo "========================================================"
    exit 1
fi

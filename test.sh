#!/bin/bash
# QuickTravel Test Runner

echo ""
echo "========================================================"
echo "  QuickTravel Automated Tests"
echo "========================================================"
echo ""

node tests/validate-routes.js

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

#!/bin/bash
# Test runner script for Bats tests
# Usage: ./tests/run_tests.sh [test_file]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if bats is installed
if ! command -v bats &> /dev/null; then
    echo "❌ Bats is not installed."
    echo "Install with: sudo apt-get install -y bats"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Bats Tests${NC}"
echo ""

# If specific test file provided, run only that
if [ $# -gt 0 ]; then
    TEST_FILE="$1"
    if [ ! -f "$TEST_FILE" ]; then
        echo "❌ Test file not found: $TEST_FILE"
        exit 1
    fi
    echo -e "${BLUE}Running: $TEST_FILE${NC}"
    bats -t "$TEST_FILE"
else
    # Run all tests
    echo -e "${BLUE}Running all tests...${NC}"
    echo ""
    
    echo -e "${GREEN}📋 Unit Tests${NC}"
    bats -t "$SCRIPT_DIR/restore_christine.bats"
    echo ""
    
    echo -e "${GREEN}🔗 Integration Tests${NC}"
    bats -t "$SCRIPT_DIR/integration.bats"
    echo ""
    
    echo -e "${GREEN}✅ All tests completed${NC}"
fi


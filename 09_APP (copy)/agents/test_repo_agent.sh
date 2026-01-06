#!/bin/bash
# Test script for Repo Agent
# Creates a test file and processes it

REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
GENERATED_DIR="$REPO_ROOT/09_APP/Generated"
TEST_FILE="$GENERATED_DIR/test_intake_$(date +%Y%m%d_%H%M%S).csv"

echo "🧪 Testing Repo Agent"
echo "===================="
echo ""
echo "Creating test file: $TEST_FILE"

# Create a simple test CSV
cat > "$TEST_FILE" <<EOF
date,title,description
2024-12-29,Test Event,This is a test file for the Repo Agent
EOF

echo "✅ Test file created"
echo ""
echo "Now run the Repo Agent:"
echo "  python3 $REPO_ROOT/09_APP/agents/repo_agent.py"
echo ""
echo "Or process this file directly:"
echo "  python3 $REPO_ROOT/09_APP/agents/repo_agent.py $TEST_FILE"


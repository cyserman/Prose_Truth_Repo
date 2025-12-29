#!/usr/bin/env bash
# Accessibility Audit Script for ProSe Legal DB
# Runs axe-core and Lighthouse accessibility checks

set -euo pipefail

REPORT_DIR="a11y-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_URL="${BASE_URL:-http://localhost:5173}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ProSe Legal DB - Accessibility Audit Runner          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
if ! curl -s "${BASE_URL}" > /dev/null 2>&1; then
  echo -e "${RED}✗ Dev server not running at ${BASE_URL}${NC}"
  echo -e "${YELLOW}  Please start it with: npm run dev${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dev server detected at ${BASE_URL}${NC}"
echo ""

# Create report directory
mkdir -p "$REPORT_DIR"

# Routes to test
ROUTES=(
  "/"
  "/#timeline"
  "/#organizer"
  "/#exhibits"
  "/#strategy"
)

echo -e "${BLUE}Testing Routes:${NC}"
for route in "${ROUTES[@]}"; do
  echo "  - ${route}"
done
echo ""

# Function to run axe-core
run_axe() {
  local route=$1
  local clean_name=$(echo "$route" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/^-//')
  local output_file="${REPORT_DIR}/axe-${clean_name}-${TIMESTAMP}.json"
  
  echo -e "${YELLOW}Running axe-core on ${route}...${NC}"
  
  if npx --yes @axe-core/cli "${BASE_URL}${route}" \
    --save \
    --output "$output_file" 2>&1 | grep -v "deprecated"; then
    echo -e "${GREEN}✓ axe-core completed: ${output_file}${NC}"
  else
    echo -e "${RED}✗ axe-core failed for ${route}${NC}"
    return 1
  fi
}

# Function to run Lighthouse
run_lighthouse() {
  local route=$1
  local clean_name=$(echo "$route" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/^-//')
  local output_file="${REPORT_DIR}/lighthouse-${clean_name}-${TIMESTAMP}"
  
  echo -e "${YELLOW}Running Lighthouse on ${route}...${NC}"
  
  if npx --yes lighthouse "${BASE_URL}${route}" \
    --only-categories=accessibility,best-practices \
    --output=json \
    --output=html \
    --output-path="$output_file" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet 2>&1 | grep -E "(Accessibility|Best)"; then
    echo -e "${GREEN}✓ Lighthouse completed: ${output_file}.report.html${NC}"
  else
    echo -e "${RED}✗ Lighthouse failed for ${route}${NC}"
    return 1
  fi
}

# Main test loop
FAILED=0
for route in "${ROUTES[@]}"; do
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Testing: ${route}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  if ! run_axe "$route"; then
    FAILED=$((FAILED + 1))
  fi
  
  echo ""
  
  if ! run_lighthouse "$route"; then
    FAILED=$((FAILED + 1))
  fi
done

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Accessibility Audit Summary                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Reports saved to: ${GREEN}${REPORT_DIR}/${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All accessibility audits completed successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review HTML reports: open ${REPORT_DIR}/lighthouse-*.html"
  echo "  2. Check axe violations: cat ${REPORT_DIR}/axe-*.json | jq '.violations'"
  echo "  3. Manual keyboard test: Tab through UI, check focus indicators"
  exit 0
else
  echo -e "${RED}✗ ${FAILED} audit(s) failed${NC}"
  echo ""
  echo "Check the error messages above for details"
  exit 1
fi


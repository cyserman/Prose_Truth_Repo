#!/bin/bash
# Safe PR9 Pull Script - Handles secrets properly
# This script pulls PR9 into a local branch for testing before merging

set -e

echo "🔒 Safe PR9 Pull Script"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Ensure we're on a clean state
echo -e "${YELLOW}Step 1: Checking git status...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}⚠️  Warning: You have uncommitted changes.${NC}"
    echo "Please commit or stash them first:"
    echo "  git stash"
    echo "  OR"
    echo "  git commit -am 'WIP: before PR9 merge'"
    exit 1
fi

# Step 2: Fetch latest from origin
echo -e "${YELLOW}Step 2: Fetching latest from origin...${NC}"
git fetch origin

# Step 3: Create a local branch for PR9 testing
PR9_BRANCH="local/pr9-test-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}Step 3: Creating local branch: ${PR9_BRANCH}${NC}"
git checkout -b "$PR9_BRANCH" main

# Step 4: Check if PR9 branch exists (user needs to provide branch name)
echo ""
echo -e "${YELLOW}Step 4: PR9 Branch Selection${NC}"
echo "Available remote branches:"
git branch -r | grep -v HEAD | head -15
echo ""
read -p "Enter the PR9 branch name (e.g., origin/pr9-branch-name or pull/9/head): " PR9_REMOTE_BRANCH

# Step 5: Merge PR9 into local branch
echo -e "${YELLOW}Step 5: Merging PR9 into local branch...${NC}"
if git merge "$PR9_REMOTE_BRANCH" --no-edit; then
    echo -e "${GREEN}✅ PR9 merged successfully${NC}"
else
    echo -e "${RED}❌ Merge conflicts detected. Resolve them manually.${NC}"
    echo "After resolving:"
    echo "  git add ."
    echo "  git commit"
    exit 1
fi

# Step 6: Check for secrets in the merged code
echo -e "${YELLOW}Step 6: Scanning for secrets...${NC}"
if [ -f "./scripts/scan-secrets.sh" ]; then
    ./scripts/scan-secrets.sh
else
    echo -e "${YELLOW}⚠️  Secrets scanner not found. Manual check recommended.${NC}"
fi

# Step 7: Check for .env file and guide user
echo ""
echo -e "${YELLOW}Step 7: Environment Setup${NC}"
ENV_FILE="09_APP/prose-legal-db-app/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${GREEN}📝 Creating .env file from example...${NC}"
    if [ -f "${ENV_FILE}.example" ]; then
        cp "${ENV_FILE}.example" "$ENV_FILE"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit ${ENV_FILE} and add your API key${NC}"
        echo "The API key from PR9 should be added here (NOT committed to git)"
    else
        echo -e "${RED}⚠️  .env.example not found. Create ${ENV_FILE} manually.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
    echo -e "${YELLOW}⚠️  Verify it contains the new API key from PR9${NC}"
fi

# Step 8: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ PR9 Pull Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Current branch: $PR9_BRANCH"
echo ""
echo "Next steps:"
echo "1. Edit ${ENV_FILE} and add the API key from PR9"
echo "2. Test the new features:"
echo "   cd 09_APP/prose-legal-db-app"
echo "   npm install  # if needed"
echo "   npm run dev"
echo ""
echo "3. Once tested, merge to your feature branch:"
echo "   git checkout cursor/local-feature-and-ssl-setup-cec2"
echo "   git merge $PR9_BRANCH"
echo ""
echo "4. Or merge directly to main (if approved):"
echo "   git checkout main"
echo "   git merge $PR9_BRANCH"
echo ""

#!/usr/bin/env bash
# Manual Secrets Scanner for PROSE_TRUTH_REPO
# Scans for common secret patterns without requiring Python

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PROSE Legal DB - Secrets Scanner                ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

FOUND=0

# Define patterns to search for
declare -A PATTERNS=(
  ["AWS Keys"]="AKIA[0-9A-Z]{16}"
  ["Private Keys"]="-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----"
  ["Generic API Keys"]="['\"]?api[_-]?key['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?"
  ["Generic Secrets"]="['\"]?secret['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?"
  ["Passwords"]="['\"]?password['\"]?\s*[:=]\s*['\"]?[^'\"]{8,}['\"]?"
  ["Auth Tokens"]="['\"]?token['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?"
  ["Firebase API Keys"]="AIza[0-9A-Za-z_-]{35}"
  ["Gemini API Keys"]="AIza[0-9A-Za-z_-]{35}"
)

# Directories to exclude
EXCLUDE_DIRS=(
  "node_modules"
  ".git"
  "dist"
  "build"
  ".cache"
  "coverage"
)

# Build exclusion string for grep
EXCLUDE_GREP=""
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_GREP="$EXCLUDE_GREP --exclude-dir=$dir"
done

# Scan for each pattern
for name in "${!PATTERNS[@]}"; do
  pattern="${PATTERNS[$name]}"
  echo -e "${YELLOW}Scanning for: ${name}${NC}"
  
  if results=$(grep -rniE $EXCLUDE_GREP "$pattern" . 2>/dev/null); then
    echo -e "${RED}✗ POTENTIAL SECRET FOUND:${NC}"
    echo "$results" | head -10
    echo ""
    FOUND=$((FOUND + 1))
  else
    echo -e "${GREEN}✓ No matches${NC}"
  fi
  echo ""
done

# Check for common secret filenames
echo -e "${YELLOW}Checking for sensitive files...${NC}"
SENSITIVE_FILES=(
  ".env"
  ".env.local"
  ".env.production"
  "secrets.json"
  "credentials.json"
  "service-account.json"
  "firebase-adminsdk.json"
)

for file in "${SENSITIVE_FILES[@]}"; do
  if found_files=$(find . -type f -name "$file" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null); then
    if [ -n "$found_files" ]; then
      echo -e "${RED}✗ Found sensitive file: ${found_files}${NC}"
      FOUND=$((FOUND + 1))
    fi
  fi
done

# Summary
echo ""
echo -e "${YELLOW}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Scan Summary                                     ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ No secrets detected!${NC}"
  echo ""
  echo "Note: This is a basic scan. For production, install:"
  echo "  pip3 install detect-secrets"
  echo "  detect-secrets scan --baseline .secrets.baseline"
  exit 0
else
  echo -e "${RED}⚠ FOUND ${FOUND} POTENTIAL SECRET(S)${NC}"
  echo ""
  echo "Actions required:"
  echo "  1. Review findings above"
  echo "  2. If false positive: add to .gitignore or exclude pattern"
  echo "  3. If real secret: ROTATE credentials immediately"
  echo "  4. Remove from git history if already committed"
  echo ""
  echo "To remove from history:"
  echo "  git filter-branch --force --index-filter \\"
  echo "    'git rm --cached --ignore-unmatch <FILE>' --prune-empty -- --all"
  exit 1
fi


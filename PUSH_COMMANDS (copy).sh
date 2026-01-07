#!/usr/bin/env bash
# Pre-push commands for ProSe Legal DB v1.0-alpha
# Run these commands in order to push to GitHub

set -e

echo "🚀 ProSe Legal DB v1.0-alpha - Push Script"
echo "=========================================="
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  Warning: You're on branch '$CURRENT_BRANCH', not 'main'"
  read -p "Continue anyway? (y/N): " confirm
  if [ "$confirm" != "y" ]; then
    echo "Aborted."
    exit 1
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  You have uncommitted changes:"
  git status --short
  read -p "Commit them now? (y/N): " confirm
  if [ "$confirm" = "y" ]; then
    git add .
    git commit -m "Release: ProSe Legal DB v1.0-alpha (final)"
  else
    echo "Please commit or stash changes first."
    exit 1
  fi
fi

# Verify tag exists
if ! git tag -l | grep -q "v1.0-alpha"; then
  echo "⚠️  Tag v1.0-alpha not found. Creating it now..."
  git tag -a v1.0-alpha -m "Release v1.0-alpha: ProSe Legal DB - All core features complete"
fi

# Show what will be pushed
echo ""
echo "📦 Ready to push:"
echo "   Commits: $(git rev-list --count origin/main..HEAD 2>/dev/null || echo 'all')"
echo "   Tag: v1.0-alpha"
echo ""

# Confirm
read -p "Push to GitHub? (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "Aborted."
  exit 0
fi

# Push commits
echo ""
echo "📤 Pushing commits to main..."
git push origin main

# Push tag
echo ""
echo "📤 Pushing tag v1.0-alpha..."
git push origin v1.0-alpha

echo ""
echo "✅ Push complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to GitHub → Releases → Draft new release"
echo "   2. Select tag: v1.0-alpha"
echo "   3. Copy content from RELEASE_ANNOUNCEMENT.md"
echo "   4. Check 'Pre-release' and publish"
echo ""
echo "   5. Verify workflows in Actions tab"
echo "   6. Add badges to README (see README_BADGES.md)"
echo ""


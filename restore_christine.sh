#!/bin/bash
# CHRISTINE RESTORATION LAUNCHER
# Installs Node, locates backup, restores repo, runs npm install, launches dev server
#
# Usage: ./restore_christine.sh [OPTIONS]
# Options:
#   --dry-run    Show what would be executed without making changes
#   --help       Show this help message
#   --yes        Skip confirmation prompts (use with caution)

set -euo pipefail

# Configuration
DRY_RUN=false
AUTO_YES=false
REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
APP_PATH="$REPO_ROOT/09_APP/prose-legal-db-app"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --yes)
            AUTO_YES=true
            shift
            ;;
        --help|-h)
            cat <<EOF
CHRISTINE RESTORATION LAUNCHER

Purpose: One-command restoration and dev server launch for Prose Truth Repo

What it does:
  1. Updates system packages (apt)
  2. Installs Node.js 20 LTS (if needed)
  3. Locates React app directory
  4. Runs npm install
  5. Launches dev server

Options:
  --dry-run    Show what would be executed without making changes
  --yes        Skip confirmation prompts (use with caution)
  --help, -h   Show this help message

Safety Notes:
  - Requires sudo for apt operations
  - Review script before first run
  - Use --dry-run to preview changes
  - Backup data before restoration

Examples:
  ./restore_christine.sh --dry-run    # Preview operations
  ./restore_christine.sh               # Run with confirmations
  ./restore_christine.sh --yes         # Run without prompts

EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Helper functions
exit_with_pause() {
    echo -e "\n⚠️  PROCESS INTERRUPTED: $1"
    if [ "$DRY_RUN" = false ]; then
        read -r -p "Press [Enter] to keep this window open for debugging..."
    fi
    exit 1
}

run_cmd() {
    local cmd="$*"
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY RUN] Would execute: $cmd"
        return 0
    else
        eval "$cmd"
    fi
}

confirm() {
    local prompt="$1"
    if [ "$AUTO_YES" = true ] || [ "$DRY_RUN" = true ]; then
        echo "✓ Auto-confirmed: $prompt"
        return 0
    fi
    read -r -p "$prompt (y/N): " response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Main execution
echo "🛡️ CHRISTINE: Initializing Restoration..."
if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE: No changes will be made"
fi

# 1. SYSTEM PREP
echo "📦 Installing dependencies..."
if ! confirm "Proceed with system package updates?"; then
    exit_with_pause "User cancelled system prep"
fi

run_cmd "sudo apt-get update -y" || echo "⚠️ Update failed, proceeding..."
run_cmd "sudo apt-get install -y curl git build-essential" || exit_with_pause "Failed to install dependencies."

# 2. NODE CHECK
if ! command -v npm &> /dev/null; then
    echo "⚙️  Installing Node.js LTS..."
    if ! confirm "Install Node.js 20 LTS?"; then
        exit_with_pause "Node.js installation cancelled"
    fi
    run_cmd "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -" || exit_with_pause "Failed to source Node."
    run_cmd "sudo apt-get install -y nodejs" || exit_with_pause "Failed to install Node."
else
    echo "✅ Node $(node -v) present"
fi

# 3. LOCATE REPO
if [ ! -d "$APP_PATH" ]; then
    exit_with_pause "App folder not found at: $APP_PATH"
fi

# 4. INSTALL & LAUNCH
if ! confirm "Proceed with npm install and dev server launch?"; then
    exit_with_pause "User cancelled installation"
fi

run_cmd "cd \"$APP_PATH\"" || exit_with_pause "Directory access denied."
echo "📍 Location: $(pwd)"

echo "🔧 Running npm install..."
run_cmd "npm install --prefer-offline --no-audit" || exit_with_pause "npm install failed."

if [ "$DRY_RUN" = false ]; then
    echo "🚀 Launching dev server at http://localhost:5173/"
    npm run dev || exit_with_pause "Server stopped unexpectedly."
else
    echo "[DRY RUN] Would launch: npm run dev"
fi

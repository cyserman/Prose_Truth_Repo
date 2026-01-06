#!/usr/bin/env bash
# CHRISTINE RESTORATION LAUNCHER
# Installs Node, locates backup, restores repo, runs npm install, launches dev server
#
# Usage: ./restore_christine.sh [OPTIONS]
# Options:
#   --dry-run       Show what would be executed without making changes
#   --yes           Skip confirmation prompts (use with caution)
#   --backup-dir    Specify backup directory (default: backups/YYYYMMDD-HHMMSS)
#   --log           Specify log file path (default: logs/restore-YYYYMMDD-HHMMSS.log)
#   --help, -h      Show this help message

set -euo pipefail

# Configuration
DRY_RUN=false
AUTO_YES=false
BACKUP_DIR=""
LOG_FILE=""

# Auto-detect repo root (script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$SCRIPT_DIR}"
APP_PATH="$REPO_ROOT/09_APP/prose-legal-db-app"

# Initialize backup and log directories
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEFAULT_BACKUP_DIR="$REPO_ROOT/backups/$TIMESTAMP"
DEFAULT_LOG_FILE="$REPO_ROOT/logs/restore-$TIMESTAMP.log"

# Helper function to run commands with logging and dry-run support
run_cmd() {
  local cmd="$*"
  echo "[CMD] $cmd" >> "$LOG_FILE"
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute: $cmd"
  else
    eval "$cmd"
  fi
}

# Parse arguments
parse_args() {
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
      --backup-dir)
        BACKUP_DIR="$2"
        shift 2
        ;;
      --log)
        LOG_FILE="$2"
        shift 2
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
    esac
  done

  # Set defaults if not provided
  BACKUP_DIR="${BACKUP_DIR:-$DEFAULT_BACKUP_DIR}"
  LOG_FILE="${LOG_FILE:-$DEFAULT_LOG_FILE}"

  # Create directories
  mkdir -p "$(dirname "$BACKUP_DIR")"
  mkdir -p "$(dirname "$LOG_FILE")"
}

# Show help message
show_help() {
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
  --dry-run       Show what would be executed without making changes
  --yes           Skip confirmation prompts (use with caution)
  --backup-dir    Specify backup directory (default: backups/YYYYMMDD-HHMMSS)
  --log           Specify log file path (default: logs/restore-YYYYMMDD-HHMMSS.log)
  --help, -h      Show this help message

Usage Examples:
  # Dry run to see what would happen
  ./restore_christine.sh --dry-run

  # Run with automatic backups
  ./restore_christine.sh --backup-dir ./my-backup

  # Run without confirmations (dangerous)
  ./restore_christine.sh --yes

  # Full example with all options
  ./restore_christine.sh --dry-run --backup-dir ./backup --log ./restore.log

Safety Notes:
  - Requires sudo for apt operations
  - Review script before first run
  - Backups are created automatically before destructive operations
  - Use --dry-run first to preview changes

Exit Codes:
  0 - Success
  1 - Error or user abort
  2 - Preflight check failure
EOF
}

# Preflight checks
preflight_checks() {
  local errors=0

  echo "Running preflight checks..." | tee -a "$LOG_FILE"

  # Check required binaries
  local required_bins=("bash" "sudo" "apt-get")
  for bin in "${required_bins[@]}"; do
    if ! command -v "$bin" &> /dev/null; then
      echo "❌ ERROR: Required binary '$bin' not found" | tee -a "$LOG_FILE"
      errors=$((errors + 1))
    else
      echo "✅ Found: $bin" | tee -a "$LOG_FILE"
    fi
  done

  # Check if repo root exists
  if [ ! -d "$REPO_ROOT" ]; then
    echo "❌ ERROR: Repo root not found: $REPO_ROOT" | tee -a "$LOG_FILE"
    errors=$((errors + 1))
  else
    echo "✅ Repo root exists: $REPO_ROOT" | tee -a "$LOG_FILE"
  fi

  # Check if app path exists
  if [ ! -d "$APP_PATH" ]; then
    echo "⚠️  WARNING: App path not found: $APP_PATH" | tee -a "$LOG_FILE"
    echo "   Will attempt to locate or create..." | tee -a "$LOG_FILE"
  else
    echo "✅ App path exists: $APP_PATH" | tee -a "$LOG_FILE"
  fi

  # Validate environment
  if [ -z "${HOME:-}" ]; then
    echo "⚠️  WARNING: HOME environment variable not set" | tee -a "$LOG_FILE"
  fi

  if [ $errors -gt 0 ]; then
    echo "❌ Preflight checks failed with $errors error(s)" | tee -a "$LOG_FILE"
    exit 2
  fi

  echo "✅ All preflight checks passed" | tee -a "$LOG_FILE"
}

# Create backup before destructive operations
create_backup() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would create backup in: $BACKUP_DIR" | tee -a "$LOG_FILE"
    return 0
  fi

  echo "Creating backup..." | tee -a "$LOG_FILE"
  mkdir -p "$BACKUP_DIR"

  # Backup critical files
  if [ -f "$APP_PATH/package.json" ]; then
    run_cmd "cp -r \"$APP_PATH/package.json\" \"$BACKUP_DIR/\""
  fi

  if [ -f "$APP_PATH/package-lock.json" ]; then
    run_cmd "cp -r \"$APP_PATH/package-lock.json\" \"$BACKUP_DIR/\""
  fi

  echo "✅ Backup created: $BACKUP_DIR" | tee -a "$LOG_FILE"
}

# Main restoration function
main() {
  parse_args "$@"

  # Initialize log
  {
    echo "=== Restore Christine Script ==="
    echo "Started: $(date)"
    echo "Dry Run: $DRY_RUN"
    echo "Backup Dir: $BACKUP_DIR"
    echo ""
  } > "$LOG_FILE"

  # Show banner
  echo "🚀 Christine Restoration Launcher"
  echo "=================================="
  echo "Dry Run: $DRY_RUN"
  echo "Log File: $LOG_FILE"
  echo "Backup Dir: $BACKUP_DIR"
  echo ""

  # Preflight checks
  preflight_checks

  # Confirmation for non-dry runs
  if [ "$DRY_RUN" = false ] && [ "$AUTO_YES" != true ]; then
    echo ""
    echo "⚠️  WARNING: This will make system changes."
    echo "   - Update system packages (requires sudo)"
    echo "   - Install Node.js if needed"
    echo "   - Run npm install"
    echo "   - Start dev server"
    echo ""
    read -r -p "Type 'proceed' to continue: " resp
    if [ "$resp" != "proceed" ]; then
      echo "Aborted by user" | tee -a "$LOG_FILE"
      exit 1
    fi
  fi

  # Create backup
  create_backup

  # Update system packages
  echo "Updating system packages..." | tee -a "$LOG_FILE"
  run_cmd "sudo apt-get update"

  # Install Node.js if needed
  if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..." | tee -a "$LOG_FILE"
    run_cmd "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    run_cmd "sudo apt-get install -y nodejs"
  else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js already installed: $NODE_VERSION" | tee -a "$LOG_FILE"
  fi

  # Locate or create app directory
  if [ ! -d "$APP_PATH" ]; then
    echo "App directory not found. Searching..." | tee -a "$LOG_FILE"
    # Try to find it
    if [ -d "$REPO_ROOT/09_APP" ]; then
      APP_DIRS=$(find "$REPO_ROOT/09_APP" -name "package.json" -type f | head -1)
      if [ -n "$APP_DIRS" ]; then
        APP_PATH=$(dirname "$APP_DIRS")
        echo "Found app at: $APP_PATH" | tee -a "$LOG_FILE"
      fi
    fi
  fi

  if [ ! -d "$APP_PATH" ]; then
    echo "❌ ERROR: Could not locate app directory" | tee -a "$LOG_FILE"
    exit 1
  fi

  # Navigate to app directory
  cd "$APP_PATH" || exit 1

  # Check for package.json
  if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found in $APP_PATH" | tee -a "$LOG_FILE"
    exit 1
  fi

  # Run npm install
  echo "Installing npm dependencies..." | tee -a "$LOG_FILE"
  run_cmd "npm install"

  # Launch dev server
  if [ "$DRY_RUN" = false ]; then
    echo "Starting dev server..." | tee -a "$LOG_FILE"
    echo "✅ Setup complete! Dev server starting..." | tee -a "$LOG_FILE"
    echo "   App will be available at http://localhost:5173" | tee -a "$LOG_FILE"
    run_cmd "npm run dev" &
  else
    echo "[DRY RUN] Would start dev server with: npm run dev" | tee -a "$LOG_FILE"
  fi

  echo "" >> "$LOG_FILE"
  echo "Completed: $(date)" >> "$LOG_FILE"
  echo "✅ Restoration complete!" | tee -a "$LOG_FILE"
}

# Run main function
main "$@"

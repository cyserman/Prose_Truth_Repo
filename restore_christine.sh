#!/bin/bash

# --- CHRISTINE RESTORATION LAUNCHER (V7 - Updated for Current Repo) ---
# Usage: ./restore_christine.sh
# Action: Installs Node, finds backup, moves to Projects, runs npm install.

exit_with_pause() {
    echo -e "\n---------------------------------------------------"
    echo "⚠️  PROCESS INTERRUPTED: $1"
    echo "---------------------------------------------------"
    read -p "Press [Enter] to keep this window open for debugging..."
    exit 1
}

echo "🛡️ CHRISTINE: Initializing Monolithic Restoration & Install Sequence..."

# 1. SYSTEM PREP
echo "📦 Phase 1: Preparing Linux Subsystem..."
sudo apt-get update -y || echo "⚠️ Update failed, attempting to proceed..."
sudo apt-get install -y curl git build-essential || exit_with_pause "Failed to install dependencies."

# 2. ENGINE CORE CHECK
if ! command -v npm &> /dev/null; then
    echo "⚙️  Node.js/npm not found. Installing LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || exit_with_pause "Failed to source Node."
    sudo apt-get install -y nodejs || exit_with_pause "Failed to install Node."
else
    echo "✅ Engine present: Node $(node -v)"
fi

# 3. DATA DISCOVERY
echo "🔍 Phase 2: Locating Backup..."
# Scans for non-system folders
BACKUP=$(ls -d /home/ezcyser/*/ 2>/dev/null | grep -vE "Projects|Desktop|Downloads" | head -n 1 | sed 's/\///')
if [ -z "$BACKUP" ]; then
    BACKUP=$(ls -d */ 2>/dev/null | grep -vE "Projects|Desktop|Downloads" | head -n 1 | sed 's/\///')
fi

if [ -z "$BACKUP" ]; then
    echo "⚠️  No backup data detected. Checking if repo already exists..."
    REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
    if [ -d "$REPO_ROOT" ]; then
        echo "✅ Repo already exists at: $REPO_ROOT"
        BACKUP=""
    else
        exit_with_pause "No backup data detected. Ensure folder is in 'Linux files'."
    fi
else
    echo "✅ Backup Found: $BACKUP"
fi

# 4. RECONSTRUCTION
echo "🏗️  Phase 3: Structuring Projects..."
mkdir -p "/home/ezcyser/⏰ Projects🕰️"

if [ -n "$BACKUP" ] && [[ "$BACKUP" != *"PROSE_TRUTH_REPO"* ]]; then
    REPO_TARGET="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
    if [ ! -d "$REPO_TARGET" ]; then
        mv "/home/ezcyser/$BACKUP" "$REPO_TARGET" || exit_with_pause "Move failed."
        echo "✅ Data moved to $REPO_TARGET"
    fi
fi

# 5. PRIMING
echo "🔍 Phase 4: Priming V2 Engine..."
REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
APP_PATH="$REPO_ROOT/09_APP/prose-legal-db-app"

if [ ! -d "$APP_PATH" ]; then
    echo "⚠️  App folder not found at expected location: $APP_PATH"
    echo "📂 Available directories:"
    ls -la "$REPO_ROOT/09_APP/" 2>/dev/null || echo "09_APP directory not found"
    exit_with_pause "Missing 'prose-legal-db-app' folder in backup."
fi

cd "$APP_PATH" || exit_with_pause "Directory access denied."
echo "📍 Location: $(pwd)"
chmod -R 755 .

echo "🔧 Running One Big Install (npm)..."
npm install --prefer-offline --no-audit || exit_with_pause "npm install failed."

# 6. ENV CHECK
echo "🔐 Phase 5: Checking Environment Variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "⚠️  IMPORTANT: Edit .env and add your VITE_GEMINI_API_KEY"
    else
        echo "⚠️  No .env.example found. You may need to create .env manually."
    fi
else
    echo "✅ .env file found"
fi

# 7. LAUNCH
echo "🚀 CHRISTINE: Launching V2 Engine..."
echo "🌐 Server will start at: http://localhost:5173/"
npm run dev || exit_with_pause "Server stopped unexpectedly."
read -p "Process ended. Press [Enter] to close."



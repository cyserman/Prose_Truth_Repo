# Test helper functions for Bats tests
# This file is automatically loaded by Bats if it exists

# Helper to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Helper to get script directory
get_script_dir() {
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
}

# Helper to get project root
get_project_root() {
    local test_dir
    test_dir="$(get_script_dir)"
    echo "$(cd "$test_dir/.." && pwd)"
}


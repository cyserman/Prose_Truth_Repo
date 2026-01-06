# Test helper functions for Bats tests

# Helper to create temporary directories
setup_test_dir() {
  mktemp -d
}

# Helper to cleanup
cleanup_test_dir() {
  rm -rf "$1"
}

# Helper to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

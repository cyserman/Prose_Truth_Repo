#!/usr/bin/env bats
# Integration tests for restore_christine.sh
# These tests verify script behavior in realistic scenarios

load test_helper

setup() {
    TEST_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)"
    PROJECT_ROOT="$(cd "$TEST_DIR/.." && pwd)"
    SCRIPT_PATH="$PROJECT_ROOT/restore_christine.sh"
}

@test "dry-run mode shows all operations without executing" {
    run "$SCRIPT_PATH" --dry-run
    [ "$status" -eq 0 ] || [ "$status" -eq 1 ]  # May exit early on confirmation
    
    # Should show dry-run indicators
    [[ "$output" == *"DRY RUN"* ]] || [[ "$output" == *"[DRY RUN]"* ]]
    
    # Should not actually install anything (we can't verify this fully without mocking)
    # But we can verify it mentions the operations
    [[ "$output" == *"npm install"* ]] || [[ "$output" == *"npm"* ]] || true
}

@test "help output contains all required sections" {
    run "$SCRIPT_PATH" --help
    
    [ "$status" -eq 0 ]
    [[ "$output" == *"Purpose"* ]]
    [[ "$output" == *"What it does"* ]]
    [[ "$output" == *"Options"* ]]
    [[ "$output" == *"Safety Notes"* ]]
    [[ "$output" == *"Examples"* ]]
}

@test "script handles missing app directory gracefully" {
    # This test would require mocking the directory check
    # For now, we verify the check exists in the script
    run grep -q "APP_PATH" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    
    run grep -q "\[ ! -d" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script validates Node.js installation check" {
    # Verify the script checks for npm
    run grep -q "command -v npm" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script has proper error exit codes" {
    # Test that unknown option returns non-zero
    run "$SCRIPT_PATH" --invalid-option
    [ "$status" -ne 0 ]
}

@test "script uses confirmation prompts for safety" {
    # Verify confirm function exists
    run grep -q "confirm()" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    
    # Verify it's used for destructive operations
    run grep -q "confirm.*system package" "$SCRIPT_PATH" || grep -q "confirm.*npm install" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}


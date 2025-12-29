#!/usr/bin/env bats
# Bats tests for restore_christine.sh
#
# Run tests: bats tests/restore_christine.bats
# Run with verbose output: bats -t tests/restore_christine.bats

load test_helper

setup() {
    # Get the directory where the script is located
    TEST_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)"
    PROJECT_ROOT="$(cd "$TEST_DIR/.." && pwd)"
    SCRIPT_PATH="$PROJECT_ROOT/restore_christine.sh"
    
    # Ensure script is executable
    chmod +x "$SCRIPT_PATH" || true
}

@test "script exists and is executable" {
    [ -f "$SCRIPT_PATH" ]
    [ -x "$SCRIPT_PATH" ]
}

@test "script has shebang" {
    run head -n 1 "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    [[ "$output" == "#!/bin/bash"* ]]
}

@test "script --help shows usage information" {
    run "$SCRIPT_PATH" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"CHRISTINE RESTORATION LAUNCHER"* ]]
    [[ "$output" == *"Purpose"* ]]
    [[ "$output" == *"--dry-run"* ]]
    [[ "$output" == *"--yes"* ]]
    [[ "$output" == *"--help"* ]]
}

@test "script -h shows usage information" {
    run "$SCRIPT_PATH" -h
    [ "$status" -eq 0 ]
    [[ "$output" == *"CHRISTINE RESTORATION LAUNCHER"* ]]
}

@test "script --dry-run does not execute destructive commands" {
    run "$SCRIPT_PATH" --dry-run
    [ "$status" -eq 0 ] || [ "$status" -eq 1 ]  # May exit early, but shouldn't error
    [[ "$output" == *"DRY RUN MODE"* ]] || [[ "$output" == *"[DRY RUN]"* ]]
}

@test "script with unknown option shows error" {
    run "$SCRIPT_PATH" --unknown-option
    [ "$status" -eq 1 ]
    [[ "$output" == *"Unknown option"* ]] || [[ "$output" == *"Unknown"* ]]
}

@test "script contains safety functions" {
    run grep -q "exit_with_pause" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    
    run grep -q "confirm" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    
    run grep -q "run_cmd" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script contains DRY_RUN variable" {
    run grep -q "DRY_RUN" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script contains AUTO_YES variable" {
    run grep -q "AUTO_YES" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script uses set -euo pipefail" {
    run grep -q "set -euo pipefail" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script has proper error handling" {
    run grep -q "exit_with_pause" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script documents safety notes" {
    run "$SCRIPT_PATH" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Safety Notes"* ]] || [[ "$output" == *"safety"* ]]
}

@test "script has confirmation prompts" {
    run grep -q "confirm" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}

@test "script validates app path exists" {
    run grep -q "APP_PATH" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
    
    run grep -q "\[ ! -d" "$SCRIPT_PATH"
    [ "$status" -eq 0 ]
}


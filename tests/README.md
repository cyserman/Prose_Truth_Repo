# Test Suite

This directory contains automated tests for the Prose Truth Repo scripts and components.

## Test Files

### `restore_christine.bats`
Bats (Bash Automated Testing System) tests for the `restore_christine.sh` script.

**What it tests:**
- Script existence and executability
- Help documentation (`--help`, `-h`)
- Dry-run mode (`--dry-run`)
- Error handling for invalid options
- Safety features (confirmation prompts, error handling)
- Script structure and best practices

**Run tests:**
```bash
# Run all tests
bats tests/restore_christine.bats

# Run with verbose output
bats -t tests/restore_christine.bats

# Run specific test
bats -f "script --help" tests/restore_christine.bats
```

## Test Helper

### `test_helper.bash`
Shared helper functions for Bats tests.

## Running Tests Locally

### Prerequisites
```bash
# Install Bats
sudo apt-get install -y bats

# Or on macOS
brew install bats-core
```

### Run All Tests
```bash
bats tests/
```

### Run Specific Test File
```bash
bats tests/restore_christine.bats
```

### Run with Coverage
```bash
# Install bats-core with coverage support
bats --coverage tests/
```

## CI Integration

Tests run automatically in GitHub Actions on:
- Push to main/standalone-component branches
- Pull requests to main/standalone-component branches

See `.github/workflows/ci.yml` for configuration.

## Adding New Tests

1. Create a new `.bats` file in `tests/`
2. Follow Bats syntax:
   ```bash
   #!/usr/bin/env bats
   
   @test "test description" {
       run command_to_test
       [ "$status" -eq 0 ]
       [[ "$output" == *"expected"* ]]
   }
   ```

3. Make file executable: `chmod +x tests/your_test.bats`
4. Run: `bats tests/your_test.bats`

## Test Coverage

Current coverage:
- ✅ `restore_christine.sh` - 14 tests covering:
  - Script structure
  - Help documentation
  - Safety features
  - Error handling
  - Dry-run mode

## Future Tests

Planned test additions:
- [ ] Integration tests for npm install flow
- [ ] Mock tests for system operations
- [ ] React component tests (Jest)
- [ ] End-to-end workflow tests

## Resources

- [Bats Documentation](https://bats-core.readthedocs.io/)
- [Bats GitHub](https://github.com/bats-core/bats-core)
- [Testing Best Practices](https://bats-core.readthedocs.io/en/stable/writing-tests.html)


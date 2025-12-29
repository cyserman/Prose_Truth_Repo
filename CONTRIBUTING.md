# Contributing to Prose Truth Repo

Thank you for your interest in contributing! This repository manages a pro se legal case management system.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

See [README.md](README.md) for quickstart instructions.

### Prerequisites
- Linux/WSL environment
- Bash shell
- Node.js 20 LTS
- Git

### Running Locally
```bash
# Use the restoration script
./restore_christine.sh

# Or manual setup
cd 09_APP/prose-legal-db-app
npm install
npm run dev
```

## Contribution Guidelines

### Code Style
- **Shell scripts:** Follow shellcheck recommendations
- **JavaScript/React:** Follow ESLint rules (run `npm run lint`)
- **Commits:** Use clear, descriptive commit messages

### Testing
- **Shell scripts:** Run `shellcheck restore_christine.sh` before committing
- **Bats tests:** Run `bats tests/` or `./tests/run_tests.sh` to verify script behavior
- **React app:** Ensure the app builds: `npm run build`
- **Local testing:** Test in your local environment before submitting PRs

#### Running Tests
```bash
# Run all Bats tests
./tests/run_tests.sh

# Run specific test file
bats tests/restore_christine.bats

# Run with verbose output
bats -t tests/
```

### Pull Request Process

1. **Update documentation** if you change functionality
2. **Ensure CI passes** - all checks must be green
3. **Write clear PR descriptions** explaining:
   - What changed
   - Why it changed
   - How to test
4. **Link related issues** if applicable

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `security/` - Security improvements

## Areas for Contribution

### High Priority
- **Documentation:** Expand README, add code comments
- **Testing:** Add unit tests for critical functions
- **Security:** Audit for credential leakage, improve secrets handling
- **Accessibility:** Improve UI accessibility

### Feature Ideas
- OCR processing improvements
- Timeline export formats
- Evidence tagging automation
- Court filing templates

## Legal Case Data

**Important:** This repository contains legal case management tools. When contributing:

- **Do NOT** include real case data in examples
- **Do NOT** commit sensitive information
- **Use** placeholder data for testing
- **Respect** privacy and confidentiality

## Questions?

- Open an issue for discussion
- Check existing issues before creating new ones
- Be respectful and constructive in all interactions

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community guidelines.

Thank you for contributing! 🎉


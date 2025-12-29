# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Security & Quality Automation**
  - Secrets scanning with `detect-secrets` baseline
  - Pre-commit hook to block secrets and sensitive files
  - GitHub Actions workflows for security and accessibility testing
  - Manual secrets scanner script (`scripts/scan-secrets.sh`)
  - Accessibility audit script (`09_APP/prose-legal-db-app/scripts/accessibility-audit.sh`)

- **restore_christine.sh Integration**
  - GitHub Actions `workflow_dispatch` for controlled execution
  - Weekly watchdog smoke tests (scheduled)
  - Comprehensive RUNBOOK.md with rollback procedures
  - Research artifacts in `.copilot-tracking/research/`

- **Documentation**
  - `SECURITY_SETUP.md` - Complete security guide
  - `QUICKSTART_SECURITY.md` - Quick start with examples
  - `RUNBOOK.md` - Operational procedures and rollback plans
  - `CHANGELOG.md` - This file

### Changed
- **UI Improvements**
  - Centered sidebar header (icon + title + framework text)
  - Changed indigo/purple theme to blue throughout
  - Fixed Neutralize button size and positioning
  - Added working theme icons (Sun/Moon from Lucide)
  - Fixed CSS classes wrapped in `@layer` for Tailwind v4 compatibility

- **restore_christine.sh**
  - Already hardened with `--dry-run`, `--help`, `--yes` flags
  - Confirmation prompts for all destructive operations
  - BATS tests in place

### Fixed
- Tailwind CSS v4 compatibility (changed `@tailwind` directives to `@import "tailwindcss"`)
- Custom CSS classes now properly processed with `@layer` directives
- Pre-commit hook excludes security scripts and documentation from false-positive scans

### Security
- ⚠️ **ACTION REQUIRED:** Real Gemini API key found in `.env` file
  - Add `.env` to `.gitignore` (if not already)
  - Rotate the exposed API key immediately
  - See `SECURITY_SETUP.md` for remediation steps

---

## [0.1.0] - 2025-12-28

### Added
- Initial repository structure
- ProSe Legal DB React application
- Timeline, Evidence Organizer, Exhibits views
- Strategic Analyzer with Gemini AI integration
- Smart Sticky Notes feature
- CSV import/export functionality
- Voice recording for evidence
- Theme switching (Light/Dark/Textured Blue)
- Firebase-style glassmorphism UI
- Seed data import from `sticky_index.json`

### Documentation
- README.md with project overview
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- LICENSE (MIT)

---

## Release Process

### Creating a Release

1. Update version in this CHANGELOG.md
2. Create git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
3. Push tag: `git push origin v0.1.0`
4. GitHub Actions will automatically create a release (if configured)

### Version Format

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

---

## Links

- [GitHub Repository](https://github.com/cyserman/Prose_Truth_Repo)
- [Security Setup Guide](SECURITY_SETUP.md)
- [Runbook](RUNBOOK.md)
- [Contributing Guidelines](CONTRIBUTING.md)


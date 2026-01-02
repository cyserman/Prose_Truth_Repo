# ⚖️ PRO SE LEGAL DB (The Truth Repo)

![Release](https://img.shields.io/github/v/release/cyserman/Prose_Truth_Repo?include_prereleases&color=blue)
![Build](https://github.com/cyserman/Prose_Truth_Repo/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen)

**Case:** Firey v. Firey  
**Jurisdiction:** Montgomery County, PA  
**Status:** Litigation Mode

## PURPOSE

Single, authoritative source of truth for pro se legal case management. Designed to survive device failure and counsel changes.

**For AI Agents:** Do not hallucinate. Use only files present here.

## QUICKSTART

### Prerequisites
- Linux/WSL environment
- Bash shell
- Internet connection (for initial setup)

### First-Time Setup
```bash
# Clone repository
git clone git@github.com:cyserman/Prose_Truth_Repo.git
cd Prose_Truth_Repo

# Make restore script executable
chmod +x restore_christine.sh

# Run restoration (installs Node.js, npm dependencies, launches dev server)
./restore_christine.sh
```

The React app will launch at `http://localhost:5173/`

### Manual Setup
```bash
cd 09_APP/prose-legal-db-app
npm install
npm run dev
```

### Start Backend Agents (Optional)
```bash
# Start reflexive intake agent
python 09_APP/agents/reflexive_intake_agent.py

# Or use the orchestrator
python 09_APP/agents/orchestrator.py
```

## DIRECTORY STRUCTURE

```
00_ANCHORS/     - Constitutional documents and strategic anchors
02_TIMELINES/   - CSV timeline data (evidence spine)
03_EXHIBITS/    - Finalized evidence files (categorized)
04_COMMUNICATIONS/ - Call logs, SMS, app blocks
05_COURT_FILINGS/  - Drafts, filed documents, orders
06_SCANS/       - Input funnel for raw documents
07_LEGAL_RESEARCH/ - Case law and statutes
08_TASKS_AND_LOGS/ - Task tracking and operation logs
09_APP/         - React application tooling
```

## 📚 DOCUMENTATION

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete user instruction manual with step-by-step guides
- **[FEATURES.md](./FEATURES.md)** - Comprehensive feature list and capabilities
- **[README.md](./README.md)** - This file (technical setup and overview)

## CORE FEATURES

### Timeline-First Strategy
- CSV-based timeline management
- Exhibit linkage system
- Neutralization of emotional language
- Print-to-PDF court-ready output
- **Swimlane timeline views** with customizable lane profiles
- **Smart Sticky Notes** - Context-aware annotations

### Evidence Management
- Categorized exhibit system (CL, FIN, PKT, VEH, etc.)
- OCR processing pipeline (standalone + integrated)
- Index generation
- **Reflexive intake agent** with logic checks
- **Floating note console** for quick annotations
- Voice recording for evidence capture

### AI Integration
- Strategic analysis via Gemini API
- Automated summary generation
- Gap analysis and consistency checking
- **Contradiction detector** for cross-examination prep
- **Motion/Affidavit builder** for document generation
- Neutralization of emotional event descriptions

### Document Tools
- **Motion Builder** - Generate court documents from timeline
- **Deadline Tracker** - Never miss a court date
- **Contradiction Detector** - Find inconsistencies automatically
- **Smart Sticky Notes** - Context-aware floating annotations

### Privacy & Security
- All data remains local (no cloud sync)
- Sensitive exhibits and scans ignored via `.gitignore`
- Secrets scanning and pre-commit hooks
- Accessibility compliance (WCAG 2.1 AA)

## RESTORE SCRIPT

### restore_christine.sh

**Purpose:** One-command restoration and dev server launch

**What it does:**
1. Updates system packages (apt)
2. Installs Node.js 20 LTS (if needed)
3. Locates React app directory
4. Runs `npm install`
5. Launches dev server

**Usage:**
```bash
# Always start with dry-run
./restore_christine.sh --dry-run

# Run with automatic backups
./restore_christine.sh --backup-dir ./backups/manual-$(date +%Y%m%d)

# Run without confirmations (use with caution)
./restore_christine.sh --yes

# Show help
./restore_christine.sh --help
```

**Safety Features:**
- ✅ `--dry-run` mode (preview changes)
- ✅ Automatic backups before destructive operations
- ✅ Comprehensive logging
- ✅ Preflight checks (validates environment)
- ✅ Confirmation prompts (unless `--yes`)
- ✅ Auto-detects repository root
- ✅ Error handling with exit codes

**Safety Notes:**
- Requires `sudo` for apt operations
- Always run `--dry-run` first
- Backups created automatically in `backups/` directory
- Logs saved to `logs/` directory
- Review script before first run

**Interpreting Logs:**
- Logs are stored in `logs/restore-YYYYMMDD-HHMMSS.log`
- Look for `[DRY RUN]` markers to identify preview-only operations
- `[CMD]` entries show actual commands executed
- Check for `✅` success markers or `❌` error markers
- Preflight check results are logged at the start

**Artifacts Storage:**
- **Backups**: `backups/YYYYMMDD-HHMMSS/` (package.json, package-lock.json, etc.)
- **Logs**: `logs/restore-YYYYMMDD-HHMMSS.log`
- **CI Artifacts**: GitHub Actions uploads logs and backups as workflow artifacts
- **Test Results**: Bats test output in CI logs

**Rollback / Remediation Steps:**
1. **If script fails mid-execution:**
   - Check logs: `tail -50 logs/restore-*.log`
   - Restore from backup: `cp backups/LATEST/package.json 09_APP/prose-legal-db-app/`
   - Manual recovery: `cd 09_APP/prose-legal-db-app && npm install`

2. **If data is lost:**
   - Check localStorage exports (if exported)
   - Check Git history: `git log --all --full-history -- "*.csv"`
   - Restore from backups directory

3. **If application won't start:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check port availability: `lsof -i :5173`
   - Review dev server logs

**See Also:**
- [docs/RUNBOOK.md](./docs/RUNBOOK.md) - Detailed recovery procedures and operational guide
- [docs/METRICS.md](./docs/METRICS.md) - Metrics tracking guide
- [SECURITY.md](./SECURITY.md) - Security policies and secrets handling
- [RELEASES.md](./RELEASES.md) - Release procedures and versioning
- [CHANGELOG.md](./CHANGELOG.md) - Change history

## AI PRIME DIRECTIVE

When working with this repository:

1. **Read 00_ANCHORS first** - Understand case context and constraints
2. **Neutralize emotional input** - Convert to court-ready language
3. **Identify manufactured imbalance** - Core legal theory of the case
4. **Preserve exhibit codes** - Maintain evidence linkage
5. **Flag inconsistencies** - Timeline gaps, date conflicts

## WORKFLOW

1. **Ingest:** Drop raw files in `06_SCANS/INBOX/new/` (or use `INBOX/transfers/` for remote access without SSH)
2. **Process:** Use OCR tools or React app to tag and index
3. **Timeline:** Add events to timeline CSVs with exhibit links
4. **Archive:** Move processed files to `03_EXHIBITS/`
5. **Generate:** Create court-ready summaries and motions

### File Transfer Without SSH

If SSH is not available, use `06_SCANS/INBOX/transfers/` to share files via git:

**Quick Start:**
```bash
# Upload a file
./scripts/transfer_files.sh upload myfile.zip

# Download files
./scripts/transfer_files.sh download

# List available files
./scripts/transfer_files.sh list

# Clean up after transfer
./scripts/transfer_files.sh cleanup
```

**Manual Method:**
- Place files in `transfers/` directory
- Commit and push to repository: `git add 06_SCANS/INBOX/transfers/ && git commit -m "Transfer files" && git push`
- Files will be accessible remotely via `git pull`

**Important:** See `06_SCANS/INBOX/transfers/README.md` for security guidelines and best practices.

## LICENSE

MIT License - See LICENSE file

## SECURITY

Report security vulnerabilities via GitHub security advisories.  
See SECURITY.md for details.

## REPOSITORY

**GitHub:** https://github.com/cyserman/Prose_Truth_Repo  
**Primary Branch:** main

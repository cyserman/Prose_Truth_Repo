# ⚖️ PRO SE LEGAL DB (The Truth Repo)

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

**Safety Notes:**
- Requires `sudo` for apt operations
- Runs automatically without prompts
- Exits on any failure
- Review script before first run

**Future Improvements:**
- Add `--dry-run` flag
- Add `--help` documentation
- Add error recovery
- Add operation logging

## AI PRIME DIRECTIVE

When working with this repository:

1. **Read 00_ANCHORS first** - Understand case context and constraints
2. **Neutralize emotional input** - Convert to court-ready language
3. **Identify manufactured imbalance** - Core legal theory of the case
4. **Preserve exhibit codes** - Maintain evidence linkage
5. **Flag inconsistencies** - Timeline gaps, date conflicts

## WORKFLOW

1. **Ingest:** Drop raw files in `06_SCANS/INBOX/`
2. **Process:** Use OCR tools or React app to tag and index
3. **Timeline:** Add events to timeline CSVs with exhibit links
4. **Archive:** Move processed files to `03_EXHIBITS/`
5. **Generate:** Create court-ready summaries and motions

## LICENSE

MIT License - See LICENSE file

## SECURITY

Report security vulnerabilities via GitHub security advisories.  
See SECURITY.md for details.

## REPOSITORY

**GitHub:** https://github.com/cyserman/Prose_Truth_Repo  
**Primary Branch:** main

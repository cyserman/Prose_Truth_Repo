# 🧩 ProSe Legal DB — v1.0-alpha

### 🗓️ Release Date
December 28, 2024

### 🚀 Overview
This is the first public alpha of **Pro Se Legal DB**, a complete local-first evidence and case-timeline system for self-represented litigants.  
It includes the Reflexive Intake Agent, AI-assisted evidence normalization, and a fully interactive Swimlane Timeline UI.

### ✨ Core Highlights
- **Timeline & Swimlane Visualization** — dynamic lane profiles for custody, PFA, and financial contexts  
- **Reflexive Intake Agent** — logic-aware file watcher that questions incomplete classifications  
- **Floating Note / Mic Console** — voice-to-text and direct timeline insertion  
- **OCR Integration** — auto-extracts and indexes scanned exhibits  
- **Motion Builder + Deadline Tracker** — procedural tools for filings  
- **Gemini Strategic Analyzer** — AI summary and contradiction detection  
- **Secure Architecture** — private local processing, pre-commit scanning, and .gitignore for sensitive data

### 🧱 Directory Highlights

```
09_APP/
├── app/ # React frontend
├── agents/ # Python intake agents
├── Database/ # Master CSV + lane profiles
├── Generated/ # Intake queue
├── lane_profiles/ # View configs
└── scripts/ # Utilities
```

### 🧩 Known Limitations (Alpha)
- `.env` API keys remain local and ignored by git  
- Workspace settings file may appear in commits; optional to ignore  
- Some AI normalizer endpoints require manual start of backend service  

### ⚙️ Upgrade Path
`v1.0-beta` will introduce:
- Persistent user preferences (lane profiles + UI state)
- SQLite backend synchronization
- Enhanced case packet exporter

### 🏷️ Version
`v1.0-alpha` — tag created and verified.  
All security, documentation, and CI checks ✅ passed.

---

**Release Manager:** copilot-chat-assistant  
**License:** MIT


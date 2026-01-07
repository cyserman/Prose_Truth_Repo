# Truth Repo Architecture

## Modular Structure

This Vite app follows a clean 4-layer architecture:

### 1. DATA LAYER (`lib/db.js`)
- Dexie schema with tables: `scans`, `comms`, `timeline_events`, `exhibits`, `mappings`
- All items include:
  - `original_text` (immutable once stored)
  - `neutral_text` (derived, editable)
  - `source` pointer (raw file + row id)
  - `created_at`, `modified_at`
  - `hash` (optional integrity)

### 2. DOMAIN LOGIC (`lib/spine/*`, `lib/importers/*`)
- **Importers**: Adapt raw exports → normalized records
- **Spine Builders**: Create chronological rails (COMM_SPINE) without "arguing"
- **Timeline Builders**: Create judge-facing event lines with exhibit refs

### 3. PRESENTATION (`components/*`)
- **SpineView**: Captain's nav rail (chronological comm spine)
- **TimelineView**: Judge-facing timeline list (neutral)
- **IntakeQueue**: 06_SCANS/INBOX workflow mirror
- **ExportPanel**: Export bundles

### 4. OPTIONAL AI SERVICES (`lib/neutralize.js`)
- AI is NEVER required for core operations
- App must still work if AI is disabled/offline
- AI output stored as `neutral_text`, never overwriting `original_text`

## Key Files

```
src/
├── lib/
│   ├── db.js                    # Database schema
│   ├── ids.js                    # ID generators (SCAN-####, COMM-####, etc.)
│   ├── hash.js                   # SHA-256 utilities
│   ├── normalize.js              # Text cleanup (deterministic)
│   ├── neutralize.js             # Emotional → neutral (AI optional)
│   ├── exports.js                # Export utilities
│   ├── spine/
│   │   ├── commSpineBuilder.js  # Build COMM_SPINE.csv
│   │   └── timelineBuilder.js    # Build master_timeline.csv
│   └── importers/
│       ├── csvImporter.js        # Generic CSV parser
│       ├── appcloseImporter.js   # AppClose format adapter
│       └── pdfImporter.js        # PDF metadata importer
├── components/
│   ├── SpineView.jsx             # Communication spine viewer
│   ├── TimelineView.jsx          # Timeline event viewer
│   ├── IntakeQueue.jsx           # File import queue
│   └── ExportPanel.jsx           # Export controls
├── state/
│   └── useCaseStore.js           # App state + persistence
├── constants/
│   └── anchors.js                # Anchor rules reminders
└── App.jsx                        # Main router/layout
```

## Critical Invariants

1. **Never Overwrite Originals**: `original_text` is immutable
2. **Store Neutral Separately**: `neutral_text` is a separate field
3. **AI is Optional**: App works without AI (rules-based fallback)
4. **Local-First**: All data stays local unless user exports
5. **Preserve Chronology**: Chronological order is sacred
6. **No Arguments**: System presents facts, does not argue
7. **Exhibit Codes Required**: All exhibits have codes (CL-###, SCAN-###, EX-###)
8. **Source Tracking**: Every entry tracks source file + row ID

## Environment Variables

- `VITE_GEMINI_API_KEY` - Optional, for AI neutralization
- `VITE_GEMINI_MODEL` - Optional, defaults to `gemini-flash-latest`

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

The original prototype (`prose_legal_db.jsx`) is preserved as a canonical artifact and should NOT be deleted.


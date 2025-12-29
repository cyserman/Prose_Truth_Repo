# 09_APP

## PURPOSE

Application tooling for case management, evidence processing, and timeline generation.

## APPLICATIONS

### prose-legal-db-app (PRIMARY)
**Type:** React + Vite + TailwindCSS  
**Status:** Active development  
**Port:** 5173 (dev server)

**Features:**
- Timeline builder with event classification
- CSV import/export for case data
- Strategic analyzer (Gemini API integration)
- Neutralization engine (emotional → court-ready text)
- Print-to-PDF court-ready output
- Evidence exhibit linkage
- Smart sticky notes system

**Tech Stack:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- LocalStorage (data persistence)

**Setup:**
```bash
cd prose-legal-db-app
npm install
npm run dev
```

**Environment:**
Create `.env` file with:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### prose-legal-db (LEGACY)
**Status:** Reference implementation  
**Note:** Original development version; use prose-legal-db-app for new work

### ocr_processor
**Type:** Python scripts  
**Status:** Utility/standalone

**Tools:**
- `ocr_processor.py` - PDF OCR extraction
- `standalone_ocr.py` - Single-file processing
- `ocr_tasks.py` - Batch processing

**Setup:**
```bash
pip install -r requirements.txt
```

## DATA FILES

The `prose-legal-db-app/public/` directory contains seed data:
- `case_spine_timeline.csv`
- `case_spine_exhibits.csv`
- `exhibit_index.csv`
- `master_timeline_merged.csv`

## DEVELOPMENT

### Running Tests
```bash
cd prose-legal-db-app
npm test
```

### Building for Production
```bash
npm run build
# Output in dist/
```

### Linting
```bash
npm run lint
```

## ARCHITECTURE

**Local-First Design:**
- All data stored in browser LocalStorage
- No backend required for core functionality
- API calls only for AI analysis (optional)

**Data Flow:**
1. Import CSV → Parse → Store in state
2. Edit/neutralize → Update state
3. Export CSV or Print PDF

## NEXT STEPS

Planned improvements (see `00_ANCHORS/DACHSHUND_UI_AUDIT.txt`):
- Enhanced LocalStorage persistence
- Auto-summary builder integration
- Cleaned CSV export with neutralized text
- Timeline gap detection
- Exhibit validation


# 02_TIMELINES

## PURPOSE

Data core for case timelines in CSV format.

## FILE STRUCTURE

Timeline CSVs should contain standardized columns:
- **Date** - YYYY-MM-DD format
- **Event** - Neutral description
- **Category** - Event classification (custody, communication, financial, etc.)
- **Exhibit** - Linked exhibit code (CL-001, FIN-042, etc.)
- **Notes** - Additional context

## WORKFLOW

1. Import raw timeline data from salvaged files
2. Normalize dates and descriptions
3. Link to exhibits in 03_EXHIBITS/
4. Export to React app for visualization and analysis

## MASTER FILES

- `NORMALIZED_TIMELINE.csv` - Cleaned, court-ready timeline
- `master_timeline_merged.csv` - Consolidated from multiple sources
- Individual timeline segments by category or date range

## INTEGRATION

React app (`09_APP/prose-legal-db-app`) imports these CSVs and provides:
- Neutralization (emotional → factual)
- Gap detection
- Exhibit validation
- Print-to-PDF output


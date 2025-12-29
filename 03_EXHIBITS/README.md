# 03_EXHIBITS

## PURPOSE

Finalized evidence files, categorized and indexed.

## CATEGORIES

```
A/      - General exhibits (category A)
B/      - General exhibits (category B)
C/      - General exhibits (category C)
CL/     - Communication logs (call records, SMS)
FIN/    - Financial documents
INDEX/  - Master exhibit indexes
MISC/   - Miscellaneous supporting documents
VEH/    - Vehicle-related documents
```

## NAMING CONVENTION

Files should use exhibit codes that match timeline references:

```
CL-001.pdf    - First communication log
FIN-042.pdf   - Financial document #42
PKT-003.pdf   - Packet/bundle #3
```

## INDEX FILES

The `INDEX/` subdirectory contains:
- `EXHIBIT_INDEX.csv` - Master list of all exhibits
- Category-specific indexes
- Metadata (dates, descriptions, sources)

## WORKFLOW

1. Process files from `06_SCANS/OCR_COMPLETE/`
2. Assign exhibit code
3. Save to appropriate category folder
4. Update `INDEX/EXHIBIT_INDEX.csv`
5. Reference in timeline CSVs

## COURT READINESS

All files in this directory should be:
- ✅ OCR-processed (searchable text)
- ✅ Properly named with exhibit codes
- ✅ Indexed in CSV
- ✅ Free of personal metadata (EXIF, etc.)
- ✅ Redacted if necessary


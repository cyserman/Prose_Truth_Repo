# Dry-Run Validation Results

## Overview

This document records the results of dry-run validation tests for the Text Spine System. The validation ensures that the system can rebuild from source files (CSV imports) without data loss.

## Test Methodology

The dry-run validation script (`scripts/dry-run-validation.ts`) performs the following steps:

1. **Import CSV** → Save to database
2. **Export database state** → JSON snapshot #1
3. **Delete database** → Clear all data
4. **Re-import same CSV** → Rebuild from source
5. **Export database state** → JSON snapshot #2
6. **Compare snapshots** → Verify identical

## Validation Criteria

| Criterion | Expected | Description |
|-----------|----------|-------------|
| Message Count Match | ✅ | Both exports have identical message counts |
| Hash Match | ✅ | All spine item IDs match between exports |
| Timestamp Match | ✅ | All timestamps are identical |
| Content Integrity | ✅ | `content_original` is never modified |
| Category Preservation | ✅ | Auto-categorization produces same results |

## Running the Validation

```bash
cd /home/cyserman/Projects/Prose_Truth_Repo/09_APP/CaseTimeline
npx tsx scripts/dry-run-validation.ts /path/to/your/file.csv
```

## Expected Output (Success)

```
🧪 Starting Dry-Run Validation...

📁 CSV File: /path/to/file.csv

Step 1: Reading CSV file...
✅ Read XXXX characters

Step 2: Parsing CSV...
✅ Parsed XXX messages
   Source File ID: SRC-XXXXXXXXX
   File Hash: XXXXXXXXXXXXXXXX...

Step 3: Importing to database (first time)...
✅ Imported XXX messages
   Skipped 0 duplicates

Step 4: Exporting database state (first export)...
✅ Exported XXX messages

Step 5: Clearing database...
✅ Database cleared (0 items remaining)

Step 6: Re-importing CSV...
✅ Re-imported XXX messages
   Skipped 0 duplicates

Step 7: Exporting database state (second export)...
✅ Exported XXX messages

Step 8: Comparing exports...
✅ VALIDATION PASSED: Exports are identical

📊 Results:
   Messages in export 1: XXX
   Messages in export 2: XXX
   Source files match: true

✅ System can rebuild from files successfully!
```

## Critical Invariants Verified

### 1. Immutable Content
- `content_original` is NEVER modified
- The raw message text is preserved exactly as imported

### 2. Deterministic Parsing
- Same CSV produces same SpineItems
- Timestamps are parsed consistently
- Categories are assigned deterministically

### 3. Hash-Based Deduplication
- Re-importing same file skips duplicates
- File hash prevents accidental duplication

### 4. Chronological Ordering
- Spine items maintain timestamp order
- Sorting is consistent across imports

## Test History

| Date | CSV File | Messages | Result | Notes |
|------|----------|----------|--------|-------|
| (Run validation to populate) | | | | |

## Troubleshooting

### Validation Fails: Message Count Mismatch

**Possible Causes:**
- CSV parsing edge cases (commas in messages)
- Timestamp parsing inconsistencies
- Duplicate detection issues

**Resolution:**
- Check CSV format matches expected columns
- Verify date/time format consistency
- Review parsing logic in `lib/csv-parser.ts`

### Validation Fails: Hash Mismatch

**Possible Causes:**
- Non-deterministic ID generation
- Timestamp precision differences
- Encoding issues

**Resolution:**
- Ensure IDs are generated from source data
- Normalize timestamps to ISO 8601
- Use UTF-8 encoding consistently

## Notes

- The dry-run validation is designed for AppClose CSV format
- Other CSV formats may require parser modifications
- Validation should be run after any parser changes

---

*Last Updated: Generated during Spine Integration*

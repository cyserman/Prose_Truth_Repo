# 06_SCANS

## PURPOSE

Input funnel for raw documents, scans, and unprocessed evidence.

## STRUCTURE

```
INBOX/          - Active intake area
  new/          - Fresh scans (ignored by git)
  Salvaged/     - Recovered data from previous systems
  to_trash/     - Archive pending deletion (ignored by git)

OCR_PENDING/    - Documents queued for OCR processing
OCR_COMPLETE/   - Processed documents with text extraction
```

## WORKFLOW

1. **Drop files** in `INBOX/new/`
2. **OCR processing** moves to `OCR_PENDING/` → `OCR_COMPLETE/`
3. **Tag and index** using React app or Python tools
4. **Archive** to appropriate `03_EXHIBITS/` category
5. **Clean up** INBOX periodically

## SALVAGED DATA

The `Salvaged/` subdirectory contains data recovered from previous iterations:
- Case data CSVs
- Case notes and analysis
- Court documents (PDFs)
- Timeline CSVs

See `INBOX/Salvaged/SALVAGE_SUMMARY.md` for details.

## GIT IGNORE

The following are **not** tracked:
- `INBOX/new/` - Fresh scans may contain sensitive data
- `INBOX/to_trash/` - Archived content
- Any embedded `.git/` repos in trash

## SECURITY

⚠️ **Do not commit raw scans** containing:
- SSNs or financial account numbers
- Unredacted personal identifiers
- Attorney-client privileged materials

Process and redact before archiving to `03_EXHIBITS/`.


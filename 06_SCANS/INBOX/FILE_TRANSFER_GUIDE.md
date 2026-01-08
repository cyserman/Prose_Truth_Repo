# File Transfer Solution - Quick Reference

## Problem Solved
You can now transfer files via git when SSH is not available.

## Quick Example

### Scenario: Upload a zip file for remote access

**On the sending machine:**
```bash
# Using the helper script
./scripts/transfer_files.sh upload myarchive.zip

# Or manually
cp myarchive.zip 06_SCANS/INBOX/transfers/
git add 06_SCANS/INBOX/transfers/myarchive.zip
git commit -m "Transfer: Upload myarchive.zip"
git push
```

**On the receiving machine:**
```bash
# Using the helper script
./scripts/transfer_files.sh download

# Or manually
git pull
# File is now available at: 06_SCANS/INBOX/transfers/myarchive.zip
```

**After transfer is complete (cleanup):**
```bash
# Using the helper script
./scripts/transfer_files.sh cleanup

# Or manually
rm 06_SCANS/INBOX/transfers/myarchive.zip
git add 06_SCANS/INBOX/transfers/
git commit -m "Transfer: Cleanup"
git push
```

## Directory Structure

```
06_SCANS/INBOX/
├── new/              ← Fresh scans (IGNORED by git)
├── to_trash/         ← Archive pending deletion (IGNORED by git)
├── transfers/        ← File sharing via git (TRACKED by git) ✓
└── Salvaged/         ← Recovered data (TRACKED by git)
```

## Important Notes

1. **Security**: Only use `transfers/` for non-sensitive files
2. **Size**: Keep files small to avoid repository bloat
3. **Cleanup**: Remove files after transfer is complete
4. **Alternative**: Use SSH/SCP when available (preferred for large files)

## Helper Script Commands

```bash
./scripts/transfer_files.sh help      # Show help
./scripts/transfer_files.sh upload    # Upload a file
./scripts/transfer_files.sh download  # Download files
./scripts/transfer_files.sh list      # List available files
./scripts/transfer_files.sh cleanup   # Remove all files
```

## Documentation

- Full guide: `06_SCANS/INBOX/transfers/README.md`
- Security notes: `QUICKSTART_SECURITY.md`
- Main README: `README.md` (see "File Transfer Without SSH" section)

# INBOX/transfers - File Transfer Directory

## PURPOSE

This directory is specifically designed for sharing files when SSH access is not available. Unlike other INBOX subdirectories, files placed here **will be tracked by git** and can be pushed to the remote repository.

## WHEN TO USE

Use this directory when:
- SSH is not set up or available
- You need to transfer files between different machines/users via git
- Remote access to files is required without direct server access

## WORKFLOW

### Uploading Files (Sending)
1. Place files in `06_SCANS/INBOX/transfers/`
2. Commit the files: `git add 06_SCANS/INBOX/transfers/`
3. Push to repository: `git push`

### Downloading Files (Receiving)
1. Pull from repository: `git pull`
2. Files will be available in `06_SCANS/INBOX/transfers/`
3. Move or copy files to appropriate location
4. Clean up: Remove files from transfers/ after retrieval

## IMPORTANT SECURITY NOTES

⚠️ **DO NOT** place sensitive files here, including:
- Documents with SSNs or financial account numbers
- Unredacted personal identifiers
- Attorney-client privileged materials
- Files containing passwords or API keys

✅ **Safe to place here:**
- Non-sensitive zip archives
- Public documents
- Redacted evidence files
- Export files for backup/transfer

## BEST PRACTICES

1. **Clean up regularly** - Remove files after they've been retrieved to avoid repository bloat
2. **Use descriptive names** - Name files clearly so recipients know what they are
3. **Compress when possible** - Use zip or tar.gz to reduce repository size
4. **Verify sensitivity** - Double-check files don't contain sensitive data before committing
5. **Move processed files** - After retrieval, move files to appropriate directories (`new/`, `Salvaged/`, etc.)

## ALTERNATIVE METHODS

If SSH becomes available, consider using:
- `scp` for direct file transfer
- `rsync` for syncing directories
- Direct server access via SFTP

These methods are preferred for large files or frequent transfers as they don't bloat the git repository.

## CLEANUP EXAMPLE

```bash
# After retrieving files, clean up the transfers directory
cd 06_SCANS/INBOX/transfers/
rm your-file.zip
git add .
git commit -m "Clean up transferred files"
git push
```

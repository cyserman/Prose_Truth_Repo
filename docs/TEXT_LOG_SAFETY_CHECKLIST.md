# Text Log Ingestion Safety Checklist

**⚠️ DO NOT INGEST REAL TEXT LOGS UNTIL ALL ITEMS ARE VERIFIED**

---

## Pre-Ingestion Verification

### 1. Immutable Storage ✅
- [ ] Hash fingerprinting implemented (SHA-256)
- [ ] Original files stored with hash fingerprints
- [ ] No modification of original files after ingestion
- [ ] Test: Ingest file → verify hash matches → modify file → verify hash mismatch detected

### 2. Text Log Ingestion ✅
- [ ] File watcher monitoring `06_SCANS/INBOX/`
- [ ] CSV parser supports your export formats
- [ ] TEXTSET_ID assignment working
- [ ] Normalized TextLog records created
- [ ] Test: Drop sample CSV → verify ingestion → verify records created

### 3. Text Spine Viewer ✅
- [ ] Chronological message list displays correctly
- [ ] Messages sorted by timestamp
- [ ] Search/filter working
- [ ] Test: View 100+ messages → verify scroll performance → verify search works

### 4. Message → Event Bridge ✅
- [ ] Can select multiple messages
- [ ] "Create Timeline Event" button works
- [ ] Event created with `source_refs` populated
- [ ] Event links back to source messages
- [ ] Test: Select 3 messages → create event → verify source_refs → verify links work

### 5. Event Status Lifecycle ✅
- [ ] Status field in event editor
- [ ] Status filtering works
- [ ] Judge-facing view suppresses withdrawn/denied
- [ ] Test: Create event → change status → verify filtering → verify suppression

### 6. Export/Import ✅
- [ ] Export includes `source_refs`
- [ ] Export includes status
- [ ] Import restores all fields
- [ ] Test: Create event → export → delete app → import → verify event restored

### 7. Disaster Recovery ✅
- [ ] Can delete app data and regenerate timeline
- [ ] Source files remain untouched
- [ ] Re-importing files recreates text spine
- [ ] Events can be regenerated from source_refs
- [ ] Test: Delete app → re-import files → verify timeline regenerates

### 8. No Cloud Sync ✅
- [ ] No cloud storage enabled
- [ ] No background uploads
- [ ] No telemetry
- [ ] All data stays local
- [ ] Test: Monitor network traffic → verify no uploads

---

## First-Time Ingestion Protocol

### Step 1: Backup Original Files
```bash
# Create backup before first ingestion
cp -r 06_SCANS/INBOX/ 06_SCANS/INBOX_BACKUP_$(date +%Y%m%d)/
```

### Step 2: Test with Sample File
```bash
# Create test CSV with 10-20 messages
# Ingest test file
# Verify:
# - Hash fingerprint created
# - TextLog records created
# - Text spine displays messages
# - Can create event from messages
```

### Step 3: Verify Integrity
```bash
# After ingestion, verify:
# - Original files unchanged
# - Hash fingerprints match
# - All messages ingested
# - No duplicates
```

### Step 4: Create Test Event
```bash
# Select 2-3 test messages
# Create timeline event
# Verify:
# - Event has source_refs
# - Event links back to messages
# - Export includes source_refs
```

### Step 5: Disaster Recovery Test
```bash
# Delete app data
# Re-import files
# Verify:
# - Text spine regenerates
# - Timeline events can be recreated
# - Nothing lost
```

### Step 6: Ingest Real Data
```bash
# Only after all tests pass
# Drop real CSV files in 06_SCANS/INBOX/
# Monitor ingestion
# Verify hash fingerprints
# Verify all messages ingested
```

---

## Ongoing Safety Practices

### Daily
- [ ] Verify backups exist
- [ ] Check hash fingerprints match
- [ ] Verify no cloud sync occurred

### Weekly
- [ ] Export timeline data
- [ ] Backup text log files
- [ ] Verify disaster recovery still works

### Monthly
- [ ] Full system backup
- [ ] Test restore from backup
- [ ] Review security settings

---

## Red Flags (STOP IMMEDIATELY)

If you see any of these, **STOP** and investigate:

- 🔴 Original files modified after ingestion
- 🔴 Hash fingerprints don't match
- 🔴 Messages missing from text spine
- 🔴 Events created without source_refs
- 🔴 Cloud sync detected
- 🔴 Data loss after app deletion
- 🔴 Timeline cannot regenerate from source files

---

## Emergency Procedures

### If Data Loss Detected
1. **STOP** all operations
2. Check `06_SCANS/INBOX_BACKUP_*/` for originals
3. Verify hash fingerprints
4. Re-import from backups
5. Regenerate timeline from source_refs

### If Hash Mismatch Detected
1. **STOP** all operations
2. Compare original file with backup
3. Identify what changed
4. Re-ingest from backup
5. Update hash fingerprints

### If Cloud Sync Detected
1. **STOP** all operations
2. Disable network
3. Check what was uploaded
4. Revoke any API keys
5. Review security settings

---

## Success Criteria

You can safely ingest real text logs when:

✅ All checklist items verified  
✅ Test ingestion successful  
✅ Disaster recovery tested  
✅ No red flags detected  
✅ Backup procedures documented  
✅ Emergency procedures understood  

---

**Remember:** The truth lives in the files, not in the app.  
The app is a view. The files are the source of gravity.

---

**Last Updated:** 2025-01-03  
**Next Review:** After Phase 1 implementation


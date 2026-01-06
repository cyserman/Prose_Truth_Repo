# 🧪 Safe Test Plan - Before Full Ingest

**Purpose:** Verify system integrity before ingesting all 630+ messages  
**Critical:** Do this ONCE before trusting the system with everything

---

## ✅ Test Plan Overview

Three tests that prove the system is safe:
1. **Dry Run** - Import small CSV, verify counts/hashes
2. **Rebuild Test** - Delete storage, re-import, verify identical state
3. **Promotion Test** - Promote spine → timeline, export, rebuild timeline

If all three pass → **Safe to ingest everything**

---

## Test 1: Dry Run

### Steps:
1. Select a small CSV file (10-20 messages)
2. Import via Intake Queue
3. Verify results

### Success Criteria:
- ✅ Message count matches CSV row count (minus headers)
- ✅ No duplicate warnings
- ✅ All messages have unique `comm_id` (COMM-0001, COMM-0002, etc.)
- ✅ All messages have hash values
- ✅ Messages appear in chronological order in Spine View
- ✅ Search works (find a message by content)

### What to Check:
```
✓ Intake Queue shows: "Imported X communication entries"
✓ Spine View shows X messages
✓ Each message has unique ID
✓ Each message has hash
✓ Messages sorted by timestamp
```

### If This Fails:
- Check CSV format (Date, Time, Sender, Recipient, Message columns)
- Check browser console for errors
- Verify file isn't corrupted

---

## Test 2: Rebuild Test

### Steps:
1. Note the exact CSV file used in Test 1
2. Note the exact message count and first/last `comm_id`
3. Clear browser storage (or delete app data)
4. Re-import the SAME CSV file
5. Compare results

### Success Criteria:
- ✅ Same message count
- ✅ Same `comm_id` values (COMM-0001, COMM-0002, etc.)
- ✅ Same hash values for each message
- ✅ Same chronological order
- ✅ No duplicates detected

### What to Check:
```
✓ First message ID matches (should be COMM-0001)
✓ Last message ID matches (should be COMM-00XX)
✓ Hash of first message matches previous import
✓ Hash of last message matches previous import
✓ All messages in same order
```

### If This Fails:
- Hash calculation might be non-deterministic (shouldn't happen)
- ID generation might be non-deterministic (shouldn't happen)
- Database schema might have changed
- **DO NOT PROCEED** - investigate root cause

---

## Test 3: Promotion Test

### Steps:
1. Select 2-3 spine entries in Spine View
2. Promote them to timeline events (fill out form)
3. Export timeline to CSV
4. Delete timeline data only (keep spine)
5. Rebuild timeline from spine references
6. Compare exported CSV with rebuilt timeline

### Success Criteria:
- ✅ Timeline events created successfully
- ✅ Events reference correct `comm_id` values
- ✅ Export CSV contains correct data
- ✅ Timeline can be rebuilt from spine references
- ✅ Rebuilt timeline matches exported CSV

### What to Check:
```
✓ Timeline View shows 2-3 new events
✓ Each event has `spine_refs` array with correct comm_id
✓ Export CSV has correct columns and data
✓ After rebuild, timeline matches export
```

### If This Fails:
- Spine references might be broken
- Timeline export might be incomplete
- **DO NOT PROCEED** - verify promotion workflow

---

## 🎯 Final Verification

After all three tests pass:

1. **Export full database** (JSON dump)
2. **Export comm spine** (CSV)
3. **Export timeline** (CSV)
4. **Save all exports** to safe location
5. **Clear browser storage**
6. **Re-import CSV**
7. **Verify identical state**

If this final verification passes → **System is safe for full ingest**

---

## ⚠️ Red Flags (Stop if you see these)

- ❌ Different hash values for same content
- ❌ Different IDs for same messages on re-import
- ❌ Missing messages after re-import
- ❌ Duplicate messages appearing
- ❌ Timeline events losing spine references
- ❌ Export data doesn't match database state

**If any red flag appears → STOP → Investigate → Fix → Re-test**

---

## 📋 Test Checklist

Print this and check off as you go:

- [ ] Test 1: Dry Run - Import small CSV
  - [ ] Count matches
  - [ ] No duplicates
  - [ ] Unique IDs
  - [ ] Hashes present
  - [ ] Chronological order
  - [ ] Search works

- [ ] Test 2: Rebuild Test - Re-import same CSV
  - [ ] Same count
  - [ ] Same IDs
  - [ ] Same hashes
  - [ ] Same order
  - [ ] No duplicates

- [ ] Test 3: Promotion Test - Spine → Timeline
  - [ ] Events created
  - [ ] Spine refs correct
  - [ ] Export works
  - [ ] Rebuild works
  - [ ] Matches export

- [ ] Final Verification - Full export/import cycle
  - [ ] Export all data
  - [ ] Clear storage
  - [ ] Re-import
  - [ ] Verify identical state

---

## ✅ Success = Safe to Ingest Everything

If all tests pass, you can confidently:
- Import all 630+ messages
- Import all scans
- Build full timeline
- Trust the system with your case

**The system is now court-safe and survivor-safe.**

---

**Last Updated:** 2025-01-04  
**Status:** Ready for testing


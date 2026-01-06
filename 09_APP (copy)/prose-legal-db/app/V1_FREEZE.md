# 🔒 V1 Invariants - FROZEN

**Date:** 2025-01-04  
**Status:** 🔒 **LOCKED** - Do not change until after real-world use

---

## ⚠️ CRITICAL: These Rules Cannot Change

These invariants are the foundation of court-safety. They prevent:
- Accidental data loss
- Narrative drift
- AI "helpfulness" corrupting truth
- Future changes breaking forensic integrity

**Do not modify these until after you've used the system with real data.**

---

## 🔒 V1 Invariants (Immutable)

### 1. `original_text` is Immutable
- ✅ Once stored, `original_text` is NEVER modified
- ✅ No edits, no rewrites, no AI summarization
- ✅ This is the black box - it records reality, not interpretation

### 2. Spine Data is Append-Only
- ✅ Spine entries are never deleted
- ✅ Spine entries are never edited
- ✅ Only new entries can be added
- ✅ Duplicate detection prevents re-ingestion corruption

### 3. Timeline Events Reference Spine IDs
- ✅ Timeline events contain `spine_refs: string[]` (array of comm_id)
- ✅ Timeline events NEVER embed spine content
- ✅ Timeline events can be deleted/rebuilt without touching spine
- ✅ Spine can be re-imported without breaking timeline references

### 4. Sticky Notes are Private by Default
- ✅ `isPrivate: true` by default
- ✅ Private notes are NOT exported unless explicitly allowed
- ✅ Notes are thinking scaffolding, not evidence
- ✅ Courts never see them unless you choose to export

### 5. No Automatic Promotion
- ✅ Spine → Timeline promotion is ALWAYS manual
- ✅ User must explicitly select spine items
- ✅ User must fill out timeline event form
- ✅ No AI auto-promotion, no batch promotion without confirmation

### 6. No AI Runs Without Explicit User Action
- ✅ AI neutralization is opt-in only
- ✅ User must click "Neutralize" button
- ✅ System works completely without AI (rules-based fallback)
- ✅ No background AI processing, no auto-summarization

---

## ✅ What You CAN Add (Without Breaking Invariants)

- Search/filter UI in spine viewer
- Visual density cues in timeline
- Export formats (PDF, different CSV layouts)
- UI improvements (colors, layouts, responsiveness)
- Performance optimizations (indexing, caching)
- Additional importers (new formats)
- Additional export formats

## ❌ What You CANNOT Change (V1 Freeze)

- Making `original_text` editable
- Allowing spine entry deletion/editing
- Embedding spine content in timeline events
- Auto-promoting spine items to timeline
- Running AI without user action
- Making sticky notes public by default
- Removing duplicate detection
- Removing hash fingerprinting

---

## 🧪 Before Modifying These Rules

1. Use the system with real data (630+ messages)
2. Export and verify data integrity
3. Rebuild from exports and verify identical state
4. Document why the change is necessary
5. Ensure change doesn't break forensic integrity
6. Test thoroughly before committing

---

## 📋 Why These Rules Exist

These invariants ensure:

1. **Forensic Integrity**: Data can be verified, traced, and audited
2. **Court Safety**: No "helpful" AI rewrites that could be challenged
3. **Survivability**: System can be rebuilt from source files
4. **Transparency**: Clear separation between truth (spine) and narrative (timeline)
5. **Privacy**: Thinking tools (sticky notes) stay private

---

**Remember:** These rules protect you from:
- Accidental data loss
- Narrative drift
- AI "helpfulness" corrupting evidence
- Future changes breaking forensic integrity

**Do not touch these until you've proven the system works with real data.**

---

**Last Updated:** 2025-01-04  
**Next Review:** After real-world use with 630+ messages


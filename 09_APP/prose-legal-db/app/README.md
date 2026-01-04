# Pro Se Legal DB - The Truth Repo

**Court-safe, local-first evidence management system**

---

## 🎯 Purpose

Single, authoritative source of truth for pro se legal case management. Designed to survive device failure and counsel changes.

**Core Principle:** The record speaks, so you don't have to.

---

## ✅ What You Have Now

### V1.3 - CSV Import Ready ✅

You've reached the inflection point where this becomes safe for real case use:

1. **True Spine** - Immutable text-log ingestion with duplicate detection
2. **Correct Separation** - Three clean layers (Spine, Timeline, Sticky Notes)
3. **Local-Only Survivability** - No cloud dependency, rebuildable from CSV

---

## 🏗️ Architecture

### Four Clean Layers

1. **Data Layer** (`lib/db.js`) - Pure database operations
2. **Domain Logic** (`lib/spine/*`, `lib/importers/*`) - Importers/builders (no UI)
3. **Presentation** (`components/*`) - UI components (no business logic)
4. **Optional AI** (`lib/neutralize.js`) - Isolated, optional neutralization

### Three Core Systems

- **Spine** - Raw historical truth (immutable, chronological)
- **Timeline** - Legal narrative (human-curated, judge-facing)
- **Sticky Notes** - Thinking scaffolding (private, memory anchors)

---

## 🚀 Quick Start

```bash
cd 09_APP/prose-legal-db/app
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 📋 Workflow

### 1. Import → Spine (Automatic)
- CSV files imported via Intake Queue
- Messages fingerprinted (hash)
- Stored read-only
- Categorized for navigation
- **Nothing is argued yet**

### 2. Read → Annotate (Sticky Notes)
- Attach notes to spine items, events, dates
- Private by default
- Never exported unless explicitly allowed
- Pattern recognition aids

### 3. Promote (Manual, Intentional)
- Select spine items
- Promote to Timeline Event
- Assign class, status, lane
- **Only now does it become part of legal story**

### 4. Timeline = What Judge Sees
- Timeline entries reference spine items
- Do not rewrite them
- Can be exported, printed, filtered
- Stand on their own

---

## 🔒 V1 Invariants (FROZEN)

These rules cannot change until after real-world use:

1. ✅ `original_text` is immutable
2. ✅ Spine data is append-only
3. ✅ Timeline events reference spine IDs (never embed content)
4. ✅ Sticky notes are private by default
5. ✅ No automatic promotion
6. ✅ No AI runs without explicit user action

**See `V1_FREEZE.md` for details**

---

## 🧪 Testing

**Before ingesting everything, run the Safe Test Plan:**

1. **Dry Run** - Import small CSV, verify counts/hashes
2. **Rebuild Test** - Delete storage, re-import, verify identical state
3. **Promotion Test** - Promote spine → timeline, export, rebuild

**See `SAFE_TEST_PLAN.md` for complete test procedure**

---

## 📁 Key Files

- `V1_FREEZE.md` - Locked invariants (do not change)
- `SAFE_TEST_PLAN.md` - Pre-ingest verification steps
- `ARCHITECTURE.md` - Technical architecture details
- `HANDOFF_COMPLETE.md` - Implementation summary

---

## 🎯 What This System Does

- ✅ Preserves reality in order, without embellishment
- ✅ Reduces how much you have to speak
- ✅ Prevents over-explanation
- ✅ Lets patterns emerge on their own
- ✅ Survives hostile environments
- ✅ Rebuildable from source files

---

## ⚠️ What This System Does NOT Do

- ❌ Auto-summarize or rewrite content
- ❌ Make legal arguments
- ❌ Sync to cloud
- ❌ Require internet connection
- ❌ Auto-promote spine items
- ❌ Run AI without permission

---

## 🧭 Next Steps (After Testing)

When ready:
- Search/filter in spine viewer
- Visual density cues in timeline
- Export formats judges expect (simple PDFs)

**No more architecture changes for a while.**

---

## 📚 Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **V1 Freeze**: See `V1_FREEZE.md`
- **Test Plan**: See `SAFE_TEST_PLAN.md`
- **Handoff**: See `HANDOFF_COMPLETE.md`

---

## 🙏 Acknowledgments

Built following the Truth Repo constitution:
- Never overwrite originals
- Local-first, no cloud sync
- Preserve chronology
- Let the record speak

**This system honors the invariants we've been circling since the beginning.**

---

**Status:** ✅ V1.3 - CSV Import Ready  
**Next:** Run Safe Test Plan → Ingest real data


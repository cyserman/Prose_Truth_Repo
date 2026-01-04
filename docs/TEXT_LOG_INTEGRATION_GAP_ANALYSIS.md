# Text Log → Timeline Integration: Gap Analysis & Implementation Plan

**Date:** 2025-01-03  
**Status:** ⚠️ **NOT READY FOR PRODUCTION USE**  
**Critical Gaps:** Text log ingestion layer missing

---

## Executive Summary

The current CaseTimeline mobile app is a **timeline viewer/editor** but lacks the **text log ingestion spine** required by your spec. It can display and edit events, but cannot:

- Ingest raw text logs from `06_SCANS/INBOX/`
- Create immutable, hash-fingerprinted text log records
- Provide a text spine viewer for chronological navigation
- Enable manual message selection → event creation workflow
- Track event status lifecycle (asserted/denied/withdrawn)
- Link events to source messages via `source_refs`

**Risk Level:** 🔴 **HIGH** - Without the text log spine, you cannot safely ingest your communication data.

---

## Current Implementation Status

### ✅ What EXISTS (CaseTimeline Mobile App)

1. **Local Storage**
   - ✅ AsyncStorage for timeline data persistence
   - ✅ Local-only (no cloud sync in app layer)
   - ✅ Export/Import JSON functionality

2. **Timeline Management**
   - ✅ Swimlane grid view
   - ✅ Event creation/editing/deletion
   - ✅ Year navigation and zoom controls
   - ✅ CSV import for timeline events (not text logs)

3. **Event Structure**
   - ✅ Basic event fields (id, date, type, note, attachments)
   - ✅ Voice notes support
   - ✅ Attachments support

### ❌ What's MISSING (Critical for Your Spec)

1. **Text Log Ingestion System**
   - ❌ No file watcher for `06_SCANS/INBOX/`
   - ❌ No CSV/PDF/XLS parser for text exports
   - ❌ No hash fingerprinting (SHA-256)
   - ❌ No immutable storage layer
   - ❌ No TEXTSET_ID assignment

2. **Text Spine (Captain Mode)**
   - ❌ No chronological message viewer
   - ❌ No scrollable time-ordered message list
   - ❌ No context memory anchor
   - ❌ No gaslighting detection tools

3. **Message → Event Bridge**
   - ❌ No manual message selection UI
   - ❌ No "Create Timeline Event" workflow from messages
   - ❌ No `source_refs` field in Event model
   - ❌ No multi-message → single-event aggregation

4. **Event Status Lifecycle**
   - ❌ No status field (asserted/denied/withdrawn/pending/resolved)
   - ❌ No status-based filtering
   - ❌ No judge-facing view suppression

5. **Data Model Gaps**
   - ❌ Event model missing `source_refs: string[]`
   - ❌ Event model missing `status: EventStatus`
   - ❌ No TextLog model at all
   - ❌ No TextSet model

---

## Required Data Models

### TextLog (NEW - Required)

```typescript
interface TextLog {
  msg_id: string;              // "TXT-2024-A-000143"
  timestamp: string;            // ISO 8601
  direction: "inbound" | "outbound";
  counterparty: string;
  text_original: string;        // NEVER MODIFIED
  source_file: string;          // "sms_export_2024.csv"
  source_hash: string;          // SHA-256 of original file
  textset_id: string;           // "TXT-2024-A"
  immutable: true;              // Always true
  date_range_start?: string;
  date_range_end?: string;
}
```

### TextSet (NEW - Required)

```typescript
interface TextSet {
  textset_id: string;           // "TXT-2024-A"
  source_files: string[];       // ["sms_export_2024.csv"]
  source_hashes: string[];      // SHA-256 hashes
  date_range_start: string;
  date_range_end: string;
  message_count: number;
  created_at: string;
  immutable: true;
}
```

### Event (MODIFY - Add Fields)

```typescript
enum EventClass {
  COURT_LEGAL = "court_legal",        // High authority (motions, orders, PFAs)
  CUSTODY_PARENTING = "custody",      // Medium authority (exchanges, schedules)
  EVIDENCE_METADATA = "evidence",     // Availability tracking only
  ADMINISTRATIVE = "administrative"   // Status changes (housing, counsel, etc.)
}

enum EventStatus {
  ASSERTED = "asserted",
  DENIED = "denied",
  WITHDRAWN = "withdrawn",
  PENDING = "pending",
  RESOLVED = "resolved"
}

interface Event {
  id: string;
  year: number;
  laneId: string;
  monthIndex: number;
  typeId: string;
  note: string;                 // Summary, not raw text (factual ledger entry)
  attachments: Attachment[];
  voiceNote?: VoiceNote;
  createdAt: string;
  updatedAt: string;
  
  // NEW FIELDS REQUIRED:
  class: EventClass;            // Court/Legal, Custody, Evidence, Administrative
  source_refs: string[];         // ["TXT-2024-A-000143", "TXT-2024-A-000144"]
  status: EventStatus;          // "asserted" | "denied" | "withdrawn" | "pending" | "resolved"
  
  // Court/Legal specific fields:
  date_filed?: string;          // For motions/filings
  forum?: string;               // Court/jurisdiction
  party?: string;               // Filing party
  relief_requested?: string;     // Short description
  document_reference?: string;    // Exhibit/doc reference
}
```

### StickyNote (NEW - Required)

```typescript
interface StickyNote {
  id: string;
  scope: "date" | "event" | "lane";
  targetId: string;             // date range string, event ID, or lane ID
  text: string;                 // Private cognition scaffolding
  createdAt: string;
  visibility: "private" | "exportable";  // Default: "private"
}

// Sticky notes are:
// - Private by default
// - Non-exportable unless opt-in
// - Not judge-facing
// - Not evidence
// - Thinking scaffolding, not facts
// - Separate data store from events
```

---

## Implementation Plan

### Phase 1: Text Log Ingestion Layer (CRITICAL)

**Priority:** 🔴 **HIGHEST** - Required before any text log ingestion

**Tasks:**

1. **File System Watcher**
   - Create service to monitor `06_SCANS/INBOX/`
   - Detect new CSV/PDF/XLS files
   - Trigger ingestion pipeline

2. **Hash Fingerprinting**
   - Implement SHA-256 hashing for all ingested files
   - Store hash with file metadata
   - Prevent duplicate ingestion

3. **CSV Parser for Text Logs**
   - Parse SMS/AppClose/iOS export formats
   - Normalize to TextLog model
   - Assign TEXTSET_ID
   - Store in immutable storage

4. **Immutable Storage Layer**
   - Create `04_TEXT_LOGS/` directory structure
   - Store original files with hash fingerprints
   - Create normalized JSON index
   - Never modify originals

**Files to Create:**
- `09_APP/text-log-ingestion/ingestion-service.ts`
- `09_APP/text-log-ingestion/hash-fingerprint.ts`
- `09_APP/text-log-ingestion/csv-parser.ts`
- `09_APP/text-log-ingestion/storage-layer.ts`

**Estimated Time:** 2-3 days

---

### Phase 2: Text Spine Viewer (Captain Mode)

**Priority:** 🟡 **HIGH** - Required for navigation and context

**Tasks:**

1. **Chronological Message List**
   - Scrollable timeline of all messages
   - Group by date/time
   - Show counterparty, direction, preview
   - Link to source file

2. **Search & Filter**
   - Search by counterparty
   - Filter by date range
   - Filter by direction (inbound/outbound)
   - Filter by textset_id

3. **Context Memory Tools**
   - "What was happening here?" annotations
   - Emotion markers (private, not exported)
   - Pattern detection helpers

**Files to Create:**
- `09_APP/CaseTimeline/components/text-spine/TextSpineViewer.tsx`
- `09_APP/CaseTimeline/components/text-spine/MessageList.tsx`
- `09_APP/CaseTimeline/components/text-spine/MessageCard.tsx`
- `09_APP/CaseTimeline/lib/text-spine-context.tsx`

**Estimated Time:** 2-3 days

---

### Phase 3: Message → Event Bridge

**Priority:** 🟡 **HIGH** - Core workflow requirement

**Tasks:**

1. **Manual Selection UI**
   - Multi-select messages in text spine
   - "Create Timeline Event" button
   - Event editor pre-populated with message context

2. **Event Creation Workflow**
   - User selects 1+ messages
   - User clicks "Create Event"
   - Event editor opens with:
     - Date pre-filled from message timestamp
     - Note field for summary (not raw text)
     - `source_refs` auto-populated with message IDs
   - User adds lane, type, summary
   - Event created with `status: "asserted"`

3. **Source Reference Tracking**
   - Display source_refs in event details
   - Link back to original messages
   - Show message preview on hover/tap

**Files to Modify:**
- `09_APP/CaseTimeline/components/event/EventEditor.tsx` (add source_refs field)
- `09_APP/CaseTimeline/types/timeline.ts` (add source_refs, status fields)

**Files to Create:**
- `09_APP/CaseTimeline/components/text-spine/MessageSelector.tsx`
- `09_APP/CaseTimeline/components/text-spine/CreateEventFromMessages.tsx`

**Estimated Time:** 2-3 days

---

### Phase 4: Event Status Lifecycle

**Priority:** 🟢 **MEDIUM** - Important for court-ready output

**Tasks:**

1. **Status Field Implementation**
   - Add status dropdown to event editor
   - Default: "asserted"
   - Options: asserted, denied, withdrawn, pending, resolved

2. **Status-Based Filtering**
   - Filter timeline by status
   - Judge-facing view (suppress withdrawn/denied by default)
   - Status indicators in timeline grid

3. **Status History Tracking**
   - Log status changes with timestamps
   - Show status history in event details

**Files to Modify:**
- `09_APP/CaseTimeline/types/timeline.ts` (add EventStatus type)
- `09_APP/CaseTimeline/components/event/EventEditor.tsx` (add status field)
- `09_APP/CaseTimeline/components/timeline/TimelineGrid.tsx` (add status filtering)

**Estimated Time:** 1-2 days

---

### Phase 5: Integration & Testing

**Priority:** 🟢 **MEDIUM** - Ensure everything works together

**Tasks:**

1. **End-to-End Workflow Test**
   - Drop CSV file in `06_SCANS/INBOX/`
   - Verify ingestion → hash → storage
   - Verify text spine displays messages
   - Verify message selection → event creation
   - Verify event has source_refs
   - Verify export includes all data

2. **Disaster Recovery Test**
   - Delete app data
   - Re-import files
   - Verify timeline regenerates from source_refs
   - Verify nothing is lost

3. **Performance Testing**
   - Test with 10,000+ messages
   - Test with multiple text sets
   - Verify scroll performance
   - Verify search performance

**Estimated Time:** 2-3 days

---

## Safety Checklist (Before Ingesting Real Data)

Before you drop your actual text logs into `06_SCANS/INBOX/`, verify:

- [ ] Hash fingerprinting implemented and tested
- [ ] Immutable storage layer working
- [ ] Original files never modified
- [ ] Text spine viewer functional
- [ ] Message → event bridge working
- [ ] Source references tracked correctly
- [ ] Export includes source_refs
- [ ] Disaster recovery tested (delete app, re-import, verify regeneration)
- [ ] No cloud sync enabled
- [ ] No telemetry enabled
- [ ] Backup workflow documented

---

## Current Risk Assessment

### 🔴 **DO NOT INGEST REAL TEXT LOGS YET**

**Why:**
1. No hash fingerprinting → Cannot detect duplicates or verify integrity
2. No immutable storage → Risk of accidental modification
3. No text spine → Cannot navigate or select messages
4. No source_refs → Events cannot link back to originals
5. No status lifecycle → Cannot manage event visibility

**What CAN be done safely:**
- ✅ Use CaseTimeline for manual event entry (without text log sources)
- ✅ Test with sample/dummy CSV files
- ✅ Review timeline UI/UX
- ✅ Test export/import of manually created events

---

## Recommended Next Steps

1. **Immediate:** Implement Phase 1 (Text Log Ingestion Layer)
   - This is the foundation. Nothing else works without it.

2. **Short-term:** Implement Phase 2 (Text Spine Viewer)
   - Required for the manual selection workflow

3. **Short-term:** Implement Phase 3 (Message → Event Bridge)
   - Core workflow requirement

4. **Medium-term:** Implement Phase 4 (Event Status Lifecycle)
   - Important for court-ready output

5. **Before Production:** Complete Phase 5 (Integration & Testing)
   - Verify end-to-end workflow
   - Test disaster recovery
   - Document backup procedures

---

## Questions to Answer Before Implementation

1. **Storage Location:** Where should text logs be stored?
   - Option A: `04_TEXT_LOGS/` (new directory)
   - Option B: `06_SCANS/PROCESSED/` (existing structure)
   - Option C: Database file (SQLite/JSON)

2. **File Format:** What CSV formats need to be supported?
   - SMS exports (which carriers?)
   - AppClose exports
   - iOS Messages exports
   - Android SMS backups
   - Other formats?

3. **Mobile vs Desktop:** Where should ingestion happen?
   - Option A: Desktop tool (Node.js script)
   - Option B: Mobile app (CaseTimeline)
   - Option C: Both (sync via file system)

4. **Performance:** Expected message volume?
   - < 1,000 messages → Simple implementation OK
   - 1,000-10,000 → Need indexing
   - > 10,000 → Need database + pagination

---

## Conclusion

The CaseTimeline mobile app is a solid **timeline viewer/editor** but needs a **text log ingestion spine** to meet your spec requirements. The current implementation is **NOT READY** for ingesting real text logs.

**Estimated Total Implementation Time:** 8-12 days of focused development

**Critical Path:** Phase 1 → Phase 2 → Phase 3 (must be done in order)

Once Phase 1-3 are complete, you can safely ingest text logs and use the manual selection workflow to create timeline events.

---

**Last Updated:** 2025-01-03  
**Next Review:** After Phase 1 completion


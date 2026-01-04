# Implementation Roadmap: Text Log → Timeline Integration

**Status:** Planning Phase  
**Last Updated:** 2025-01-03  
**Architecture:** See `docs/TIMELINE_ARCHITECTURE.md`

---

## Overview

This roadmap implements the **Text Log → Timeline Integration** system according to the architectural specification in `docs/TIMELINE_ARCHITECTURE.md`.

**Core Principle:** The timeline is a procedural + factual ledger. Text logs are the truth spine. Sticky notes are private cognition. Nothing moves forward without intent.

---

## Implementation Phases

### Phase 0: Architecture & Data Models ✅ COMPLETE

**Status:** ✅ Complete

**Deliverables:**
- [x] `docs/TIMELINE_ARCHITECTURE.md` - Architectural specification
- [x] `docs/TEXT_LOG_INTEGRATION_GAP_ANALYSIS.md` - Gap analysis
- [x] `docs/TEXT_LOG_SAFETY_CHECKLIST.md` - Safety procedures
- [x] Updated `09_APP/CaseTimeline/types/timeline.ts` with EventClass, EventStatus, StickyNote

**Key Decisions:**
- Event classification system (Court/Legal, Custody, Evidence, Administrative)
- Event status lifecycle (asserted, denied, withdrawn, pending, resolved)
- Sticky notes as separate data store (private by default)
- Source references linking events to TextLog messages

---

### Phase 1: Text Log Ingestion Layer 🔴 CRITICAL

**Priority:** 🔴 **HIGHEST** - Required before any text log ingestion

**Status:** ⏳ Not Started

**Goal:** Create immutable, hash-fingerprinted text log storage system.

**Tasks:**

1. **File System Watcher**
   - Monitor `06_SCANS/INBOX/` for new files
   - Detect CSV/PDF/XLS files
   - Trigger ingestion pipeline
   - **File:** `09_APP/text-log-ingestion/file-watcher.ts`

2. **Hash Fingerprinting**
   - Implement SHA-256 hashing for all ingested files
   - Store hash with file metadata
   - Prevent duplicate ingestion
   - **File:** `09_APP/text-log-ingestion/hash-fingerprint.ts`

3. **CSV Parser for Text Logs**
   - Parse SMS/AppClose/iOS export formats
   - Normalize to TextLog model
   - Assign TEXTSET_ID
   - Store in immutable storage
   - **File:** `09_APP/text-log-ingestion/csv-parser.ts`

4. **Immutable Storage Layer**
   - Create `04_TEXT_LOGS/` directory structure
   - Store original files with hash fingerprints
   - Create normalized JSON index
   - Never modify originals
   - **File:** `09_APP/text-log-ingestion/storage-layer.ts`

5. **TextLog & TextSet Data Models**
   - Implement TextLog interface
   - Implement TextSet interface
   - Create storage schema
   - **File:** `09_APP/text-log-ingestion/types.ts`

**Acceptance Criteria:**
- [ ] Can drop CSV file in `06_SCANS/INBOX/`
- [ ] File is hash-fingerprinted (SHA-256)
- [ ] TextLog records created and stored
- [ ] Original file never modified
- [ ] Duplicate detection works
- [ ] TEXTSET_ID assignment works

**Estimated Time:** 2-3 days

**Dependencies:** None

---

### Phase 2: Text Spine Viewer (Captain Mode) 🟡 HIGH

**Priority:** 🟡 **HIGH** - Required for navigation and context

**Status:** ⏳ Not Started

**Goal:** Create chronological message viewer for private navigation.

**Tasks:**

1. **Chronological Message List**
   - Scrollable timeline of all messages
   - Group by date/time
   - Show counterparty, direction, preview
   - Link to source file
   - **File:** `09_APP/CaseTimeline/components/text-spine/MessageList.tsx`

2. **Search & Filter**
   - Search by counterparty
   - Filter by date range
   - Filter by direction (inbound/outbound)
   - Filter by textset_id
   - **File:** `09_APP/CaseTimeline/components/text-spine/MessageFilters.tsx`

3. **Context Memory Tools**
   - "What was happening here?" annotations
   - Emotion markers (private, not exported)
   - Pattern detection helpers
   - **File:** `09_APP/CaseTimeline/components/text-spine/ContextTools.tsx`

4. **Text Spine Context Provider**
   - State management for text spine
   - Load TextLog records
   - Search/filter logic
   - **File:** `09_APP/CaseTimeline/lib/text-spine-context.tsx`

5. **Text Spine Screen**
   - Main screen component
   - Integrate MessageList, Filters, ContextTools
   - **File:** `09_APP/CaseTimeline/app/(tabs)/text-spine.tsx`

**Acceptance Criteria:**
- [ ] Can view all messages chronologically
- [ ] Messages sorted by timestamp
- [ ] Search works
- [ ] Filters work
- [ ] Scroll performance acceptable (1000+ messages)
- [ ] Private annotations work

**Estimated Time:** 2-3 days

**Dependencies:** Phase 1

---

### Phase 3: Message → Event Bridge 🟡 HIGH

**Priority:** 🟡 **HIGH** - Core workflow requirement

**Status:** ⏳ Not Started

**Goal:** Enable manual message selection → event creation workflow.

**Tasks:**

1. **Manual Selection UI**
   - Multi-select messages in text spine
   - Visual selection indicators
   - Selection count display
   - **File:** `09_APP/CaseTimeline/components/text-spine/MessageSelector.tsx`

2. **Create Event from Messages**
   - "Create Timeline Event" button
   - Event editor pre-populated with message context
   - Auto-populate date from message timestamp
   - Auto-populate source_refs with message IDs
   - **File:** `09_APP/CaseTimeline/components/text-spine/CreateEventFromMessages.tsx`

3. **Event Editor Updates**
   - Add source_refs field
   - Add status field (default: "asserted")
   - Add class field (EventClass)
   - Add court/legal specific fields (optional)
   - **File:** `09_APP/CaseTimeline/components/event/EventEditor.tsx`

4. **Source Reference Display**
   - Show source_refs in event details
   - Link back to original messages
   - Show message preview on hover/tap
   - **File:** `09_APP/CaseTimeline/components/event/EventSourceRefs.tsx`

5. **Event Model Updates**
   - Update Event interface with new fields
   - Update reducer to handle new fields
   - Update storage to persist new fields
   - **File:** `09_APP/CaseTimeline/types/timeline.ts` (already updated)
   - **File:** `09_APP/CaseTimeline/lib/timeline-context.tsx`

**Acceptance Criteria:**
- [ ] Can select multiple messages
- [ ] "Create Event" button works
- [ ] Event created with source_refs populated
- [ ] Event links back to source messages
- [ ] Event has status field (default: "asserted")
- [ ] Event has class field

**Estimated Time:** 2-3 days

**Dependencies:** Phase 1, Phase 2

---

### Phase 4: Event Status Lifecycle 🟢 MEDIUM

**Priority:** 🟢 **MEDIUM** - Important for court-ready output

**Status:** ⏳ Not Started

**Goal:** Implement event status tracking and filtering.

**Tasks:**

1. **Status Field Implementation**
   - Add status dropdown to event editor
   - Default: "asserted"
   - Options: asserted, denied, withdrawn, pending, resolved
   - **File:** `09_APP/CaseTimeline/components/event/EventStatusSelector.tsx`

2. **Status-Based Filtering**
   - Filter timeline by status
   - Judge-facing view (suppress withdrawn/denied by default)
   - Status indicators in timeline grid
   - **File:** `09_APP/CaseTimeline/components/timeline/StatusFilter.tsx`

3. **Status History Tracking**
   - Log status changes with timestamps
   - Show status history in event details
   - **File:** `09_APP/CaseTimeline/components/event/EventStatusHistory.tsx`

4. **Judge-Facing View**
   - Toggle for judge-facing mode
   - Suppress private notes
   - Suppress withdrawn/denied events
   - Export filtered timeline
   - **File:** `09_APP/CaseTimeline/components/timeline/JudgeFacingView.tsx`

**Acceptance Criteria:**
- [ ] Status field in event editor
   - Status filtering works
   - Judge-facing view suppresses withdrawn/denied
   - Status history tracked
   - Export includes status

**Estimated Time:** 1-2 days

**Dependencies:** Phase 3

---

### Phase 5: Sticky Notes System 🟢 MEDIUM

**Priority:** 🟢 **MEDIUM** - Important for usability

**Status:** ⏳ Not Started

**Goal:** Implement private cognition scaffolding system.

**Tasks:**

1. **Sticky Note Data Model**
   - Already defined in `types/timeline.ts`
   - Separate storage from events
   - **File:** `09_APP/CaseTimeline/lib/sticky-notes-context.tsx`

2. **Sticky Note UI**
   - Add sticky note button to timeline
   - Sticky note editor
   - Display sticky notes on timeline
   - **File:** `09_APP/CaseTimeline/components/sticky/StickyNoteEditor.tsx`
   - **File:** `09_APP/CaseTimeline/components/sticky/StickyNoteDisplay.tsx`

3. **Sticky Note Management**
   - Create/update/delete sticky notes
   - Attach to dates/events/lanes
   - Visibility control (private/exportable)
   - **File:** `09_APP/CaseTimeline/components/sticky/StickyNoteManager.tsx`

4. **Export Control**
   - Sticky notes private by default
   - Opt-in export checkbox
   - Export filtered timeline (with or without sticky notes)
   - **File:** `09_APP/CaseTimeline/lib/export-import.ts` (update)

**Acceptance Criteria:**
- [ ] Can create sticky notes
- [ ] Sticky notes attach to dates/events/lanes
- [ ] Sticky notes private by default
- [ ] Opt-in export works
- [ ] Sticky notes separate from events

**Estimated Time:** 1-2 days

**Dependencies:** Phase 3

---

### Phase 6: Integration & Testing 🟢 MEDIUM

**Priority:** 🟢 **MEDIUM** - Ensure everything works together

**Status:** ⏳ Not Started

**Goal:** End-to-end testing and disaster recovery verification.

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

4. **Safety Checklist Verification**
   - Run through `docs/TEXT_LOG_SAFETY_CHECKLIST.md`
   - Verify all items pass
   - Document any issues

**Acceptance Criteria:**
- [ ] End-to-end workflow works
- [ ] Disaster recovery works
- [ ] Performance acceptable
- [ ] Safety checklist passes

**Estimated Time:** 2-3 days

**Dependencies:** Phase 1-5

---

## Critical Path

**Must be done in order:**

1. **Phase 1** (Text Log Ingestion) → Foundation
2. **Phase 2** (Text Spine Viewer) → Navigation
3. **Phase 3** (Message → Event Bridge) → Core workflow
4. **Phase 4-6** (Status, Sticky Notes, Testing) → Polish

---

## Estimated Timeline

- **Phase 1:** 2-3 days
- **Phase 2:** 2-3 days
- **Phase 3:** 2-3 days
- **Phase 4:** 1-2 days
- **Phase 5:** 1-2 days
- **Phase 6:** 2-3 days

**Total:** 10-16 days of focused development

---

## Risk Mitigation

### High Risk Items

1. **Text Log Ingestion Performance**
   - Risk: Large files (10,000+ messages) slow ingestion
   - Mitigation: Implement streaming parser, batch processing

2. **Storage Size**
   - Risk: Text logs + timeline data exceeds device storage
   - Mitigation: Implement compression, cleanup old data

3. **Disaster Recovery**
   - Risk: Data loss if app deleted
   - Mitigation: Regular exports, backup procedures

### Medium Risk Items

1. **CSV Format Variations**
   - Risk: Different export formats not supported
   - Mitigation: Extensible parser, format detection

2. **Performance with Large Timelines**
   - Risk: Timeline grid slow with 1000+ events
   - Mitigation: Virtual scrolling, pagination

---

## Success Criteria

System is ready for production when:

- [ ] All phases complete
- [ ] End-to-end workflow tested
- [ ] Disaster recovery verified
- [ ] Performance acceptable
- [ ] Safety checklist passes
- [ ] Documentation complete

---

## Next Steps

1. **Review Architecture:** Read `docs/TIMELINE_ARCHITECTURE.md`
2. **Review Gap Analysis:** Read `docs/TEXT_LOG_INTEGRATION_GAP_ANALYSIS.md`
3. **Review Safety Checklist:** Read `docs/TEXT_LOG_SAFETY_CHECKLIST.md`
4. **Start Phase 1:** Implement text log ingestion layer
5. **Test with Sample Data:** Before ingesting real logs

---

**Last Updated:** 2025-01-03  
**Status:** Ready for Phase 1 implementation


# Timeline Architecture: What Belongs and What Doesn't

**Core Principle:** The timeline is a **procedural + factual ledger**, not a diary and not an evidence dump.

---

## 1. What BELONGS on the Timeline

### A. Court / Legal Events (High Authority)

**These are spine-level events. They almost always belong on the timeline.**

#### 1. Motions & Filings

**Examples:**
- Divorce Complaint filed
- Petition for Exclusive Possession
- Motion to Compel
- Response / Answer filed
- Withdrawal of filing

**Why they belong:**
- They change procedural posture
- They reset clocks
- They create or destroy leverage

**Timeline fields:**
- `date_filed`
- `forum`
- `party`
- `relief_requested` (short)
- `status` (asserted / withdrawn / denied / granted)
- `document_reference`

#### 2. Orders

**Examples:**
- Temporary custody order
- Exclusive possession order
- Scheduling order
- Continuance

**Why they belong:**
Orders are **effects**, not arguments. Judges care deeply about effects.

**Key rule:**
- Orders should **never** be merged with motions.
- **Motions = intent**
- **Orders = consequence**

#### 3. PFAs (as procedural objects, not allegations)

PFAs are their own class because they distort timelines.

**Track them as:**
- filed
- served
- expired
- withdrawn
- dismissed
- re-filed

**Do NOT argue them on the timeline.**
Just show:
- when they appeared
- how long they lasted
- what they affected (housing, custody, contact)

This alone often tells the story.

---

### B. Custody / Parenting Events (Medium Authority)

**These belong on the timeline only when they affect access or structure, not feelings.**

**Examples:**
- Missed pickup due to vehicle failure
- Custody exchange denied
- Temporary schedule imposed
- Holiday visit allowed / denied

**Rule of thumb:**
If it changes time with children, it belongs.

---

### C. Evidence Events (Metadata only)

**This is subtle but important.**

The timeline should **NOT** contain evidence.
It should contain **evidence milestones**.

**Examples:**
- Exhibit CL-018 created (text thread)
- Financial records compiled
- GPS log period completed
- Witness statement obtained

**You are tracking availability, not content.**

This lets a judge (or lawyer) see preparedness without drowning.

---

### D. Administrative / Status Events

**Often overlooked, but very powerful.**

**Examples:**
- Loss of housing
- Change of address (or "no fixed address" noted)
- Counsel withdrawal
- Pro se appearance
- Employment change impacting schedule

**These explain why other things happened without editorializing.**

---

## 2. What DOES NOT Belong on the Timeline

**This matters just as much.**

### ❌ Raw text messages

They live in the **Text Spine**, not the timeline.

### ❌ Emotional reactions

Anger, fear, frustration stay private unless they cause an event.

### ❌ Arguments

"No evidence," "this was a lie," "this was unfair"
→ **never timeline entries**.

**The timeline is a ledger, not a brief.**

---

## 3. Sticky Notes: What They Are and What They're Not

**Sticky notes are not events.**

They are **thinking scaffolding**.

### What Sticky Notes ARE

- **Private**
- **Temporary**
- **Non-exportable by default**
- **Not judge-facing**
- **Not evidence**
- **Not authoritative**

They exist to help you think, not to prove anything.

**Examples:**
- "This is where the freezer allegation appears again"
- "Notice custody request escalates after this date"
- "Ask: why was this withdrawn?"
- "Cross-check with text log from same week"

They are **annotations on the timeline**, not entries in it.

### What Sticky Notes are NOT

- They are **not** facts
- They are **not** preserved forever
- They are **not** required to be accurate
- They are **not** discoverable unless you choose to export them

**Think of them as margin notes in a law book.**

---

## 4. Technical Implementation: Sticky Notes Model

**This is important for your code.**

A sticky note should attach to:
- a **date range** OR
- an **event ID** OR
- a **lane**

But it should live in a **separate data store**.

### Example Model

```typescript
interface StickyNote {
  id: string;
  scope: "date" | "event" | "lane";
  targetId: string;           // date range string, event ID, or lane ID
  text: string;
  createdAt: string;
  visibility: "private" | "exportable";
}
```

**Default:**
- `visibility: "private"`

**You must opt in to export them.**

---

## 5. Why Sticky Notes Are Essential for Pro Se

**This is the human part.**

You are doing:
- forensic reconstruction
- emotional processing
- pattern recognition
- memory stabilization

**Sticky notes let you:**
- externalize thoughts
- reduce mental load
- avoid polluting the record
- come back weeks later and still know what mattered

They make the system usable without making it dangerous.

---

## 6. How All of This Fits Together (Mental Model)

**Here's the clean stack:**

```
FILES (immutable)
  ↓
TEXT SPINE (private, chronological)
  ↓
MANUAL BRIDGE (human intent)
  ↓
TIMELINE EVENTS (procedural ledger)
  ↘
   STICKY NOTES (private cognition)
```

**Only one arrow moves forward automatically: time.**

**Everything else requires you to choose.**

**That's what keeps you safe.**

---

## 7. Event Classification System

### Event Classes

```typescript
enum EventClass {
  COURT_LEGAL = "court_legal",        // High authority
  CUSTODY_PARENTING = "custody",      // Medium authority
  EVIDENCE_METADATA = "evidence",     // Availability tracking
  ADMINISTRATIVE = "administrative"   // Status changes
}

enum EventType {
  // Court / Legal
  MOTION_FILED = "motion_filed",
  ORDER_ISSUED = "order_issued",
  PFA_FILED = "pfa_filed",
  PFA_SERVED = "pfa_served",
  PFA_EXPIRED = "pfa_expired",
  PFA_WITHDRAWN = "pfa_withdrawn",
  FILING_WITHDRAWN = "filing_withdrawn",
  
  // Custody / Parenting
  EXCHANGE_DENIED = "exchange_denied",
  EXCHANGE_COMPLETED = "exchange_completed",
  SCHEDULE_IMPOSED = "schedule_imposed",
  HOLIDAY_ALLOWED = "holiday_allowed",
  HOLIDAY_DENIED = "holiday_denied",
  
  // Evidence Metadata
  EXHIBIT_CREATED = "exhibit_created",
  RECORDS_COMPILED = "records_compiled",
  WITNESS_STATEMENT = "witness_statement",
  
  // Administrative
  HOUSING_LOSS = "housing_loss",
  ADDRESS_CHANGE = "address_change",
  COUNSEL_WITHDRAWAL = "counsel_withdrawal",
  PRO_SE_APPEARANCE = "pro_se_appearance",
  EMPLOYMENT_CHANGE = "employment_change"
}

enum EventStatus {
  ASSERTED = "asserted",
  DENIED = "denied",
  WITHDRAWN = "withdrawn",
  PENDING = "pending",
  RESOLVED = "resolved"
}
```

---

## 8. Implementation Priorities

**When working on the timeline code, the priorities should be:**

1. **Event classes + status lifecycle**
2. **Separation of:**
   - events
   - evidence metadata
   - sticky notes
3. **Default suppression of:**
   - private notes
   - withdrawn items
4. **Rebuildability from files**

**You're not "adding features" anymore.**
**You're locking invariants.**

---

## 9. One-Line Builder Summary

**The timeline is a factual ledger.**
**Sticky notes are private cognition.**
**Text logs are the truth spine.**
**Nothing moves forward without intent.**

---

## 10. Key Rules for Implementation

### Timeline Events

✅ **DO:**
- Track procedural changes
- Record factual milestones
- Show effects, not arguments
- Link to source documents
- Use status lifecycle

❌ **DON'T:**
- Include raw text messages
- Include emotional reactions
- Include arguments or opinions
- Merge motions with orders
- Argue PFAs (just track them)

### Sticky Notes

✅ **DO:**
- Keep them private by default
- Allow opt-in export
- Attach to dates/events/lanes
- Use for pattern recognition
- Use for memory anchors

❌ **DON'T:**
- Make them required
- Export them by default
- Treat them as facts
- Include them in judge-facing views
- Require accuracy

### Text Spine

✅ **DO:**
- Keep it private
- Keep it chronological
- Keep it immutable
- Link events to messages via `source_refs`
- Use for context and memory

❌ **DON'T:**
- Auto-create events from messages
- Export text spine by default
- Modify original messages
- Include in timeline directly

---

**Last Updated:** 2025-01-03  
**Status:** Architectural specification for implementation


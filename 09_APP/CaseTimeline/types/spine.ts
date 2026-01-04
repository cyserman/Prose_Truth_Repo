/**
 * Spine Data Model Types
 * 
 * Defines the core data structures for the Text Spine System.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * The spine is the immutable truth substrate. Timeline events reference spine items,
 * they do not duplicate them. Sticky notes are private cognition scaffolding.
 * 
 * See: docs/TIMELINE_ARCHITECTURE.md for full specification.
 */

/**
 * Event Status Lifecycle
 * 
 * Tracks the procedural status of timeline events for judge-facing views.
 */
export enum EventStatus {
  ASSERTED = "asserted",
  DENIED = "denied",
  WITHDRAWN = "withdrawn",
  PENDING = "pending",
  RESOLVED = "resolved",
  FACT = "fact"  // Established fact (not disputed)
}

/**
 * Message Categories
 * 
 * Automatic categorization of spine items for pattern recognition.
 */
export enum MessageCategory {
  ACCESS_DENIED = "Access_Denied",
  FINANCIAL_STRAIN = "Financial_Strain",
  HOT_READ_REACTIVE = "Hot_Read_Reactive",
  SCHEDULE_CHANGE = "Schedule_Change",
  EMERGENCY = "Emergency",
  LEGAL_THREAT = "Legal_Threat",
  DOCUMENT_REQUEST = "Document_Request",
  COMMUNICATION = "Communication",
  OTHER = "Other"
}

/**
 * Source File
 * 
 * Represents an imported CSV/PDF/XLS file with hash fingerprinting.
 */
export interface SourceFile {
  id: string;                   // Unique ID (e.g., "SRC-2024-A")
  filename: string;              // Original filename
  file_hash: string;             // SHA-256 hash of file content
  imported_at: string;           // ISO 8601 timestamp
  message_count: number;        // Number of messages extracted
  date_range_start?: string;    // Earliest message timestamp
  date_range_end?: string;      // Latest message timestamp
}

/**
 * Spine Item
 * 
 * Represents a single message/communication in the text spine.
 * 
 * CRITICAL INVARIANTS:
 * - content_original is NEVER modified (immutable truth)
 * - content_neutral is ONLY set by human (never auto-generated)
 * - timestamp is the source of chronological ordering
 */
export interface SpineItem {
  id: string;                   // Unique ID (e.g., "SPINE-2024-A-000143")
  source_id: string;            // Reference to SourceFile.id
  timestamp: string;             // ISO 8601 timestamp
  sender: string;                // Sender name/number
  recipient: string;            // Recipient name/number
  counterpart: string;           // Other party (normalized)
  platform: string;              // "SMS", "AppClose", "iOS", etc.
  category: MessageCategory;    // Auto-categorized
  content_original: string;      // NEVER MODIFIED - Original message text
  content_neutral?: string;      // Human-written neutral summary (optional)
  direction: "inbound" | "outbound";
  is_call?: boolean;             // True if this is a call log entry
  call_duration?: number;        // Call duration in seconds (if call)
  created_at: string;            // ISO 8601 timestamp when imported
}

/**
 * Timeline Event
 * 
 * Represents a procedural or factual milestone on the timeline.
 * 
 * Key Rules:
 * - title and description are summaries, NOT raw text
 * - spine_refs links to SpineItem IDs (if applicable)
 * - status tracks procedural lifecycle
 */
export interface TimelineEvent {
  id: string;                   // Unique ID (e.g., "EVT-2024-119")
  date: string;                 // YYYY-MM-DD format
  lane: string;                  // Lane ID (e.g., "custody", "court")
  title: string;                 // Short title (summary)
  description: string;           // Description (summary, not raw text)
  status: EventStatus;          // asserted, denied, withdrawn, etc.
  spine_refs: string[];          // Array of SpineItem IDs
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
  
  // Optional fields for court/legal events
  date_filed?: string;          // Date motion/filing was filed
  forum?: string;                // Court/jurisdiction
  party?: string;                // Filing party
  relief_requested?: string;     // Short description of relief sought
  document_reference?: string;   // Exhibit/document reference
}

/**
 * Sticky Note
 * 
 * Private cognition scaffolding, NOT an event.
 * 
 * Key Rules:
 * - Private by default (is_private: true)
 * - Non-exportable unless opt-in
 * - Not judge-facing
 * - Not evidence
 * - Thinking scaffolding, not facts
 */
export interface StickyNote {
  id: string;                   // Unique ID
  target_type: "spine" | "timeline" | "date" | "lane";
  target_id: string;            // SpineItem ID, TimelineEvent ID, date string, or lane ID
  text: string;                  // Private cognition scaffolding
  color?: string;                // "yellow", "pink", "blue", "green"
  is_private: boolean;           // Default: true
  created_at: string;            // ISO 8601 timestamp
  updated_at?: string;           // ISO 8601 timestamp (if edited)
}

/**
 * Import Result
 * 
 * Result of CSV import operation.
 */
export interface ImportResult {
  source_file: SourceFile;
  spine_items: SpineItem[];
  duplicates_skipped: number;
  errors: string[];
  success: boolean;
}


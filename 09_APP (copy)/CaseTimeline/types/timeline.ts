/**
 * Timeline Data Model Types
 * 
 * Defines the core data structures for the CaseTimeline application.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * The timeline is a procedural + factual ledger, not a diary and not an evidence dump.
 * 
 * See: docs/TIMELINE_ARCHITECTURE.md for full specification.
 */

export interface Lane {
  id: string;
  title: string;
  order: number;
}

export interface EventType {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  localUri: string;
  createdAt: string;
}

export interface VoiceNote {
  id: string;
  duration: number;
  localUri: string;
  createdAt: string;
}

/**
 * Event Classification System
 * 
 * Events belong to classes based on their authority level and purpose.
 */
export enum EventClass {
  COURT_LEGAL = "court_legal",        // High authority (motions, orders, PFAs)
  CUSTODY_PARENTING = "custody",      // Medium authority (exchanges, schedules)
  EVIDENCE_METADATA = "evidence",     // Availability tracking only
  ADMINISTRATIVE = "administrative"   // Status changes (housing, counsel, etc.)
}

/**
 * Event Status Lifecycle
 * 
 * Tracks the procedural status of events for judge-facing views.
 */
export enum EventStatus {
  ASSERTED = "asserted",
  DENIED = "denied",
  WITHDRAWN = "withdrawn",
  PENDING = "pending",
  RESOLVED = "resolved"
}

/**
 * Timeline Event
 * 
 * Represents a procedural or factual milestone on the timeline.
 * 
 * Key Rules:
 * - note field contains summary, NOT raw text
 * - source_refs links to TextLog messages (if applicable)
 * - status tracks procedural lifecycle
 * - class determines authority level
 * 
 * What BELONGS:
 * - Court/legal events (motions, orders, PFAs)
 * - Custody/parenting events (exchanges, schedules)
 * - Evidence metadata (exhibit created, records compiled)
 * - Administrative events (housing, counsel changes)
 * 
 * What DOES NOT belong:
 * - Raw text messages (live in Text Spine)
 * - Emotional reactions (private)
 * - Arguments or opinions (not factual ledger entries)
 */
export interface Event {
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
  
  // Event classification and status
  class: EventClass;            // Court/Legal, Custody, Evidence, Administrative
  status: EventStatus;         // asserted, denied, withdrawn, pending, resolved
  
  // Source references (links to TextLog messages)
  source_refs?: string[];      // ["TXT-2024-A-000143", "TXT-2024-A-000144"]
  
  // Court/Legal specific fields (optional, for motions/filings/orders)
  date_filed?: string;         // Date motion/filing was filed
  forum?: string;               // Court/jurisdiction
  party?: string;               // Filing party
  relief_requested?: string;   // Short description of relief sought
  document_reference?: string; // Exhibit/document reference
}

/**
 * Sticky Note
 * 
 * Private cognition scaffolding, NOT an event.
 * 
 * Key Rules:
 * - Private by default (visibility: "private")
 * - Non-exportable unless opt-in
 * - Not judge-facing
 * - Not evidence
 * - Thinking scaffolding, not facts
 * - Separate data store from events
 * 
 * Use cases:
 * - Pattern recognition notes
 * - Memory anchors
 * - Cross-references
 * - Questions to investigate
 */
export interface StickyNote {
  id: string;
  scope: "date" | "event" | "lane";
  targetId: string;             // date range string, event ID, or lane ID
  text: string;                 // Private cognition scaffolding
  createdAt: string;
  visibility: "private" | "exportable";  // Default: "private"
}

export interface TimelineState {
  lanes: Lane[];
  eventTypes: EventType[];
  events: Record<string, Event>;
  stickyNotes?: Record<string, StickyNote>;  // Separate store for sticky notes
  selectedYear: number;
  zoomLevel: 2 | 3 | 6 | 12;
}

export type TimelineAction =
  | { type: "SET_ZOOM_LEVEL"; payload: 2 | 3 | 6 | 12 }
  | { type: "SET_SELECTED_YEAR"; payload: number }
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "UPDATE_EVENT"; payload: Event }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "ADD_LANE"; payload: Lane }
  | { type: "UPDATE_LANE"; payload: Lane }
  | { type: "DELETE_LANE"; payload: string }
  | { type: "IMPORT_DATA"; payload: TimelineState }
  | { type: "RESET_DATA" };

/**
 * Default Event Types
 * 
 * Organized by EventClass for clarity.
 * 
 * Note: These are examples. Customize based on your case needs.
 */
export const DEFAULT_EVENT_TYPES: EventType[] = [
  // Court / Legal (High Authority)
  { id: "motion_filed", label: "Motion Filed", icon: "📎", color: "#3B82F6" },
  { id: "order_issued", label: "Order Issued", icon: "⚖️", color: "#8B5CF6" },
  { id: "pfa_filed", label: "PFA Filed", icon: "🛡️", color: "#EF4444" },
  { id: "pfa_served", label: "PFA Served", icon: "📬", color: "#F59E0B" },
  { id: "pfa_expired", label: "PFA Expired", icon: "⏰", color: "#6B7280" },
  { id: "filing_withdrawn", label: "Filing Withdrawn", icon: "↩️", color: "#9CA3AF" },
  
  // Custody / Parenting (Medium Authority)
  { id: "exchange_denied", label: "Exchange Denied", icon: "🚫", color: "#EC4899" },
  { id: "exchange_completed", label: "Exchange Completed", icon: "✅", color: "#10B981" },
  { id: "schedule_imposed", label: "Schedule Imposed", icon: "📅", color: "#3B82F6" },
  { id: "holiday_allowed", label: "Holiday Allowed", icon: "🎄", color: "#10B981" },
  { id: "holiday_denied", label: "Holiday Denied", icon: "🚫", color: "#EF4444" },
  
  // Evidence Metadata (Availability Tracking)
  { id: "exhibit_created", label: "Exhibit Created", icon: "🧾", color: "#F59E0B" },
  { id: "records_compiled", label: "Records Compiled", icon: "📋", color: "#6366F1" },
  { id: "witness_statement", label: "Witness Statement", icon: "👤", color: "#8B5CF6" },
  
  // Administrative (Status Changes)
  { id: "housing_loss", label: "Housing Loss", icon: "🏠", color: "#EF4444" },
  { id: "address_change", label: "Address Change", icon: "📍", color: "#6366F1" },
  { id: "counsel_withdrawal", label: "Counsel Withdrawal", icon: "👔", color: "#F59E0B" },
  { id: "pro_se_appearance", label: "Pro Se Appearance", icon: "⚖️", color: "#3B82F6" },
  { id: "employment_change", label: "Employment Change", icon: "💼", color: "#6366F1" },
];

export const DEFAULT_LANES: Lane[] = [
  { id: "lead", title: "Lead Counsel", order: 0 },
  { id: "para", title: "Paralegal", order: 1 },
  { id: "judge", title: "Judge", order: 2 },
];

/**
 * Generate a unique event key from year, laneId, and monthIndex
 */
export function getEventKey(year: number, laneId: string, monthIndex: number): string {
  return `${year}_${laneId}_${monthIndex}`;
}

/**
 * Generate a unique ID for new entities
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

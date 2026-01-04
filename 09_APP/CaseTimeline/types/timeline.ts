/**
 * Timeline Data Model Types
 * 
 * Defines the core data structures for the CaseTimeline application.
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

export interface Event {
  id: string;
  year: number;
  laneId: string;
  monthIndex: number;
  typeId: string;
  note: string;
  attachments: Attachment[];
  voiceNote?: VoiceNote;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineState {
  lanes: Lane[];
  eventTypes: EventType[];
  events: Record<string, Event>;
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

export const DEFAULT_EVENT_TYPES: EventType[] = [
  { id: "filing", label: "Filing", icon: "📎", color: "#3B82F6" },
  { id: "court", label: "Court Hearing", icon: "⚖️", color: "#8B5CF6" },
  { id: "child_support", label: "Child Support", icon: "👶", color: "#EC4899" },
  { id: "exhibit", label: "Exhibit", icon: "🧾", color: "#F59E0B" },
  { id: "deadline", label: "Deadline", icon: "⏰", color: "#EF4444" },
  { id: "meeting", label: "Meeting", icon: "🤝", color: "#10B981" },
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

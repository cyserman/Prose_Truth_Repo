# CaseTimeline Mobile App - Design Document

## Overview

CaseTimeline is a mobile-first legal timeline management application designed for legal professionals to track case events, manage documentation, and maintain organized timelines across multiple roles and time periods. The app follows iOS Human Interface Guidelines to deliver a native, intuitive experience.

## Core Concept

The application presents a **swimlane timeline board** where users can visualize and manage legal case events across different roles (lanes) and time periods. Each cell in the grid represents a potential event location that can be populated with notes, attachments, and voice recordings.

## Screen List

### 1. Timeline Board (Home Screen)
**Purpose**: Main workspace for viewing and managing the case timeline

**Primary Content**:
- Horizontal scrollable timeline grid with months as columns
- Vertical lanes representing different roles (Lead Counsel, Paralegal, Judge, etc.)
- Sticky header showing month names
- Sticky left column showing lane titles
- Event cells displaying icons for notes, attachments, and voice recordings
- Top toolbar with controls and actions

**Key Functionality**:
- Zoom control to adjust visible time range (2, 3, 6, or 12 months)
- Year selector to navigate between years
- Tap cell to add/edit events
- Visual indicators for populated cells
- Export/Import data
- Reset board option

### 2. Event Editor (Modal/Sheet)
**Purpose**: Compact contextual editor for creating and modifying events

**Primary Content**:
- Event type dropdown (Filing, Court Hearing, Child Support, Exhibit, etc.)
- Rich text area for notes
- Attachment list with file names and icons
- Voice note indicator if present
- Action buttons (Save, Cancel, Delete)

**Key Functionality**:
- Select event type with color-coded categories
- Add/edit detailed notes
- Attach documents via file picker
- Record voice notes
- Delete existing events
- Cancel without saving

### 3. Settings/Info Screen (Optional Tab)
**Purpose**: App configuration and information

**Primary Content**:
- App version and information
- Data management options
- Theme preferences
- About section

**Key Functionality**:
- Clear all data
- View storage usage
- Toggle dark/light mode

## Data Model

### Lanes
```typescript
interface Lane {
  id: string;          // Unique identifier
  title: string;       // Display name (e.g., "Lead Counsel")
  order: number;       // Sort order
}
```

### Event Types
```typescript
interface EventType {
  id: string;          // Unique identifier
  label: string;       // Display name
  icon: string;        // Emoji or icon identifier
  color: string;       // Hex color for visual distinction
}
```

### Events
```typescript
interface Event {
  id: string;          // Unique identifier
  year: number;        // Year of event
  laneId: string;      // Associated lane
  monthIndex: number;  // Month (0-11)
  typeId: string;      // Event type reference
  note: string;        // Detailed notes
  attachments: Attachment[];
  voiceNote?: VoiceNote;
  createdAt: Date;
  updatedAt: Date;
}
```

### Attachments
```typescript
interface Attachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  localUri: string;    // Local file path
  createdAt: Date;
}
```

### Voice Notes
```typescript
interface VoiceNote {
  id: string;
  duration: number;    // Seconds
  localUri: string;    // Local audio file path
  createdAt: Date;
}
```

## Key User Flows

### Flow 1: Add New Event
1. User taps empty cell in timeline grid
2. Event editor modal slides up from bottom
3. User selects event type from dropdown
4. User enters notes in text area
5. User optionally adds attachments via file picker
6. User optionally records voice note
7. User taps "Save" button
8. Modal dismisses with haptic feedback
9. Cell displays event indicators (note icon, attachment icon, voice icon)

### Flow 2: Edit Existing Event
1. User taps cell with existing event
2. Event editor opens with populated data
3. User modifies event type, notes, or attachments
4. User taps "Save" to update or "Delete" to remove
5. Modal dismisses with confirmation
6. Grid updates to reflect changes

### Flow 3: Navigate Timeline
1. User views current month range (default: 3 months)
2. User swipes horizontally to scroll through months
3. User taps zoom control to change visible range (2/3/6/12 months)
4. Grid animates to new zoom level
5. User taps year selector dropdown
6. User selects different year
7. Grid updates to show selected year

### Flow 4: Export Timeline Data
1. User taps "Export" button in toolbar
2. System generates JSON file with all timeline data
3. Native share sheet appears
4. User selects destination (Files, Drive, Email, etc.)
5. File is saved/shared
6. Success toast appears

### Flow 5: Import Timeline Data
1. User taps "Import" button in toolbar
2. File picker opens
3. User selects JSON file
4. System validates file format
5. Confirmation dialog appears showing data preview
6. User confirms import
7. Timeline data loads with animation
8. Success toast appears

## Color Choices

### Primary Palette
- **Primary Blue**: `#0a7ea4` - Main accent color for interactive elements, zoom controls, primary buttons
- **Background Light**: `#ffffff` - Main background in light mode
- **Background Dark**: `#151718` - Main background in dark mode
- **Surface Light**: `#f5f5f5` - Card and elevated surfaces in light mode
- **Surface Dark**: `#1e2022` - Card and elevated surfaces in dark mode

### Event Type Colors
- **Filing**: `#3B82F6` (Blue) - Document submissions, legal filings
- **Court Hearing**: `#8B5CF6` (Purple) - Court appearances, hearings
- **Child Support**: `#EC4899` (Pink) - Child support related events
- **Exhibit**: `#F59E0B` (Amber) - Evidence, exhibits
- **Deadline**: `#EF4444` (Red) - Important deadlines
- **Meeting**: `#10B981` (Green) - Client meetings, consultations

### Status Colors
- **Success**: `#22C55E` (Green) - Completed actions, success states
- **Warning**: `#F59E0B` (Amber) - Warnings, pending items
- **Error**: `#EF4444` (Red) - Errors, critical issues

### UI Elements
- **Border Light**: `#E5E7EB` - Dividers and borders in light mode
- **Border Dark**: `#334155` - Dividers and borders in dark mode
- **Muted Text Light**: `#687076` - Secondary text in light mode
- **Muted Text Dark**: `#9BA1A6` - Secondary text in dark mode

## Design Principles

### Mobile-First
- All interactions optimized for one-handed portrait use
- Touch targets minimum 44x44pt (iOS HIG standard)
- Generous spacing between interactive elements
- Bottom-sheet modals for primary actions

### Visual Hierarchy
- Sticky headers and lane titles for context
- Clear visual distinction between empty and populated cells
- Icon-based indicators for quick scanning
- Color-coded event types for rapid identification

### Interaction Patterns
- Tap to open/edit (primary action)
- Swipe to scroll timeline (natural gesture)
- Pull-to-refresh for data sync (if cloud enabled)
- Long-press for contextual actions (future enhancement)

### Feedback
- Haptic feedback on button taps and successful actions
- Subtle scale animations on press (0.97 scale)
- Toast notifications for confirmations
- Loading states for async operations

### Performance
- Virtualized list rendering for large timelines
- Lazy loading of attachments
- Optimistic UI updates
- Local-first data persistence with AsyncStorage

## Technical Architecture

### State Management
- React Context + useReducer for global timeline state
- Local component state for UI interactions
- AsyncStorage for data persistence
- Optional cloud sync via backend API (if enabled)

### Component Structure
```
app/
  (tabs)/
    index.tsx              → Timeline Board Screen
    settings.tsx           → Settings Screen (optional)
  
components/
  timeline/
    TimelineGrid.tsx       → Main grid container
    TimelineHeader.tsx     → Sticky month header
    TimelineLane.tsx       → Lane row with cells
    TimelineCell.tsx       → Individual event cell
    ZoomControl.tsx        → Zoom level selector
    YearSelector.tsx       → Year dropdown
  
  event/
    EventEditor.tsx        → Modal editor
    EventTypeSelector.tsx  → Type dropdown
    AttachmentList.tsx     → File attachments
    VoiceNoteRecorder.tsx  → Voice recording
  
  toolbar/
    Toolbar.tsx            → Top action bar
    ExportButton.tsx       → Export functionality
    ImportButton.tsx       → Import functionality
```

### Data Flow
1. App loads → Read from AsyncStorage
2. User interacts → Update local state
3. State changes → Write to AsyncStorage
4. Optional: Periodic sync to cloud backend

## Accessibility

- VoiceOver support for all interactive elements
- Semantic labels for screen readers
- Sufficient color contrast ratios (WCAG AA)
- Dynamic type support for text scaling
- Reduced motion support for animations

## Future Enhancements

- Drag-and-drop to reorder lanes
- Multi-select for bulk operations
- Search and filter events
- Calendar view mode
- Collaboration features with cloud sync
- PDF export with formatted timeline
- Recurring events support
- Reminder notifications for deadlines

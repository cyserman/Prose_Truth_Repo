# CaseTimeline - Legal Timeline Management Mobile App

A production-ready React Native mobile application for legal professionals to track case events, manage documentation, and maintain organized timelines across multiple roles and time periods.

## Features

### Core Functionality
- **Timeline Grid**: Horizontal scrollable swimlane board with months as columns and roles as rows
- **Event Management**: Add, edit, and delete events with detailed notes and metadata
- **Event Types**: Categorized event types (Filing, Court Hearing, Child Support, Exhibit, Deadline, Meeting) with color coding
- **Attachments**: Add and manage document attachments for each event
- **Voice Notes**: Record and attach voice notes to events (placeholder implementation)
- **Zoom Control**: Adjust visible time range (2, 3, 6, or 12 months)
- **Year Navigation**: Switch between years to view historical and future timelines
- **Data Persistence**: Automatic local storage using AsyncStorage
- **Import/Export**: Export timeline data as JSON and import from backup files

### User Experience
- **Mobile-First Design**: Optimized for portrait orientation and one-handed use
- **Haptic Feedback**: Tactile responses for key interactions
- **Press Animations**: Subtle scale animations (0.97) for button presses
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Confirmation Dialogs**: Safeguards for destructive actions

## Tech Stack

- **Framework**: React Native 0.81 with Expo SDK 54
- **Language**: TypeScript 5.9
- **Routing**: Expo Router 6
- **Styling**: NativeWind 4 (Tailwind CSS for React Native)
- **State Management**: React Context + useReducer
- **Data Persistence**: AsyncStorage
- **File Operations**: expo-file-system, expo-document-picker, expo-sharing
- **Audio**: expo-audio (placeholder implementation)

## Project Structure

```
app/
  (tabs)/
    index.tsx              → Home screen with timeline grid
  _layout.tsx              → Root layout with providers

components/
  timeline/
    TimelineGrid.tsx       → Main grid container
    TimelineCell.tsx       → Individual event cell
  event/
    EventEditor.tsx        → Modal editor for events
    VoiceRecorder.tsx      → Voice note recorder
  toolbar/
    Toolbar.tsx            → Top action bar with controls
  screen-container.tsx     → SafeArea wrapper
  
types/
  timeline.ts              → TypeScript interfaces and types

lib/
  timeline-context.tsx     → State management context
  export-import.ts         → Import/export utilities
  theme-provider.tsx       → Theme context
  
constants/
  theme.ts                 → Color palette and theme tokens
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open the app:
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

### Scripts

- `pnpm dev` - Start development server
- `pnpm android` - Open on Android emulator
- `pnpm ios` - Open on iOS simulator
- `pnpm test` - Run unit tests
- `pnpm lint` - Run ESLint
- `pnpm check` - TypeScript type checking

## Usage Guide

### Creating Events

1. Tap any cell in the timeline grid
2. Select an event type from the dropdown
3. Add detailed notes in the text area
4. Optionally attach documents or record voice notes
5. Tap "Save Event" to confirm

### Managing Timeline

- **Zoom**: Use the zoom controls to adjust the visible month range (2, 3, 6, or 12 months)
- **Year**: Select a year from the dropdown to view different time periods
- **Scroll**: Swipe horizontally to navigate through months

### Import/Export

- **Export**: Tap "Export" in the toolbar to save timeline data as JSON
- **Import**: Tap "Import" and select a previously exported JSON file
- **Reset**: Clear all data with the reset option (requires confirmation)

## Data Model

### Event Structure
```typescript
interface Event {
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
```

### Lane Structure
```typescript
interface Lane {
  id: string;
  title: string;
  order: number;
}
```

### Event Type Structure
```typescript
interface EventType {
  id: string;
  label: string;
  icon: string;
  color: string;
}
```

## Customization

### Adding Event Types

Edit `types/timeline.ts` and add new entries to `DEFAULT_EVENT_TYPES`:

```typescript
export const DEFAULT_EVENT_TYPES: EventType[] = [
  // ... existing types
  { id: "custom", label: "Custom Event", icon: "🔔", color: "#6366F1" },
];
```

### Adding Lanes

Edit `types/timeline.ts` and add new entries to `DEFAULT_LANES`:

```typescript
export const DEFAULT_LANES: Lane[] = [
  // ... existing lanes
  { id: "expert", title: "Expert Witness", order: 3 },
];
```

### Theme Customization

Edit `theme.config.js` to customize colors:

```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  // ... other colors
};
```

## Known Limitations

1. **Voice Recording**: Currently uses a placeholder implementation. Full audio recording requires additional expo-audio configuration.
2. **Attachment Preview**: Files are stored but preview functionality is not implemented.
3. **Cloud Sync**: Local-only storage. Cloud sync requires backend integration.
4. **Collaboration**: Single-user app. Multi-user features require authentication and real-time sync.

## Future Enhancements

- [ ] Full audio recording and playback
- [ ] Attachment preview and management
- [ ] Cloud sync with backend API
- [ ] User authentication
- [ ] Drag-and-drop lane reordering
- [ ] Search and filter events
- [ ] Calendar view mode
- [ ] PDF export with formatted timeline
- [ ] Push notifications for deadlines
- [ ] Collaboration features

## Architecture Decisions

### State Management
- **Choice**: React Context + useReducer
- **Rationale**: Simpler than Redux, sufficient for app complexity, avoids common Zustand pitfalls

### Styling
- **Choice**: NativeWind (Tailwind CSS)
- **Rationale**: Familiar syntax, consistent with web development, good performance

### Data Persistence
- **Choice**: AsyncStorage
- **Rationale**: Built-in, reliable, sufficient for local-first approach

### File Structure
- **Choice**: Feature-based organization
- **Rationale**: Easier to navigate, scales well with app growth

## Contributing

This is a production-ready template. To contribute:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure TypeScript types are correct
5. Test on both iOS and Android

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for legal professionals**

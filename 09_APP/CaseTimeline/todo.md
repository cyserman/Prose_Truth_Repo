# CaseTimeline Mobile App - TODO

## Core Features

### Data Model & State Management
- [x] Define TypeScript interfaces for Lane, EventType, Event, Attachment, VoiceNote
- [x] Create timeline state context with useReducer
- [x] Implement AsyncStorage persistence layer
- [ ] Add data validation and error handling

### Timeline Grid
- [x] Build TimelineGrid component with horizontal scroll
- [x] Implement sticky month header
- [x] Create sticky lane column
- [x] Build TimelineCell component with event indicators
- [x] Add zoom control (2, 3, 6, 12 months)
- [x] Implement year selector dropdown
- [x] Add empty state placeholder text
- [x] Implement cell tap handler to open editor

### Event Editor
- [x] Create EventEditor modal component
- [x] Build event type selector dropdown with colors
- [x] Add rich text area for notes
- [x] Implement attachment picker integration
- [x] Add voice note recorder with expo-audio
- [x] Create Save/Cancel/Delete action buttons
- [ ] Add form validation
- [x] Implement haptic feedback on actions

### Attachments
- [x] Integrate expo-document-picker for file selection
- [x] Display attachment list with file names and icons
- [x] Store files locally with unique IDs
- [ ] Add file size and type validation
- [ ] Implement attachment deletion

### Voice Notes
- [x] Implement audio recording with expo-audio
- [x] Add recording UI with timer
- [x] Store audio files locally
- [ ] Add playback controls
- [x] Display voice note duration

### Toolbar
- [x] Create Toolbar component with actions
- [x] Implement Export to JSON functionality
- [x] Implement Import from JSON with validation
- [x] Add Reset/Clear data option with confirmation
- [ ] Add sync status indicator (for future cloud sync)

### UI/UX Polish
- [x] Add press feedback animations (scale 0.97)
- [x] Implement haptic feedback on key interactions
- [ ] Add loading states for async operations
- [ ] Create toast notification system
- [x] Add confirmation dialogs for destructive actions
- [x] Implement dark mode support
- [ ] Add empty state illustrations

### Testing
- [ ] Write unit tests for data model functions
- [ ] Test AsyncStorage persistence
- [ ] Test import/export functionality
- [ ] Test event CRUD operations
- [ ] Test edge cases (empty data, invalid imports)

### Performance
- [ ] Optimize grid rendering for large datasets
- [ ] Implement lazy loading for attachments
- [ ] Add memoization for expensive computations
- [ ] Test performance with 100+ events

### Documentation
- [ ] Update README with setup instructions
- [ ] Document data model and API
- [ ] Add code comments for complex logic
- [ ] Create user guide for key features

### Branding
- [x] Generate custom app logo
- [x] Update app.config.ts with app name
- [x] Set app icon files
- [x] Configure splash screen

## Optional Enhancements (Future)
- [ ] Cloud sync with backend API
- [ ] User authentication
- [ ] Drag-and-drop lane reordering
- [ ] Search and filter events
- [ ] Calendar view mode
- [ ] PDF export
- [ ] Push notifications for deadlines
- [ ] Collaboration features


## Voice Recording Enhancement (Current Sprint)
- [x] Research expo-audio recording API and configuration
- [x] Implement proper audio recording with useAudioRecorder hook
- [x] Add recording state management (recording, paused, stopped)
- [x] Implement audio playback with useAudioPlayer hook
- [x] Add playback controls (play, pause, stop, speed)
- [x] Display audio progress indicator
- [x] Add recording quality settings
- [x] Implement proper error handling for permissions
- [ ] Test recording on iOS and Android
- [ ] Test playback functionality


## Voice Recording Enhancement (Current Sprint)
- [x] Research expo-audio recording API and configuration
- [x] Implement proper audio recording with useAudioRecorder hook
- [x] Add recording state management (recording, paused, stopped)
- [x] Implement audio playback with useAudioPlayer hook
- [x] Add playback controls (play, pause, stop, speed)
- [x] Display audio progress indicator
- [x] Add recording quality settings
- [x] Implement proper error handling for permissions
- [ ] Test recording on iOS and Android
- [ ] Test playback functionality

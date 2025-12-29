# UI Enhancements Plan - ProSe Legal DB

## ✅ Features to Add

### 1. Textured Backgrounds
- [x] CSS classes for textured blue, light, dark themes
- [ ] Apply theme classes to main container
- [ ] Theme toggle in sidebar

### 2. File Classification UI
- [ ] Add classification dropdown to FileOrganizerCard
- [ ] Categories: Incident, Communication, Evidence, Court Filing, Note, Other
- [ ] Logic checks (Incident ↔ Evidence linking)
- [ ] Store classifications in file metadata

### 3. Export Features
- [ ] Export to Markdown
- [ ] Export to PDF (using browser print or jsPDF)
- [ ] Export timeline as formatted document

### 4. Voice Transcription
- [ ] Integrate Web Speech API for real-time transcription
- [ ] Or use OpenAI Whisper API for uploaded audio
- [ ] Auto-populate notes from transcription

### 5. Theme Toggle
- [ ] Light / Dark / Textured Blue themes
- [ ] Persist theme preference
- [ ] Apply to all views

## Implementation Notes

- Keep existing functionality intact
- Add new features as enhancements
- Use existing state management patterns
- Maintain responsive design


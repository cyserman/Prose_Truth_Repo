# Prose Truth Repo Integration Instructions

## Package Contents

This archive contains three new components for your Prose_Truth_Repo:

1. **CaseTimeline Mobile App** - React Native/Expo timeline management app
2. **Chromebook Toolbox v2** - Development toolbox with terminal, notepad, recorder, and file upload
3. **CSV Timeline Data** - Normalized timeline CSV and import guide

## Installation Steps

### 1. Extract the Archive

```bash
# Navigate to your local Prose_Truth_Repo directory
cd /path/to/your/Prose_Truth_Repo

# Extract the archive (this will add new files without overwriting existing ones)
unzip /path/to/prose-truth-integration.zip
```

### 2. Verify File Structure

After extraction, you should have:

```
Prose_Truth_Repo/
├── 02_TIMELINES/
│   ├── NORMALIZED_TIMELINE.csv          # ← NEW: Master timeline data
│   └── CSV_IMPORT_GUIDE.md              # ← NEW: Import documentation
├── 09_APP/
│   ├── CaseTimeline/                    # ← NEW: Mobile app directory
│   │   ├── app/                         # Expo Router screens
│   │   ├── components/                  # UI components
│   │   ├── lib/                         # Utilities and state management
│   │   ├── types/                       # TypeScript definitions
│   │   ├── package.json
│   │   ├── README.md
│   │   └── INTEGRATION_README.md        # Detailed integration guide
│   └── chromebook-toolbox/              # ← NEW: Toolbox directory
│       ├── public/                      # Frontend assets
│       ├── notes/                       # Saved notes directory
│       ├── uploads/                     # File uploads directory
│       ├── package.json
│       ├── server.js
│       └── README.md
```

### 3. Install CaseTimeline Mobile App

```bash
cd 09_APP/CaseTimeline

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will start and display a QR code. Scan with Expo Go app on your phone.

**Read the full guide**: `09_APP/CaseTimeline/INTEGRATION_README.md`

### 4. Install Chromebook Toolbox

```bash
cd 09_APP/chromebook-toolbox

# Install dependencies
npm install

# Start server
npm start
```

Open browser to http://localhost:3000

**Read the full guide**: `09_APP/chromebook-toolbox/README.md`

### 5. Import Timeline Data (Optional)

If you want to load the CSV data into the mobile app:

1. Open CaseTimeline mobile app
2. Tap "Import" button in toolbar
3. Select `02_TIMELINES/NORMALIZED_TIMELINE.csv`
4. App will parse and display events in timeline grid

**Read the import guide**: `02_TIMELINES/CSV_IMPORT_GUIDE.md`

## Git Workflow

### Option A: Create a New Branch

```bash
# Create and switch to integration branch
git checkout -b feature/integrate-casetimeline-mobile

# Stage new files
git add 09_APP/CaseTimeline/
git add 09_APP/chromebook-toolbox/
git add 02_TIMELINES/NORMALIZED_TIMELINE.csv
git add 02_TIMELINES/CSV_IMPORT_GUIDE.md

# Commit
git commit -m "feat: integrate CaseTimeline mobile app, CSV timeline data, and Chromebook Toolbox v2

- Add CaseTimeline mobile app to 09_APP/CaseTimeline/
  * React Native/Expo app with swimlane timeline grid
  * Full audio recording and playback with expo-audio
  * Event editor with attachments and voice notes
  * CSV import/export for timeline synchronization
  * Offline-first with AsyncStorage persistence
  
- Add NORMALIZED_TIMELINE.csv to 02_TIMELINES/
  * Master timeline data for case events
  * CSV import guide for mobile app integration
  * Data mapping documentation
  
- Add Chromebook Toolbox v2 to 09_APP/chromebook-toolbox/
  * Tabbed development toolbox for Chromebook environments
  * Features: Terminal, Notepad, Audio Recorder, File Upload
  * WebSocket-based terminal with xterm.js
  * Lightweight Node.js/Express server
  
- Comprehensive documentation for all components
  * Integration guides and usage workflows
  * Architecture and data flow documentation
  * Troubleshooting and contribution guidelines"

# Push to GitHub
git push origin feature/integrate-casetimeline-mobile
```

### Option B: Commit Directly to Main

```bash
# Stage new files
git add 09_APP/CaseTimeline/
git add 09_APP/chromebook-toolbox/
git add 02_TIMELINES/NORMALIZED_TIMELINE.csv
git add 02_TIMELINES/CSV_IMPORT_GUIDE.md

# Commit with message
git commit -m "feat: add CaseTimeline mobile app, Chromebook Toolbox v2, and CSV timeline data"

# Push to main
git push origin main
```

## Quick Start Guide

### CaseTimeline Mobile App

```bash
cd 09_APP/CaseTimeline
pnpm install
pnpm dev
# Scan QR code with Expo Go app
```

**Key Features:**
- Swimlane timeline grid with zoom controls
- Event editor with attachments and voice notes
- CSV import/export for data synchronization
- Offline-first with local storage

### Chromebook Toolbox

```bash
cd 09_APP/chromebook-toolbox
npm install
npm start
# Open http://localhost:3000
```

**Key Features:**
- **Terminal**: Full bash terminal with WebSocket
- **Notepad**: Quick text editor with auto-save
- **Recorder**: Audio recording with WebM export
- **Upload**: Drag-and-drop file upload

## Troubleshooting

### CaseTimeline App Won't Start

**Issue**: `pnpm: command not found`

**Solution**:
```bash
npm install -g pnpm
```

**Issue**: Metro bundler errors

**Solution**:
```bash
cd 09_APP/CaseTimeline
rm -rf node_modules
pnpm install
pnpm dev
```

### Chromebook Toolbox Terminal Not Working

**Issue**: `node-pty` installation fails

**Solution**:
```bash
# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential python3

# Reinstall dependencies
cd 09_APP/chromebook-toolbox
rm -rf node_modules
npm install
```

### CSV Import Fails

**Issue**: CSV format mismatch

**Solution**:
- Verify CSV has required columns: `event_id`, `date`, `event_type`, `short_title`, `description`, `source`, `exhibit_refs`, `reliability`, `notes`
- Ensure dates are in `YYYY-MM-DD` format
- Check for special characters or line breaks in cells

## Documentation

Each component includes comprehensive documentation:

| Component | Documentation File | Description |
|-----------|-------------------|-------------|
| CaseTimeline Mobile | `09_APP/CaseTimeline/INTEGRATION_README.md` | Full integration guide with architecture, data flow, and usage |
| CaseTimeline Mobile | `09_APP/CaseTimeline/README.md` | Quick start and feature overview |
| CaseTimeline Mobile | `09_APP/CaseTimeline/design.md` | UI/UX design decisions and screen layouts |
| Chromebook Toolbox | `09_APP/chromebook-toolbox/README.md` | Installation, usage, and configuration guide |
| CSV Import | `02_TIMELINES/CSV_IMPORT_GUIDE.md` | CSV format specification and import workflow |

## Next Steps

1. **Test CaseTimeline App**
   - Install on physical device via Expo Go
   - Import CSV timeline data
   - Add test events with attachments and voice notes
   - Export updated timeline back to CSV

2. **Test Chromebook Toolbox**
   - Open terminal and run basic commands
   - Create and save a note
   - Record an audio memo
   - Upload a test file

3. **Integrate with Workflow**
   - Use CaseTimeline for mobile timeline management
   - Use Chromebook Toolbox for quick development tasks
   - Keep CSV timeline data synchronized between mobile app and repo

4. **Commit to Repository**
   - Review all changes
   - Create feature branch or commit to main
   - Push to GitHub
   - Update any CI/CD workflows if needed

## Support

For issues or questions:

1. Check the component-specific README files
2. Review troubleshooting sections
3. Check GitHub issues in Prose_Truth_Repo
4. Create new issue with detailed description and logs

## Summary

You now have:

✅ CaseTimeline Mobile App - Professional timeline management on mobile devices  
✅ Chromebook Toolbox v2 - Lightweight development tools for Chromebook  
✅ CSV Timeline Data - Master timeline with import/export workflow  
✅ Comprehensive Documentation - Guides for installation, usage, and integration

All components follow the Prose Truth Repo conventions and integrate seamlessly with the existing workflow.

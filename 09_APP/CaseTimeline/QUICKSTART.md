# CaseTimeline - Quick Start Guide

**For Prose Truth Repo Integration**

## 🚀 Get Running in 3 Minutes

### Step 1: Install Dependencies (1 min)

npm install -g pnpm



```bash

pnpm install
```

**Don't have pnpm?**

```bash
npm install -g pnpm
```

### Step 2: Start the App (30 sec)

```bash
pnpm dev
```

You'll see:

- Metro bundler starting

- QR code displayed in terminal

- Dev server URL

### Step 3: Open on Your Device (1 min)

**Option A: Physical Device (Recommended)**

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)

1. Scan the QR code from terminal

1. App loads on your device

**Option B: Simulator/Emulator**

```bash
# iOS (macOS only)
pnpm ios

# Android
pnpm android
```

**Option C: Web Browser**

```bash
pnpm web
```

---

## 📱 First-Time Setup

### Import Your Timeline Data

1. **Tap "Import"** button in the toolbar

1. **Select** `02_TIMELINES/NORMALIZED_TIMELINE.csv`

1. **Wait** for parsing (5-10 seconds)

1. **View** your timeline in the grid

The app will automatically:

- Parse CSV rows into events

- Assign events to appropriate lanes

- Map event types with colors

- Store data locally for offline access

### Configure Your Workspace

**Default Lanes:**

- Lead Counsel

- Paralegal

- Judge

**Default Event Types:**

- Filing (red)

- Hearing (orange)

- Custody (green)

- Communication (blue)

- Incident (purple)

- Financial (pink)

- Other (gray)

**To customize:** Edit `types/timeline.ts`

---

## 📋 Daily Workflow

### 1. View Timeline

```
┌─────────────────────────────────────┐
│  2024  [2 months] [Export] [Import] │  ← Toolbar
├─────────────────────────────────────┤
│      │ Nov │ Dec │ Jan │ Feb │      │  ← Month headers
├──────┼─────┼─────┼─────┼─────┤      │
│ Lead │  3  │  1  │     │  2  │      │  ← Event counts
│ Para │  2  │  4  │  1  │     │      │
│ Judge│  1  │     │     │  1  │      │
└─────────────────────────────────────┘
```

- **Scroll horizontally** to navigate months

- **Tap cells** to view/edit events

- **Use zoom** to adjust time range (2, 3, 6, 12 months)

- **Change year** to view different periods

### 2. Add Events

**Quick Add:**

1. Tap empty cell

1. Select event type

1. Enter title and notes

1. Save

**Full Add:**

1. Tap empty cell

1. Fill in all fields:
  - Event type
  - Title
  - Notes
  - Attachments (optional)
  - Voice note (optional)

1. Save

### 3. Edit Events

1. Tap cell with events

1. Select event from list

1. Modify any field

1. Save changes

### 4. Export Updates

**When to export:**

- End of day

- After major updates

- Before court filings

- Weekly backup

**How to export:**

1. Tap "Export" in toolbar

1. Choose location (Downloads, iCloud, etc.)

1. File saved as `timeline-export-YYYYMMDD-HHMMSS.json`

**Sync with repo:**

```bash
# Copy exported file to repo
cp ~/Downloads/timeline-export-*.json ~/Prose_Truth_Repo/02_TIMELINES/

# Convert to CSV (if needed)
# Use web app or manual conversion
```

---

## 🔧 Common Tasks

### Add Attachment to Event

1. Open event editor

1. Tap "Add Attachment"

1. Select file from device

1. File stored locally with event

**Supported types:** PDF, DOCX, TXT, images

### Record Voice Note

1. Open event editor

1. Tap "Record Voice Note"

1. Tap red button to start recording

1. Tap stop when finished

1. Voice note attached to event

**Playback:** Tap play button in event editor

### Delete Event

1. Open event editor

1. Scroll to bottom

1. Tap "Delete Event" (red button)

1. Confirm deletion

**Warning:** Cannot be undone unless you have a backup

### Clear All Data

1. Tap "Reset" in toolbar

1. Confirm action

1. All events deleted

1. Re-import CSV to restore

---

## 🔄 Sync Workflow

### Prose Truth Repo → Mobile App

```bash
# 1. Update CSV in repo
cd ~/Prose_Truth_Repo/02_TIMELINES
# Edit NORMALIZED_TIMELINE.csv

# 2. Import to mobile app
# Tap "Import" → Select CSV → Confirm
```

### Mobile App → Prose Truth Repo

```bash
# 1. Export from mobile app
# Tap "Export" → Save to Downloads

# 2. Copy to repo
cp ~/Downloads/timeline-export-*.json ~/Prose_Truth_Repo/02_TIMELINES/

# 3. Convert to CSV (optional)
# Use conversion script or manual process

# 4. Commit to Git
cd ~/Prose_Truth_Repo
git add 02_TIMELINES/
git commit -m "Update timeline from mobile app"
git push
```

---

## 🐛 Troubleshooting

### App Won't Start

**Problem:** `pnpm: command not found`

**Solution:**

```bash
npm install -g pnpm
```

---

**Problem:** Metro bundler errors

**Solution:**

```bash
cd ~/Prose_Truth_Repo/09_APP/CaseTimeline
rm -rf node_modules
pnpm install
pnpm dev
```

---

**Problem:** "Expo Go not compatible"

**Solution:**

- Update Expo Go app on device

- Or run: `pnpm expo upgrade`

---

### Import Fails

**Problem:** CSV format error

**Solution:**

- Check CSV has all required columns

- Verify dates are YYYY-MM-DD format

- Remove special characters from cells

- See `02_TIMELINES/CSV_IMPORT_GUIDE.md`

---

**Problem:** "No events imported"

**Solution:**

- Check CSV file is not empty

- Verify event_type values are valid

- Check date format matches YYYY-MM-DD

---

### Voice Recording Not Working

**Problem:** Microphone permission denied

**Solution:**

- iOS: Settings → CaseTimeline → Allow Microphone

- Android: Settings → Apps → CaseTimeline → Permissions → Microphone

---

**Problem:** Recording fails to save

**Solution:**

- Check device storage space

- Restart app

- Try shorter recording

---

### Export Not Working

**Problem:** Share dialog doesn't appear

**Solution:**

- Grant storage permissions

- Check available storage space

- Try different export location

---

## 📚 Key Files

| File | Purpose |
| --- | --- |
| `README.md` | Full documentation |
| `INTEGRATION_README.md` | Prose Truth Repo integration guide |
| `QUICKSTART.md` | This file |
| `design.md` | UI/UX design decisions |
| `todo.md` | Feature tracking |
| `02_TIMELINES/CSV_IMPORT_GUIDE.md` | CSV format specification |

---

## 🎯 Pro Tips

### Efficiency Tips

1. **Use voice notes** for quick capture during meetings or court

1. **Attach photos** of documents directly from camera

1. **Export daily** to avoid data loss

1. **Use zoom controls** to focus on relevant time periods

1. **Color-code events** by type for quick visual scanning

### Data Management

1. **Keep CSV in sync** - Export weekly to repo

1. **Backup before major changes** - Export before bulk edits

1. **Use consistent naming** - Follow exhibit codes from `03_EXHIBITS/`

1. **Tag with exhibit refs** - Link events to evidence in notes

### Mobile Optimization

1. **Use landscape** for wider timeline view

1. **Pinch to zoom** (if implemented) for quick navigation

1. **Swipe gestures** for faster scrolling

1. **Haptic feedback** confirms actions

---

## 🆘 Need Help?

### Documentation

- **Full guide:** `README.md`

- **Integration:** `INTEGRATION_README.md`

- **CSV format:** `02_TIMELINES/CSV_IMPORT_GUIDE.md`

- **Design docs:** `design.md`

### Support

- **GitHub Issues:** [https://github.com/cyserman/Prose_Truth_Repo/issues](https://github.com/cyserman/Prose_Truth_Repo/issues)

- **Repo README:** `~/Prose_Truth_Repo/README.md`

### Common Questions

**Q: Can I use this offline?**A: Yes! All data stored locally. Export/import requires file access.

**Q: Does this sync with the web app?**A: Not automatically. Use CSV export/import workflow.

**Q: Can multiple people use this?**A: Currently single-user. Cloud sync planned for future.

**Q: What happens if I lose my device?**A: Data is local only. Export regularly to repo for backup.

**Q: Can I customize lanes and event types?**A: Yes! Edit `types/timeline.ts` and restart app.

---

## ✅ Quick Reference

### Essential Commands

```bash
# Start app
pnpm dev

# Install dependencies
pnpm install

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Type check
pnpm check

# Run tests
pnpm test
```

### Essential Gestures

- **Tap cell** → Open event editor

- **Horizontal scroll** → Navigate months

- **Tap zoom buttons** → Change time range

- **Tap year dropdown** → Jump to year

- **Tap Export** → Save timeline data

- **Tap Import** → Load CSV data

### Essential Shortcuts

- **Quick add:** Tap empty cell

- **Quick edit:** Tap filled cell

- **Quick delete:** Open event → Delete button

- **Quick export:** Toolbar → Export

- **Quick import:** Toolbar → Import

---

**You're ready to go! Start by importing your CSV timeline data.**

For detailed information, see `README.md` or `INTEGRATION_README.md`.


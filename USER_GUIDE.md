# 📖 ProSe Legal DB - User Guide

**Welcome to your legal case management system!**

This guide will walk you through using all the features of the ProSe Legal DB application.

---

## 🚀 Getting Started

### First Time Setup

1. **Open the Application**
   - Navigate to `http://localhost:5173/` in your browser
   - The app will load with sample data

2. **Familiarize Yourself with the Interface**
   - **Left Sidebar**: Navigation menu with all features
   - **Main Area**: Content view that changes based on your selection
   - **Top Bar**: Shows current view and action buttons

---

## 📋 Core Features

### 1. Timeline View

**What it does:** Shows all your case events in a table format.

**How to use:**
- Click "Timeline" in the sidebar
- Use the search bar to find specific events
- Filter by category using the dropdown
- Click "✨ NEUTRALIZE" on any event to convert emotional language to court-ready text
- Click "Add Note" to attach a sticky note to an event

**Tips:**
- Events are sorted by date automatically
- Neutralized text appears in a blue box below the original
- Use search to quickly find events by keyword

---

### 2. Swimlane View

**What it does:** Visual timeline organized by category (like a Gantt chart).

**How to use:**
1. Click "Swimlane View" in the sidebar
2. Click "Switch Profile" to choose a view:
   - **Custody**: Communication, Incident, Exchange, Note
   - **PFA / Safety**: Incident, Evidence, Witness, Filing
   - **Financial**: Expense, Transfer, Order, Note
   - **Court Prep**: Filing, Evidence, Note, Task
   - **All Categories**: Complete timeline
3. Click any event bubble to:
   - View/edit notes
   - Attach to the floating note console
   - See full event details

**Tips:**
- Your profile preference is saved automatically
- Events are positioned by date on the timeline
- Hover over events to see full titles

---

### 3. Evidence Organizer

**What it does:** Manage all your files, documents, and evidence.

**How to use:**
1. Click "Evidence Organizer" in the sidebar
2. **Upload Files:**
   - Drag and drop files into the upload area, OR
   - Click "Choose File" to browse
3. **Classify Files:**
   - When you upload a new file, you'll be prompted to classify it
   - Select categories: Incident, Communication, Evidence, Court Filing, Note, Other
   - The system will ask logic questions (e.g., "Did you forget to mark this as Evidence?")
   - Add optional notes (type or use microphone 🎤)
4. **File Actions:**
   - Click the ⋮ menu on any file to:
     - ✨ AI Analyze / OCR
     - Mark OCR Complete
     - Mark as Filed
     - Delete

**Tips:**
- Files are automatically added to your timeline
- Use the microphone button for quick voice notes
- Processing info shows where each file will go

---

### 4. Floating Note Console

**What it does:** Quick note-taking that's always available.

**How to use:**
1. The floating note box appears in the bottom-left corner
2. **To attach to an event:**
   - Click any event in the timeline or swimlane view
   - The note console will automatically link to that event
3. **To add a note:**
   - Type your note, OR
   - Click the 🎤 button to record voice (speech-to-text)
   - Click "Add to Timeline"
4. **To move the console:**
   - Click and drag the top bar

**Tips:**
- Notes are automatically saved to your timeline
- Linked notes show which event they're attached to
- The console remembers your position

---

## 📄 Document Tools

### 5. Motion Builder

**What it does:** Generate court documents (motions, affidavits) from your timeline.

**How to use:**
1. Click "Motion Builder" in the sidebar
2. **Select Document Type:**
   - Motion for Custody
   - Affidavit
   - Motion to Compel
   - Response to Motion
3. **Select Events:**
   - Check the boxes next to timeline events you want to include
   - Click "Auto-Populate Sections from Selected Events"
4. **Edit Sections:**
   - Each section has its own text area
   - Required sections are marked with *
   - Edit the auto-populated content as needed
5. **Generate:**
   - Click "Generate Document"
   - Review the preview
   - Click "Export TXT" or "Print/PDF" to save

**Tips:**
- Select events in chronological order for best results
- The system automatically includes exhibit references
- For Affidavits, a verification section is added automatically

---

### 6. Deadline Tracker

**What it does:** Track all your court deadlines and important dates.

**How to use:**
1. Click "Deadline Tracker" in the sidebar
2. **Add a Deadline:**
   - Click "Add Deadline"
   - Fill in:
     - **Title**: e.g., "File Response to Motion"
     - **Date**: Select the deadline date
     - **Type**: Filing, Hearing, Response, Court Order, Other
     - **Reminder**: Days before deadline to remind you
     - **Description**: Optional notes
   - Click "Add Deadline"
3. **Enable Notifications:**
   - Click "Enable Notifications" (browser will ask permission)
   - You'll get alerts when deadlines approach
4. **Manage Deadlines:**
   - Check the box to mark as complete
   - Click trash icon to delete
   - View stats: Overdue, Due Today, This Week

**Tips:**
- Set reminders 7-14 days before important deadlines
- Color coding: Red = Overdue, Orange = Today, Yellow = Urgent
- All deadlines are saved automatically

---

### 7. Contradiction Detector

**What it does:** Find inconsistencies and contradictions in statements.

**How to use:**
1. Click "Contradiction Detector" in the sidebar
2. Click "Analyze for Contradictions"
3. Review the findings:
   - **High Severity**: Major contradictions (e.g., "agreed" vs "refused")
   - **Medium Severity**: Timeline inconsistencies
4. **Use the Results:**
   - Side-by-side comparison of conflicting statements
   - Dates and event IDs for reference
   - Use for cross-examination preparation

**Tips:**
- Run analysis after adding new events
- Search contradictions by topic
- High-severity contradictions are most useful for court

---

## ✨ AI Features

### 8. Strategic Analyzer

**What it does:** AI-powered analysis of your case timeline.

**How to use:**
1. Click "Strategic Analyzer" in the sidebar
2. Click the button to run analysis
3. Review the strategic insights:
   - Pattern analysis
   - Legal strategy suggestions
   - Timeline gaps identified

**Tips:**
- Run this after adding significant events
- Use insights to guide your case strategy
- Save important analyses for reference

---

### 9. Language Normalizer

**What it does:** Convert emotional language to court-ready, neutral text.

**How to use:**
1. In Timeline view, click "✨ NEUTRALIZE" on any event
2. The AI will:
   - Remove emotional language
   - Convert to factual statements
   - Preserve the original in history
3. Review the neutralized version (appears in blue box)

**Examples:**
- "She refused" → "The request was declined"
- "He was cruel" → [Removed, facts only]
- "Deliberately withheld" → "Was not made available"

**Tips:**
- Always review AI-neutralized text before using in court
- Original text is preserved for reference
- Use neutralized text in motions and affidavits

---

## 🔧 Utilities

### 10. Import CSV

**What it does:** Import timeline data from CSV files.

**How to use:**
1. Click "Import CSV" in the sidebar
2. **Option 1 - File Upload:**
   - Drag and drop a CSV file
   - Or click to browse
3. **Option 2 - Paste CSV:**
   - Copy CSV text
   - Paste into the text area
   - Click "Import Pasted CSV"
4. **Expected Format:**
   - Headers: `date`, `title`, `description`, `description_neutral`, `exhibitRefs`, `source`
   - Date format: `YYYY-MM-DD`

**Tips:**
- Imported events are added to your timeline
- Duplicate dates/titles are handled automatically
- Check the notification for import results

---

### 11. Export Options

**Export JSON:**
- Complete backup of all your data
- Includes events, exhibits, files, notes
- Use for backup or transfer to another device

**Export Markdown:**
- Timeline in Markdown format
- Good for documentation
- Easy to read and edit

**Export PDF:**
- Print-ready timeline
- Court-ready format
- Includes all events with dates

**Tips:**
- Export regularly for backup
- JSON export is most complete
- PDF is best for court filings

---

## 🎨 Customization

### Themes

Click the theme buttons in the sidebar:
- **☀️ Light**: Clean, bright interface
- **🌙 Dark**: Dark mode for low-light
- **🎨 Textured Blue**: Textured background with depth

**Tips:**
- Theme preference is saved automatically
- Choose based on your environment
- Textured theme adds visual interest

---

## 🎤 Voice Features

### Voice Input

**Available in:**
- Evidence Organizer (file notes)
- Floating Note Console
- Timeline event notes
- Swimlane event editing

**How to use:**
1. Click the 🎤 microphone button
2. Speak clearly
3. Text appears automatically
4. Click stop or the button again to finish

**Requirements:**
- Chrome or Edge browser (best support)
- Microphone permission
- Internet connection (for speech recognition)

**Tips:**
- Speak clearly and pause between sentences
- Review transcribed text for accuracy
- Works best in quiet environments

---

## 📱 Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save (auto-save is always on)
- **Ctrl/Cmd + F**: Search (in timeline view)
- **Esc**: Close modals/dialogs

---

## 💾 Data Management

### Auto-Save

- All changes are saved automatically
- Data stored in browser localStorage
- No manual save needed

### Backup

- Export JSON regularly for backup
- Store backups in a safe location
- Can restore by importing JSON

### Clear Data

- Click "Clear Data" in sidebar (bottom)
- **Warning**: This permanently deletes all data
- Only use if starting fresh

---

## 🆘 Troubleshooting

### App Won't Load
- Check that dev server is running (`npm run dev`)
- Clear browser cache
- Try a different browser

### Voice Input Not Working
- Grant microphone permission
- Use Chrome or Edge
- Check browser settings

### Files Not Uploading
- Check file size (large files may take time)
- Ensure file format is supported
- Try refreshing the page

### Data Missing
- Check browser localStorage isn't full
- Try exporting JSON before clearing
- Check if you're in the correct view

---

## 📞 Need Help?

- Check the README.md for technical details
- Review FEATURES.md for complete feature list
- Check browser console (F12) for errors

---

## 🎯 Quick Reference

**Most Common Tasks:**

1. **Add an Event**: Timeline → Add event manually or import CSV
2. **Upload Evidence**: Evidence Organizer → Drag & drop files
3. **Generate Motion**: Motion Builder → Select events → Generate
4. **Track Deadline**: Deadline Tracker → Add Deadline
5. **Find Contradictions**: Contradiction Detector → Analyze
6. **Add Quick Note**: Floating Note Console → Type/Record → Add

---

**Last Updated:** December 2024  
**Version:** 1.0


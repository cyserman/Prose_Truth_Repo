# How to Import Your Timeline Data

## Quick Start (Easiest Way)

1. **Open the app**: http://localhost:5177/
2. **Click "Import CSV"** in the left sidebar
3. **Click the green "Load seed timeline" button** (bottom right of the import screen)
4. **Done!** Your 5 critical events are now loaded
5. **Click "Timeline"** in the left sidebar to see them

## Files Location

All your data files are here:
```
09_APP/prose-legal-db-app/public/
├── seed_timeline.csv          ← Quick load (5 events)
├── master_timeline_merged.csv  ← Full timeline (379+ events)
└── exhibit_index.csv          ← Exhibit codes
```

## Import Full Timeline (All 379+ Events)

**Option 1: Use the "Choose File" button**
- Click "Import CSV" → "Master Timeline" box
- Click the blue "Choose File" button
- Navigate to: `09_APP/prose-legal-db-app/public/master_timeline_merged.csv`
- Select it

**Option 2: Paste CSV**
- Click "Import CSV"
- Find the "Paste CSV (fallback)" box
- Open `master_timeline_merged.csv` in a text editor
- Copy all the text
- Paste into the box
- Click "Import from Paste"

## What's in the Files?

- **seed_timeline.csv**: 5 critical events (Gas Incident, PFA Filing, Camper Incident, AppClose blocking)
- **master_timeline_merged.csv**: All 379 SMS messages + 8 strategic events
- **exhibit_index.csv**: Exhibit codes mapped to evidence files

## Troubleshooting

If "Load seed timeline" doesn't work:
1. Make sure the dev server is running: `npm run dev` in `09_APP/prose-legal-db-app`
2. Check browser console (F12) for errors
3. Try the paste method instead


# FloatingEvidenceConsole Component

A draggable, resizable floating console for quick evidence entry with file drop, AI normalization, and voice recording.

## Features

### 🎯 Core Functionality
- **Draggable & Resizable** - Uses `react-rnd` for smooth positioning
- **Two Tabs** - Note (text + file drop) and Mic (audio recording)
- **File Drop Zone** - Drag files or click to select
- **AI Normalization** - Calls local endpoint for automatic file processing
- **Watcher Integration** - Triggers `case_updates.json` for intake automation
- **CSV Export** - Exports entries ready for timeline merge

### 🎨 UI Features
- Firebase-style glassmorphism design
- Matches existing app theme (blue accents, glass-dark)
- Responsive and accessible
- Smooth animations and transitions

## Usage

### Basic Integration

```jsx
import FloatingEvidenceConsole from './components/FloatingEvidenceConsole';

// In your component
<FloatingEvidenceConsole
  onSubmit={(entry) => {
    console.log('New entry:', entry);
    // Handle the entry (add to timeline, etc.)
  }}
/>
```

### AI Normalizer Endpoint

The component calls `http://localhost:5001/normalize` by default. To configure:

1. **Update the endpoint** in `FloatingEvidenceConsole.jsx`:
   ```jsx
   const res = await fetch("http://localhost:5001/normalize", { 
     method: "POST", 
     body: form 
   });
   ```

2. **Expected response format**:
   ```json
   {
     "summary": "AI-generated summary of the file"
   }
   ```

3. **Fallback**: If the endpoint fails, it shows a basic file summary.

## Component Props

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `function` | Callback when entry is added to timeline. Receives entry object. |

## Entry Format

Entries exported as CSV with these fields:
- `Date` - ISO date (YYYY-MM-DD)
- `Time` - Local time string
- `Filename` - File name or "(manual note)"
- `Categories` - "Evidence" or "Note"
- `Flags` - Additional metadata
- `Note` - Text note or file description
- `Destination` - "/09_APP/Database/"
- `SourcePath` - Original file path

## Watcher Integration

The component automatically triggers the watcher by downloading `case_updates.json` with:
- `type` - Event type ("file_drop", "file_select", "new_note", "open_watcher")
- `detail` - Description of the action
- `timestamp` - ISO timestamp

Your Python watcher should monitor for this file and process accordingly.

## Audio Recording

- Uses `MediaRecorder` API
- Records as `audio/webm`
- Requires microphone permissions
- Playback controls included
- Can be cleared before adding to timeline

## Styling

Uses Tailwind classes and custom glassmorphism utilities:
- `glass-dark` - Main container background
- `glass-warm` - Header background
- `btn-ember` - Button styling
- `scrollbar-hide` - Hidden scrollbars

## Dependencies

- `react-rnd` - Drag and resize functionality
- `papaparse` - CSV export
- `lucide-react` - Icons (already in project)

## Future Enhancements

Potential additions:
- [ ] AI normalization preview panel with editable fields
- [ ] Multiple file support with batch processing
- [ ] File type validation
- [ ] Progress indicators for large files
- [ ] Keyboard shortcuts
- [ ] Position persistence (localStorage)
- [ ] Multiple console instances

## Troubleshooting

### AI Normalizer Not Working
- Check that endpoint is running on `localhost:5001`
- Verify CORS settings if calling external endpoint
- Check browser console for errors
- Component falls back to basic summary if endpoint fails

### Microphone Not Working
- Check browser permissions
- Try Chrome or Edge (best MediaRecorder support)
- Verify microphone is not in use by another app

### File Drop Not Working
- Ensure files are being dragged from file explorer
- Check browser console for errors
- Try click-to-select as alternative

## Example Workflow

1. **User drops a PDF file** → Component calls AI normalizer
2. **AI returns summary** → Displayed in preview panel
3. **User adds note** → Types additional context
4. **User clicks "Add to Timeline"** → CSV exported + watcher triggered
5. **Python watcher processes** → Adds to timeline automatically

---

**Component Status:** ✅ Production Ready  
**Last Updated:** 2025-12-28


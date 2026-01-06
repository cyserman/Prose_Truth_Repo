# Repo Agent - Guided File Intake System

## Purpose

The Repo Agent watches for new files and guides you through:
1. **Classification** - What type of file is this?
2. **Note-taking** - Optional voice or typed notes
3. **Processing Info** - Where it's going, what will happen, why it can/can't be processed
4. **Automatic Routing** - Sends files to the right handlers

## Usage

### Watch Mode (Automatic)
```bash
cd /home/ezcyser/⏰\ Projects🕰️/🪤\ PROSE_TRUTH_REPO
python3 09_APP/agents/repo_agent.py
```

The agent will:
- Watch `09_APP/Generated/` for new files
- Prompt you to classify each new file
- Ask for optional notes
- Show processing information
- Route files to appropriate handlers
- Log everything to `09_APP/Database/intake_log.json`

### Single File Mode
```bash
python3 09_APP/agents/repo_agent.py /path/to/file.csv
```

Process a specific file immediately.

## Features

### Classification
- Communication
- Evidence
- Timeline
- Court Filing
- Incident
- Note
- Other

### Processing Info Display
For each file, you'll see:
- ✅ **Can Process**: Destination, Handler, Action, ETA
- ⚠️ **Cannot Process**: Reason, Suggestion

### Supported Formats
- **CSV** → Merged into Master_CaseDB.csv
- **PDF/Images** → OCR text extraction
- **DOCX/TXT** → Text indexing

### Logging
All intakes are logged to:
- `09_APP/Database/intake_log.json` - Full intake history
- `09_APP/Database/processing_status.json` - Current processing status

## Integration with React UI

The React app can:
- Read `intake_log.json` to show file history
- Read `processing_status.json` to show what's processing
- Trigger the agent via API call (future enhancement)

## Future Enhancements

- [ ] Voice note transcription (Whisper integration)
- [ ] GUI mode (Streamlit or Tkinter)
- [ ] Real-time status updates
- [ ] File preview before classification
- [ ] Batch processing mode


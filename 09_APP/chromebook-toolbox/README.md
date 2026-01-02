# Chromebook Toolbox v2

> **Note**: This directory is a placeholder for the Chromebook Toolbox v2 component.
> The actual implementation files need to be provided via the integration package.

## Overview

Chromebook Toolbox v2 is a tabbed development toolbox designed for Chromebook environments with the following features:

- **Terminal**: Full bash terminal with WebSocket and xterm.js
- **Notepad**: Quick text editor with auto-save
- **Recorder**: Audio recording with WebM export
- **Upload**: Drag-and-drop file upload

## Expected Structure

Once integrated, this directory should contain:

```
chromebook-toolbox/
├── public/                      # Frontend assets
├── notes/                       # Saved notes directory
├── uploads/                     # File uploads directory
├── package.json
├── server.js
└── README.md
```

## Installation

Please refer to the main [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md) in the repository root for complete installation instructions.

## Quick Start

```bash
cd 09_APP/chromebook-toolbox

# Install dependencies
npm install

# Start server
npm start
```

Open your browser to http://localhost:3000

## Features

### Terminal
- Full bash terminal with WebSocket
- Powered by xterm.js
- Real-time command execution

### Notepad
- Quick text editing
- Auto-save functionality
- Simple and efficient

### Recorder
- Audio recording capability
- WebM format export
- Easy to use interface

### Upload
- Drag-and-drop file upload
- Supports multiple file types
- Organized file management

## Troubleshooting

### `node-pty` installation fails

```bash
# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential python3

# Reinstall dependencies
cd 09_APP/chromebook-toolbox
rm -rf node_modules
npm install
```

## Integration Status

⚠️ **Pending Integration** - The component files need to be extracted from the integration package.

For integration instructions, see:
- [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md) - Main integration guide
- Repository issue tracker for integration status updates

# CaseTimeline Mobile App

> **Note**: This directory is a placeholder for the CaseTimeline Mobile App component.
> The actual implementation files need to be provided via the integration package.

## Overview

CaseTimeline is a React Native/Expo mobile application for timeline management with the following features:

- **Swimlane Timeline Grid** with zoom controls
- **Event Editor** with attachments and voice notes  
- **CSV Import/Export** for data synchronization
- **Offline-first** with AsyncStorage persistence
- **Full Audio Recording** and playback with expo-audio

## Expected Structure

Once integrated, this directory should contain:

```
CaseTimeline/
├── app/                         # Expo Router screens
├── components/                  # UI components
├── lib/                         # Utilities and state management
├── types/                       # TypeScript definitions
├── package.json
├── README.md
└── INTEGRATION_README.md        # Detailed integration guide
```

## Installation

Please refer to the main [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md) in the repository root for complete installation instructions.

## Quick Start

```bash
cd 09_APP/CaseTimeline

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will start and display a QR code to scan with the Expo Go app on your phone.

## Integration Status

⚠️ **Pending Integration** - The component files need to be extracted from the integration package.

For integration instructions, see:
- [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md) - Main integration guide
- Repository issue tracker for integration status updates

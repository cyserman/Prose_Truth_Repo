# CSV Import Guide

> **Note**: This document describes the CSV import functionality for the CaseTimeline Mobile App.
> The actual NORMALIZED_TIMELINE.csv file needs to be provided via the integration package.

## Overview

The CSV Timeline Data provides a normalized master timeline for case events that can be imported into the CaseTimeline Mobile App.

## CSV Format Specification

The CSV file must contain the following columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `event_id` | String | Yes | Unique identifier for the event |
| `date` | Date | Yes | Event date in YYYY-MM-DD format |
| `event_type` | String | Yes | Type/category of the event |
| `short_title` | String | Yes | Brief title of the event |
| `description` | Text | Yes | Detailed description of the event |
| `source` | String | Yes | Source of the information |
| `exhibit_refs` | String | No | References to exhibits (comma-separated) |
| `reliability` | String/Number | No | Reliability rating of the information |
| `notes` | Text | No | Additional notes or comments |

## Date Format

All dates must be in `YYYY-MM-DD` format (e.g., `2024-01-15`).

## Import Workflow

### Step 1: Prepare CSV File

Ensure your CSV file:
- Has all required columns
- Uses proper date format (YYYY-MM-DD)
- Escapes special characters properly
- Avoids line breaks within cells

### Step 2: Import into CaseTimeline App

1. Open the CaseTimeline mobile app
2. Tap the "Import" button in the toolbar
3. Select the CSV file (`02_TIMELINES/NORMALIZED_TIMELINE.csv`)
4. Wait for the app to parse and validate the data
5. Review the imported events in the timeline grid

### Step 3: Verify Import

After import:
- Check that all events are displayed
- Verify dates are correct
- Confirm event details are accurate
- Test timeline zoom and navigation

## Export Workflow

To export updated timeline data:

1. In the CaseTimeline app, tap the "Export" button
2. Choose export format (CSV recommended)
3. Save the exported file
4. Replace or merge with the repository CSV file
5. Commit and push changes to keep timeline synchronized

## Data Mapping

The CSV import maps columns to the following app data structure:

```javascript
// Example mapping used during CSV import in the CaseTimeline app
{
  id: event_id,
  date: new Date(date),
  type: event_type,
  title: short_title,
  description: description,
  source: source,
  exhibits: exhibit_refs?.split(','),
  reliability: reliability,
  notes: notes
}
```

## Troubleshooting

### CSV Import Fails

**Issue**: CSV format mismatch

**Solutions**:
- Verify all required columns are present
- Check date format is YYYY-MM-DD
- Ensure special characters are properly escaped
- Remove any line breaks within cells
- Validate CSV structure using a CSV linter

### Missing Data After Import

**Issue**: Some events don't appear

**Solutions**:
- Check for duplicate `event_id` values
- Verify date values are valid
- Ensure required fields are not empty
- Review app console for parsing errors

### Date Display Issues

**Issue**: Dates show incorrectly

**Solutions**:
- Confirm date format is YYYY-MM-DD
- Check for timezone-related issues
- Verify date values are within valid range

## Integration Status

⚠️ **Pending Integration** - The NORMALIZED_TIMELINE.csv file needs to be provided via the integration package.

For integration instructions, see:
- [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) - Main integration guide
- [CaseTimeline README](../09_APP/CaseTimeline/README.md) - Mobile app documentation

## Expected File Location

```
02_TIMELINES/
├── NORMALIZED_TIMELINE.csv      # ← Pending: Master timeline data
└── CSV_IMPORT_GUIDE.md          # ← This file
```

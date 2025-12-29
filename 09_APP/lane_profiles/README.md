# Lane Profiles

Lane profiles define how events are organized and displayed in the Swimlane Timeline view.

## Structure

Each profile is a JSON file containing:
- **Profile metadata** (name, description, version)
- **Lanes** (columns in the timeline)
- **Filters** (date range, priority, status)
- **Settings** (grouping, sorting, display options)

## Default Profile

`default-lane-profile.json` provides a standard configuration for family law custody cases with 6 lanes:
1. Legal Filings
2. Communications
3. Evidence
4. Mediation & Negotiation
5. Hearings & Court
6. Parenting Activities

## Creating Custom Profiles

1. Copy `default-lane-profile.json` to a new file (e.g., `my-case-profile.json`)
2. Modify lanes, colors, icons, and categories
3. Load the profile in the app via Settings → Lane Profiles

## Example Use Cases

- **Custody Cases:** Use default profile
- **Support Cases:** Create profile focused on financial documents and payments
- **Protection Orders:** Create profile focused on incidents and court orders
- **Complex Litigation:** Create profile with 10+ lanes for detailed tracking


# CaseCraft Unified - Truth Repo Edition

**Professional Legal Evidence Management System**  
**Version**: 1.0.0-beta  
**Status**: Active Development  
**License**: Private Use Only

---

## 🎯 Overview

CaseCraft Unified is a privacy-first, local-only legal case management application designed for pro se litigants and legal professionals. Built with React 19 + TypeScript + Vite, it combines the best features from CaseCraft Pro and Prose Legal DB into a single, unified platform.

**Key Principles**:
- 🔒 **Privacy First** - All data stored locally, no cloud sync
- 💼 **Court-Ready** - SHA-256 hashing, forensic integrity
- 📱 **Mobile-Friendly** - Fully responsive, PWA installable
- 🚫 **No Tracking** - Zero telemetry, no external calls
- ✈️ **Offline Capable** - Works completely offline

---

## ✨ Features

### 📊 Dashboard
- **Evidence Statistics** - Total, Verified, In Timeline, Pending counts
- **Recent Activity** - Last 5 evidence items added
- **Visual Analytics** - Color-coded cards with icons
- **Quick Navigation** - Jump to any view from dashboard

### 📁 Truth Spine (Evidence Repository)
- **Search & Filter** - Full-text search across all evidence
- **Tag Management** - Add/remove tags, filter by multiple tags
- **Verification Status** - Cycle through: Pending → Verified → Disputed → Unverified
- **Timeline Toggle** - Promote/demote evidence to timeline
- **Exhibit Codes** - Track court exhibit identifiers
- **SHA-256 Hashing** - Forensic integrity for all items
- **Lane Organization** - Categorize by: Custody, Safety, Financial, Procedural, etc.

### 📅 Timeline View
- **Chronological Display** - Evidence sorted by timestamp
- **Sort Controls** - Oldest-first or newest-first
- **Lane Assignment** - Organize by case category
- **Visual Timeline** - Vertical line with status dots
- **Detailed Metadata** - Full timestamps, tags, verification status

### 📥 CSV Import/Export
- **CSV Import** - Upload evidence from external sources
- **Auto-Hashing** - SHA-256 generation during import
- **Field Mapping** - Supports common CSV formats
- **CSV Export** - Download complete evidence database
- **JSON Backup** - Full state export for archival

### 🎨 Professional UI
- **Dark Sidebar** - Slate-900 with white text for eye comfort
- **Blue Active States** - Clear visual indication of current view
- **Responsive Design** - Adapts to desktop, tablet, phone
- **Mobile Menu** - Hamburger navigation for small screens
- **Accessibility** - WCAG contrast compliant

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd /path/to/Prose_Truth_Repo/09_APP/casecraft-unified
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:5173/ in your browser.

### Production Build

```bash
npm run build
npx serve -s dist
```

---

## 📂 Project Structure

```
casecraft-unified/
├── src/
│   ├── components/
│   │   ├── shared/          # Reusable UI components
│   │   │   ├── Layout.tsx   # Main app shell with sidebar
│   │   │   ├── Badge.tsx    # Status indicators
│   │   │   └── Card.tsx     # Content containers
│   │   ├── views/           # Main application views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SpineView.tsx
│   │   │   └── TimelineView.tsx
│   │   └── features/        # Feature-specific components
│   ├── services/
│   │   ├── storage.ts       # LocalStorage management
│   │   └── csv.ts           # CSV import/export
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Entry point
├── public/
│   └── manifest.json        # PWA configuration
└── package.json
```

---

## 🔐 Privacy & Security

### Local-Only Storage
- All data stored in browser LocalStorage
- **No cloud uploads** - Ever
- **No external API calls** (except optional AI with user-provided keys)
- **No telemetry** or analytics

### Data Security
- SHA-256 hashing for evidence integrity
- `.env` files gitignored
- Sensitive data patterns excluded from version control
- Air-gap deployment capable (USB `dist/` folder)

### API Keys (Optional)
If using AI features (future):
1. Copy `.env.example` to `.env`
2. Add your Gemini API key: `VITE_GEMINI_API_KEY=your-key`
3. AI features remain **optional** - app works fully offline

---

## 📱 Mobile Deployment

### PWA Installation
1. Open http://localhost:5173/ on mobile browser
2. Tap "Add to Home Screen"
3. Use as standalone app

### Responsive Breakpoints
- **Mobile**: < 768px (hamburger menu)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.8+ |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 4.x |
| CSV Parser | papaparse | 5.5+ |
| Icons | lucide-react | Latest |
| Dates | date-fns | 4.x |
| AI (Optional) | @google/genai | Latest |

---

## 📋 Current Features Status

✅ **Completed**:
- Dashboard with statistics
- Truth Spine (evidence repository)
- Timeline view
- CSV import/export
- JSON backup/restore
- LocalStorage persistence
- Professional dark theme
- Mobile responsive design

🚧 **In Development**:
- Swimlane view (multi-lane visualization)
- AI analysis integration
- Sticky notes (draggable)
- Deadline tracker
- Contradiction detector
- Motion builder
- PDF generation

---

## 🔄 Data Import/Export

### CSV Import Format

```csv
ID,Type,Sender,Content,Timestamp,Verified,VerificationStatus,Lane,Tags,ExhibitCode
ev-001,INCIDENT,Source,Description text,2024-01-01T00:00:00Z,true,VERIFIED,CUSTODY,TAG1;TAG2,Ex-A-01
```

**Supported Fields**:
- `ID` - Unique identifier (auto-generated if missing)
- `Type` - INCIDENT, DOCUMENT, COMMUNICATION, etc.
- `Sender` - Source of evidence
- `Content` - Main description
- `Timestamp` - ISO 8601 format
- `Verified` - true/false
- `VerificationStatus` - PENDING, VERIFIED, DISPUTED, UNVERIFIED
- `Lane` - CUSTODY, SAFETY, FINANCIAL, PROCEDURAL, etc.
- `Tags` - Comma-separated list
- `ExhibitCode` - Court exhibit identifier

### Export Formats
- **CSV** - All evidence with complete fields
- **JSON** - Full application state backup

---

## 🎯 Use Cases

### Pro Se Litigation (Primary)
- Organize evidence for family court cases
- Track custody modifications, PFA proceedings
- Maintain forensic timeline of events
- Generate court-ready exhibits

### Legal Professionals
- Case management for solo practitioners
- Evidence organization for small firms
- Collaborative case review (demo mode)
- Client document management

### Research & Education
- Legal tech demonstrations
- Privacy-focused app architecture
- TypeScript + React best practices
- Offline-first PWA development

---

## 🚨 Important Notes

### For Private Case Data
- Keep this installation **local only**
- Never deploy with real case data to public hosting
- Use air-gapped machines for sensitive cases
- Regular JSON backups to encrypted USB drives

### For Collaborative/Demo Use
- Deploy to Vercel/Netlify with **sample data only**
- Clear all real evidence before deployment
- Use demo data for training/presentations
- Keep production instance separate

---

## 📞 Support

**Documentation**: See `/home/cyserman/.gemini/antigravity/brain/e9ca63fa-e2b9-4439-8737-f36f6e402b87/`  
**Project**: Prose Truth Repo  
**Case**: Firey v. Firey  

---

## 📜 License

**Private Use Only**  
This software is for personal use in the Firey v. Firey case.  
No redistribution, modification, or commercial use permitted without written consent.

---

## 🙏 Acknowledgments

Built with assistance from Google DeepMind's AI coding agent.  
Combines features from CaseCraft Pro and Prose Legal DB.  
Designed for privacy, security, and pro se empowerment.

**Version**: 1.0.0-beta  
**Last Updated**: 2026-01-07  
**Status**: Active Development

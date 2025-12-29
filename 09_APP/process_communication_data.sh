#!/bin/bash
# Process Communication Data for ProSe Legal DB
# Merges SMS/AppClose data with strategic timeline events

set -e

REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
INBOX="$REPO_ROOT/06_SCANS/INBOX/new"
OUTPUT="$REPO_ROOT/09_APP/prose-legal-db-app/public"

echo "🔄 Processing Communication Logs..."

# 1. Start with the existing SMS timeline
if [ -f "$INBOX/me_paige_wife_timeline_import.csv" ]; then
    echo "✅ Found SMS timeline CSV"
    cp "$INBOX/me_paige_wife_timeline_import.csv" "$OUTPUT/master_timeline_merged.csv"
else
    echo "⚠️  SMS timeline not found, creating from scratch"
    echo "date,title,description,description_neutral,exhibitRefs,source" > "$OUTPUT/master_timeline_merged.csv"
fi

# 2. Append strategic events from the analysis
cat >> "$OUTPUT/master_timeline_merged.csv" <<'EOF'
2024-11-06,Financial Strain - Gas Incident,"Father ran out of gas at school while attempting to pick up children. Mother dismissed request for help with 'Call AAA' response.",,SMS-2024-11-06,Communication
2024-11-11,PFA Filed - Emergency Protection,"Emergency PFA filed by Respondent. Beginning of legal exclusion period.",,PFA-001,Court Filing
2024-11-23,Camper Incident - Coordinated Arrest,"Respondent invited Petitioner to retrieve camper, then coordinated arrest with law enforcement. Witness 'John' statement regarding phone coordination.",,CAMPER-001,Third Party
2024-11-XX,Reactive Text - Irony Message,"Father confronted Mother about replacing him with convicted felon. Admitted as reactive expression of frustration to gaslighting. High-risk but contextualizes emotional state.",,SMS-PAGE-75,Communication
2025-02-13,AppClose Access Denied,"Father requested permission to make calls through AppClose platform. Access restricted by Respondent.",,APPCLOSE-2025-02-13,Communication
2025-03-02,AppClose Gaslighting,"Respondent: 'You don't like the app?' - Dismissive response to access issues.",,APPCLOSE-2025-03-02,Communication
2024-XX-XX,Tax Fraud/Manipulation,"Withheld tax documents causing $20k swing ($8k refund -> $12k liability). Dissipation of marital assets; bad faith.",,TAX-2024,Financial
2024-XX-XX,Parental Alienation - Gift Destruction,"Systematic destruction/sale of gifts from Father to children. Emotional abuse of minors.",,GIFTS-2024,Third Party
2024-XX-XX,Risk Assessment - Cohabitant,"Respondent cohabitating with convicted felon (Ricky Yannis) with history of violence. High risk factor - access to unsecured firearms.",,RISK-001,Risk Assessment
EOF

echo "✅ Added strategic timeline events"

# 3. Create exhibit index CSV
cat > "$OUTPUT/exhibit_index.csv" <<'EOF'
code,title,path,notes
SMS-2024-11-06,SMS Backup - Gas Incident,"06_SCANS/INBOX/new/Me_Paige_Wife.xlsx","Pre-separation baseline. Nov 6 gas incident."
SMS-PAGE-75,Reactive Text - Irony Message,"06_SCANS/INBOX/new/Me_Paige_Wife.xlsx","Page 75 - High-risk reactive text contextualizing emotional state."
PFA-001,Emergency PFA Filing,"02_TIMELINES/PFA_Timeline.csv","Nov 11 EPFA filing - beginning of exclusion."
CAMPER-001,Camper Incident Witness Statement,"03_EXHIBITS/CAMPER-001.pdf","Witness 'John' statement regarding coordinated arrest Nov 23."
APPCLOSE-2025-02-13,AppClose Access Denied Log,"06_SCANS/INBOX/new/2025-12-20 01-35.pdf","Feb 13 - Requested permission to make calls."
APPCLOSE-2025-03-02,AppClose Gaslighting Log,"06_SCANS/INBOX/new/2025-12-20 01-35.pdf","Mar 2 - Dismissive response to access issues."
TAX-2024,Tax Fraud Evidence,"03_EXHIBITS/TAX-2024.pdf","Withheld documents causing $20k swing."
GIFTS-2024,Parental Alienation Evidence,"03_EXHIBITS/GIFTS-2024.pdf","Systematic destruction of gifts from Father."
RISK-001,Risk Assessment - Cohabitant,"03_EXHIBITS/RISK-001.pdf","Cohabitation with convicted felon - high risk."
EOF

echo "✅ Created exhibit index CSV"

# 4. Create a seed file for the app
cat > "$OUTPUT/seed_timeline.csv" <<'EOF'
date,title,description,description_neutral,exhibitRefs,source
2024-11-06,Financial Strain - Gas Incident,"Father ran out of gas at school while attempting to pick up children. Mother dismissed request for help with 'Call AAA' response.",,SMS-2024-11-06,Communication
2024-11-11,PFA Filed - Emergency Protection,"Emergency PFA filed by Respondent. Beginning of legal exclusion period.",,PFA-001,Court Filing
2024-11-23,Camper Incident - Coordinated Arrest,"Respondent invited Petitioner to retrieve camper, then coordinated arrest with law enforcement. Witness 'John' statement regarding phone coordination.",,CAMPER-001,Third Party
2025-02-13,AppClose Access Denied,"Father requested permission to make calls through AppClose platform. Access restricted by Respondent.",,APPCLOSE-2025-02-13,Communication
2025-03-02,AppClose Gaslighting,"Respondent: 'You don't like the app?' - Dismissive response to access issues.",,APPCLOSE-2025-03-02,Communication
EOF

echo "✅ Created seed timeline CSV"

echo ""
echo "📊 Summary:"
echo "  - Master Timeline: $OUTPUT/master_timeline_merged.csv"
echo "  - Exhibit Index: $OUTPUT/exhibit_index.csv"
echo "  - Seed Timeline: $OUTPUT/seed_timeline.csv"
echo ""
echo "🚀 Next Steps:"
echo "  1. Restart app: npm run dev (in 09_APP/prose-legal-db-app)"
echo "  2. Click 'Import CSV' → 'Load seed timeline' OR"
echo "  3. Import 'master_timeline_merged.csv' via drag-drop or paste"
echo ""


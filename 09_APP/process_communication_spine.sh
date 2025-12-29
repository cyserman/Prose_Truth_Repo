#!/bin/bash
# Process Communication Data - The "Spine" of Your Case
# Adapted for current app structure: 09_APP/prose-legal-db-app

set -e

REPO_ROOT="/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO"
INBOX="$REPO_ROOT/06_SCANS/INBOX/new"
OUTPUT="$REPO_ROOT/09_APP/prose-legal-db-app/public"
SALVAGED="$REPO_ROOT/06_SCANS/INBOX/Salvaged"

echo "🔄 Processing Communication Logs - Building the Case Spine..."

# 1. Start with existing SMS timeline (already processed)
if [ -f "$INBOX/me_paige_wife_timeline_import.csv" ]; then
    echo "✅ Found SMS timeline CSV (Pre-Separation Baseline)"
    cp "$INBOX/me_paige_wife_timeline_import.csv" "$OUTPUT/case_spine_timeline.csv"
else
    echo "⚠️  SMS timeline not found, creating base structure"
    echo "date,title,description,description_neutral,exhibitRefs,source" > "$OUTPUT/case_spine_timeline.csv"
fi

# 2. Add strategic events from the analysis (The "Spine" events)
cat >> "$OUTPUT/case_spine_timeline.csv" <<'EOF'
2024-11-06,Financial Strain - Gas Incident,"Father ran out of gas at school while attempting to pick up children. Mother dismissed request for help with 'Call AAA' response. Context for vehicle/financial issues.","Father experienced vehicle failure while attempting to exercise parenting time. Respondent declined to provide assistance, directing Father to contact roadside assistance service.",SMS-2024-11-06,Communication
2024-11-11,PFA Filed - Emergency Protection,"Emergency PFA filed by Respondent. Beginning of legal exclusion period. This is your Pre-Separation Baseline - proves the dynamic before the PFA.","Emergency Protection From Abuse order filed by Respondent, initiating legal separation period.",PFA-001,Court Filing
2024-11-23,Camper Incident - Coordinated Arrest,"Respondent invited Petitioner to retrieve camper, then coordinated arrest. Witness 'John' statement regarding phone coordination. Legal Abuse & Setup.","Respondent extended invitation for Petitioner to retrieve personal property (camper). Law enforcement was contacted and present during retrieval attempt.",CAMPER-001,Third Party
2024-11-XX,Reactive Text - Irony Message (Page 75),"Critical 'hot' message drafted as journal entry but sent by mistake. Calls out irony of felon cohabitant ('Ricky') vs. her accusations. High-risk but high-value if framed correctly as 'Reactive Abuse' to gaslighting. Contextualizes Father's emotional state; rebuts 'harassment' claim.","Petitioner sent message expressing frustration regarding Respondent's choice of cohabitant. Message was intended as private journal entry but was inadvertently transmitted. Demonstrates reactive response to ongoing pattern of behavior.",SMS-PAGE-75,Communication
2025-02-13,AppClose Access Denied,"Father requested permission to make calls through AppClose platform. Access restricted by Respondent. Post-Separation Obstruction Evidence - proves she controls the channel.","Petitioner attempted to communicate through court-ordered parenting app. Access to communication features was denied by Respondent.",APPCLOSE-2025-02-13,Communication
2025-03-02,AppClose Gaslighting,"Respondent: 'You don't like the app?' - Dismissive response to access issues. Post-Separation Obstruction Evidence.","Respondent responded dismissively to Petitioner's access concerns regarding parenting communication platform.",APPCLOSE-2025-03-02,Communication
2024-XX-XX,Tax Fraud/Manipulation,"Withheld tax documents causing $20k swing ($8k refund -> $12k liability). Dissipation of marital assets; bad faith. Financial Sabotage.","Respondent failed to provide necessary documentation for joint tax filing, resulting in significant financial liability shift. Demonstrates bad faith in financial matters.",TAX-2024,Financial
2024-XX-XX,Parental Alienation - Gift Destruction,"Systematic destruction/sale of gifts from Father to children. Emotional abuse of minors.","Respondent systematically removed, destroyed, or disposed of gifts provided by Petitioner to minor children, impacting children's relationship with Petitioner.",GIFTS-2024,Third Party
2024-XX-XX,Risk Assessment - Cohabitant,"Respondent cohabitating with convicted felon (Ricky Yannis) with history of violence. High risk factor - access to unsecured firearms. Immediate Safety Threat.","Respondent is cohabitating with individual with criminal history involving violence. Safety concerns exist regarding access to firearms in home where minor children reside.",RISK-001,Risk Assessment
EOF

echo "✅ Added strategic 'Spine' events to timeline"

# 3. Create comprehensive exhibit index
cat > "$OUTPUT/case_spine_exhibits.csv" <<'EOF'
code,title,path,notes
SMS-2024-11-06,SMS Backup - Gas Incident,"06_SCANS/INBOX/new/Me_Paige_Wife.xlsx","Pre-separation baseline. Nov 6 gas incident - Financial strain evidence."
SMS-PAGE-75,Reactive Text - Irony Message,"06_SCANS/INBOX/new/Me_Paige_Wife.xlsx","Page 75 - High-risk reactive text. Contextualizes emotional state; rebuts harassment claim. Framed as Reactive Abuse to gaslighting."
PFA-001,Emergency PFA Filing,"02_TIMELINES/PFA_Timeline.csv","Nov 11 EPFA filing - beginning of exclusion period. Pre-Separation Baseline."
CAMPER-001,Camper Incident Witness Statement,"03_EXHIBITS/CAMPER-001.pdf","Witness 'John' statement regarding coordinated arrest Nov 23. Legal Abuse & Setup evidence."
APPCLOSE-2025-02-13,AppClose Access Denied Log,"06_SCANS/INBOX/new/2025-12-20 01-35.pdf","Feb 13 - Requested permission to make calls. Post-Separation Obstruction Evidence."
APPCLOSE-2025-03-02,AppClose Gaslighting Log,"06_SCANS/INBOX/new/2025-12-20 01-35.pdf","Mar 2 - Dismissive response to access issues. Post-Separation Obstruction Evidence."
TAX-2024,Tax Fraud Evidence,"03_EXHIBITS/TAX-2024.pdf","Withheld documents causing $20k swing ($8k refund -> $12k liability). Financial Sabotage."
GIFTS-2024,Parental Alienation Evidence,"03_EXHIBITS/GIFTS-2024.pdf","Systematic destruction of gifts from Father. Emotional abuse of minors."
RISK-001,Risk Assessment - Cohabitant,"03_EXHIBITS/RISK-001.pdf","Cohabitation with convicted felon (Ricky Yannis) - high risk. Access to unsecured firearms. Immediate Safety Threat."
EOF

echo "✅ Created comprehensive exhibit index"

# 4. Create the "Spine" seed file (critical events only)
cat > "$OUTPUT/case_spine_seed.csv" <<'EOF'
date,title,description,description_neutral,exhibitRefs,source
2024-11-06,Financial Strain - Gas Incident,"Father ran out of gas at school while attempting to pick up children. Mother dismissed request for help with 'Call AAA' response.","Father experienced vehicle failure while attempting to exercise parenting time. Respondent declined to provide assistance.",SMS-2024-11-06,Communication
2024-11-11,PFA Filed - Emergency Protection,"Emergency PFA filed by Respondent. Beginning of legal exclusion period.","Emergency Protection From Abuse order filed by Respondent, initiating legal separation period.",PFA-001,Court Filing
2024-11-23,Camper Incident - Coordinated Arrest,"Respondent invited Petitioner to retrieve camper, then coordinated arrest.","Respondent extended invitation for Petitioner to retrieve personal property. Law enforcement was contacted and present.",CAMPER-001,Third Party
2025-02-13,AppClose Access Denied,"Father requested permission to make calls through AppClose platform. Access restricted.","Petitioner attempted to communicate through court-ordered parenting app. Access was denied by Respondent.",APPCLOSE-2025-02-13,Communication
2024-11-XX,Reactive Text - Irony Message,"Critical message calling out irony of felon cohabitant vs. her accusations. High-value if framed as Reactive Abuse.","Petitioner sent message expressing frustration regarding Respondent's choice of cohabitant. Message was intended as private journal entry but was inadvertently transmitted.",SMS-PAGE-75,Communication
EOF

echo "✅ Created case spine seed file (5 critical events)"

# 5. Update the main seed file to use the spine
cp "$OUTPUT/case_spine_seed.csv" "$OUTPUT/seed_timeline.csv"
echo "✅ Updated seed_timeline.csv with case spine data"

echo ""
echo "📊 Case Spine Processing Complete!"
echo ""
echo "Files created:"
echo "  ✅ $OUTPUT/case_spine_timeline.csv (Full timeline with all events)"
echo "  ✅ $OUTPUT/case_spine_exhibits.csv (Exhibit index)"
echo "  ✅ $OUTPUT/case_spine_seed.csv (5 critical spine events)"
echo "  ✅ $OUTPUT/seed_timeline.csv (Updated for app)"
echo ""
echo "🧭 The Case Spine includes:"
echo "  • Pre-Separation Baseline (SMS messages)"
echo "  • Post-Separation Obstruction (AppClose blocking)"
echo "  • Legal Abuse & Setup (Camper Incident)"
echo "  • Financial Sabotage (Tax manipulation)"
echo "  • Parental Alienation (Gift destruction)"
echo "  • Safety Threat (Cohabitant with felon)"
echo "  • Reactive Abuse Context (Irony message)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open app: http://localhost:5177/"
echo "  2. Click 'Import CSV' → 'Load seed timeline'"
echo "  3. See your 5 critical spine events instantly"
echo "  4. Or import full timeline: case_spine_timeline.csv"
echo ""


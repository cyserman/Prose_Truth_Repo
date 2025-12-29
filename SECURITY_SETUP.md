# 🔒 Security & Quality Setup

## Overview

This repository includes automated security and quality checks to protect sensitive legal data and ensure accessibility compliance.

---

## 🛡️ Security Features

### 1. **Secrets Scanning**

#### Automated (GitHub Actions)
- Runs on every push and PR
- Uses `detect-secrets` to scan for API keys, tokens, passwords
- Workflow: `.github/workflows/security.yml`

#### Manual Scan
```bash
# Run local secrets scan (no Python required)
./scripts/scan-secrets.sh
```

**Detected Patterns:**
- AWS Keys (AKIA...)
- Firebase/Gemini API Keys (AIza...)
- Private Keys (RSA, DSA, EC)
- Generic API keys, secrets, passwords, tokens

#### Pre-commit Hook
Automatically checks staged files for secrets before each commit.

**Location:** `.git/hooks/pre-commit`

**To bypass** (use with caution):
```bash
git commit --no-verify
```

---

### 2. **Shell Script Linting**

All `.sh` scripts are automatically checked with `shellcheck`:
- In GitHub Actions CI
- In pre-commit hook (syntax check)

---

### 3. **Secrets Baseline**

**File:** `.secrets.baseline`

This file tracks known/approved "secrets" (false positives). If `detect-secrets` is installed:

```bash
# Install detect-secrets
pip3 install detect-secrets

# Scan and update baseline
detect-secrets scan --baseline .secrets.baseline

# Audit findings interactively
detect-secrets audit .secrets.baseline
```

---

## ♿ Accessibility Testing

### Automated (GitHub Actions)
- Runs on PRs that modify React app
- Tests all major routes: Timeline, Evidence Organizer, Exhibits, Strategy
- Workflow: `.github/workflows/accessibility.yml`

### Manual Audit
```bash
cd 09_APP/prose-legal-db-app

# Start dev server
npm run dev

# In another terminal, run audit
bash scripts/accessibility-audit.sh
```

**Tests performed:**
- **axe-core**: WCAG 2.1 AA compliance
- **Lighthouse**: Accessibility score + best practices

**Reports saved to:** `09_APP/prose-legal-db-app/a11y-reports/`

---

## 🚀 GitHub Actions Workflows

### Security & Quality (`security.yml`)
**Triggers:** Push to main/develop, PRs
**Jobs:**
1. Secrets scan (detect-secrets)
2. Shell script linting (shellcheck)
3. BATS tests (if present)
4. React app build

### Accessibility (`accessibility.yml`)
**Triggers:** PRs modifying React app
**Jobs:**
1. Build React app
2. Start dev server
3. Run axe-core + Lighthouse on all routes
4. Upload reports as artifacts

---

## 📋 Pre-commit Checklist

Before every commit, the hook automatically:
1. ✅ Scans staged files for secrets
2. ✅ Blocks sensitive filenames (`.env`, `secrets.json`, etc.)
3. ✅ Checks shell script syntax
4. ⚠️  Warns if committing directly to `main`

---

## 🔧 Setup Instructions

### First Time Setup

```bash
# 1. Make scripts executable (already done)
chmod +x scripts/scan-secrets.sh
chmod +x 09_APP/prose-legal-db-app/scripts/accessibility-audit.sh
chmod +x .git/hooks/pre-commit

# 2. (Optional) Install Python tools for advanced scanning
pip3 install --user detect-secrets

# 3. Run initial secrets scan
./scripts/scan-secrets.sh

# 4. Test pre-commit hook
git add .
git commit -m "test: verify pre-commit hook"
```

---

## 🚨 If Secrets Are Found

### Immediate Actions:
1. **DO NOT COMMIT** the secrets
2. **Remove** from staged files: `git reset HEAD <file>`
3. **Rotate** the credentials immediately
4. **Add** to `.gitignore` if it's a config file

### If Already Committed:
```bash
# WARNING: This rewrites history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch <FILE_WITH_SECRET>' \
  --prune-empty -- --all

# Force push (coordinate with team first)
git push --force-with-lease
```

**Better approach:** Use `git-filter-repo` or BFG Repo-Cleaner

---

## 📊 Viewing Reports

### Accessibility Reports
```bash
# Open HTML report in browser
open 09_APP/prose-legal-db-app/a11y-reports/lighthouse-*.html

# View axe violations
cat 09_APP/prose-legal-db-app/a11y-reports/axe-*.json | jq '.violations'
```

### GitHub Actions
1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. Download artifacts: `secrets-report`, `accessibility-reports`, `react-build`

---

## 🔍 Manual Accessibility Checks

Beyond automated tools, always test:
1. ✅ **Keyboard navigation**: Tab through entire UI
2. ✅ **Focus indicators**: Visible on all interactive elements
3. ✅ **Screen reader**: Test with NVDA/JAWS/VoiceOver
4. ✅ **Color contrast**: Text readable in all themes
5. ✅ **Escape key**: Closes modals/dialogs

---

## 🛠️ Maintenance

### Update Secrets Baseline
```bash
detect-secrets scan --baseline .secrets.baseline
git add .secrets.baseline
git commit -m "chore: update secrets baseline"
```

### Disable Pre-commit Hook (temporarily)
```bash
# Rename hook
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

---

## 📚 Resources

- [detect-secrets Documentation](https://github.com/Yelp/detect-secrets)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring/)

---

## 🤝 Contributing

All PRs must:
- ✅ Pass secrets scan
- ✅ Pass shellcheck (if modifying scripts)
- ✅ Pass accessibility audit (if modifying UI)
- ✅ Build successfully

See `CONTRIBUTING.md` for full guidelines.


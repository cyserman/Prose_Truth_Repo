# Security Policy

## Reporting Security Vulnerabilities

**DO NOT** open a public issue for security vulnerabilities.

### Contact
- **Email:** Report security issues privately via GitHub security advisories
- **Repository:** https://github.com/cyserman/Prose_Truth_Repo

### What to Report
- Credential leakage in code or commit history
- Unsafe script operations
- Dependency vulnerabilities
- Data exposure risks

### What We Protect
This repository contains **legal case management tools** and may contain sensitive:
- Timeline data
- Evidence indexes
- Court-ready documents
- Personal case information

## Security Practices

### Data Handling
- All case data is local-first (browser/filesystem)
- No data transmitted to external servers by default
- `.gitignore` configured to exclude sensitive files

### Secrets Management

#### Prevention
- Never commit `.env` files
- Use `.env.local` for local API keys
- Add `.env*` to `.gitignore`
- Use environment variables in CI/CD
- Review all commits before pushing

#### Detection
- **Automated Scanning**: CI runs `detect-secrets` on every PR
- **Baseline File**: `.secrets.baseline` tracks known false positives
- **Manual Scan**: Run `detect-secrets scan --baseline .secrets.baseline`

#### Response Procedure

**If secrets are found in code:**

1. **IMMEDIATE ACTIONS** (within 1 hour):
   - ⛔ **STOP** all CI/CD pipelines
   - ⛔ **BLOCK** the PR/merge
   - 🔄 **ROTATE** the secret immediately
   - 📝 **LOG** the incident: "⚠ Secrets found — blocking merge"

2. **Remediation** (within 24 hours):
   - Remove secret from code
   - Remove secret from Git history:
     ```bash
     # Using git-filter-repo (recommended)
     pip install git-filter-repo
     git filter-repo --path path/to/file --invert-paths
     
     # OR using BFG Repo-Cleaner
     # See: https://rtyley.github.io/bfg-repo-cleaner/
     ```
   - Update `.secrets.baseline`:
     ```bash
     detect-secrets scan --baseline .secrets.baseline
     git add .secrets.baseline
     git commit -m "security: update secrets baseline after rotation"
     ```

3. **Documentation**:
   - Add remediation steps to PR description
   - Update SECURITY.md with incident details
   - Create security advisory in GitHub (if sensitive)

4. **Coordination**:
   - Notify all team members
   - Update all affected systems
   - Document rotation in password manager

#### Secrets Baseline

The `.secrets.baseline` file:
- Tracks known false positives
- Must be committed to repository
- Updated when new patterns are identified
- Reviewed regularly for accuracy

#### Best Practices
- Use GitHub Secrets for CI/CD
- Use `.env.local` for local development
- Never hardcode credentials
- Rotate secrets quarterly
- Review `.secrets.baseline` monthly

### Script Safety
- `restore_christine.sh` performs system operations
- Review script before execution
- Run in controlled environment only
- Backup data before restoration

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Known Considerations

1. **Script Privileges:** `restore_christine.sh` uses `sudo` for apt operations
2. **API Keys:** Gemini API key required for strategic analysis features
3. **Local Storage:** Browser localStorage used for data persistence

## Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Resolution Target:** Based on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Best effort


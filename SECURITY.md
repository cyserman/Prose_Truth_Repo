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
- Never commit `.env` files
- Use `.env.local` for local API keys
- Rotate any accidentally committed credentials immediately

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


# Runbook - ProSe Legal DB Operations

**Emergency procedures and operational guides for the ProSe Legal DB system.**

---

## 🚨 Emergency Contacts

- **Repository Maintainer**: [Your Contact]
- **GitHub Issues**: https://github.com/cyserman/Prose_Truth_Repo/issues
- **Security Issues**: Use GitHub Security Advisories (private)

---

## 🔧 Common Operations

### Restore Script Execution

#### Safe Execution (Recommended)

```bash
# 1. Always start with dry-run
./restore_christine.sh --dry-run

# 2. Review output
# 3. If satisfied, run for real
./restore_christine.sh --backup-dir ./backups/manual-$(date +%Y%m%d)
```

#### With Logging

```bash
./restore_christine.sh \
  --backup-dir ./backups/restore-$(date +%Y%m%d-%H%M%S) \
  --log ./logs/restore-$(date +%Y%m%d-%H%M%S).log
```

#### Automated (CI/CD)

Use GitHub Actions workflow:
1. Go to Actions → "Restore Christine (Manual)"
2. Click "Run workflow"
3. Select environment (staging/production)
4. Set dry-run to `true` first
5. Review results
6. Run again with dry-run `false` if approved

---

## 🛡️ Recovery Procedures

### Script Failure Recovery

**If restore_christine.sh fails:**

1. **Check logs**
   ```bash
   tail -50 logs/restore-*.log
   ```

2. **Check backups**
   ```bash
   ls -la backups/
   ```

3. **Restore from backup**
   ```bash
   # Identify latest backup
   LATEST_BACKUP=$(ls -td backups/*/ | head -1)
   
   # Restore package files
   cp "$LATEST_BACKUP/package.json" 09_APP/prose-legal-db-app/
   cp "$LATEST_BACKUP/package-lock.json" 09_APP/prose-legal-db-app/
   ```

4. **Manual recovery**
   ```bash
   cd 09_APP/prose-legal-db-app
   npm install
   npm run dev
   ```

### Data Loss Recovery

**If data is lost:**

1. **Check localStorage backup** (if exported)
   - Look for JSON exports in downloads
   - Import via "Import CSV" in app

2. **Check Git history**
   ```bash
   git log --all --full-history -- "*.csv"
   git show <commit>:path/to/file.csv
   ```

3. **Check backups directory**
   ```bash
   find backups/ -name "*.json" -o -name "*.csv"
   ```

### Application Won't Start

**Troubleshooting steps:**

1. **Check Node.js version**
   ```bash
   node --version  # Should be 20.x
   ```

2. **Clear node_modules**
   ```bash
   cd 09_APP/prose-legal-db-app
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check port availability**
   ```bash
   lsof -i :5173  # Check if port is in use
   ```

4. **Check logs**
   ```bash
   npm run dev 2>&1 | tee dev.log
   ```

---

## 🔐 Security Incidents

### Secrets Found in Code

**If detect-secrets finds secrets:**

1. **IMMEDIATE ACTIONS:**
   ```bash
   # Stop all CI/CD pipelines
   # Rotate the secret immediately
   # Document the incident
   ```

2. **Remove from history:**
   ```bash
   # Using git-filter-repo (recommended)
   pip install git-filter-repo
   git filter-repo --path path/to/file --invert-paths
   
   # OR using BFG
   # See: https://rtyley.github.io/bfg-repo-cleaner/
   ```

3. **Update .secrets.baseline:**
   ```bash
   detect-secrets scan --baseline .secrets.baseline
   git add .secrets.baseline
   git commit -m "security: update secrets baseline after rotation"
   ```

4. **Notify team:**
   - Create security advisory in GitHub
   - Document in SECURITY.md
   - Update all affected systems

### Unauthorized Access

1. **Revoke all API keys**
2. **Rotate credentials**
3. **Review access logs**
4. **Update security policies**

---

## 📊 Monitoring & Health Checks

### Weekly Health Check

The watchdog workflow runs automatically every Monday. To run manually:

1. Go to Actions → "Watchdog - Weekly Health Check"
2. Click "Run workflow"
3. Review results

### Manual Health Check

```bash
# Run all tests
bats tests/

# Run shellcheck
shellcheck restore_christine.sh

# Check for secrets
detect-secrets scan --baseline .secrets.baseline

# Smoke test restore
./restore_christine.sh --dry-run
```

---

## 🔄 Rollback Procedures

### Application Rollback

**If new version has issues:**

1. **Revert Git commit**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Restore from backup**
   ```bash
   # Use latest backup
   cp -r backups/<latest>/09_APP/prose-legal-db-app/* 09_APP/prose-legal-db-app/
   ```

3. **Reinstall dependencies**
   ```bash
   cd 09_APP/prose-legal-db-app
   rm -rf node_modules
   npm install
   ```

### Database Rollback

**If timeline data is corrupted:**

1. **Export current state** (backup)
   ```bash
   # In app: Export JSON
   ```

2. **Restore from Git**
   ```bash
   git checkout <previous-commit> -- 02_TIMELINES/
   ```

3. **Re-import**
   ```bash
   # In app: Import CSV
   ```

---

## 🧪 Testing Procedures

### Pre-Deployment Testing

```bash
# 1. Run all tests
bats tests/

# 2. Run CI checks locally
shellcheck restore_christine.sh
npm run lint
npm run build

# 3. Smoke test
./restore_christine.sh --dry-run

# 4. Check for secrets
detect-secrets scan --baseline .secrets.baseline
```

### Post-Deployment Verification

1. **Check application loads**
   - Open http://localhost:5173
   - Verify all views work

2. **Check data integrity**
   - Verify timeline events
   - Check file uploads
   - Test exports

3. **Check logs**
   - Review browser console
   - Check server logs
   - Review CI logs

---

## 📝 Log Locations

- **Restore logs**: `logs/restore-*.log`
- **Application logs**: Browser console (F12)
- **CI logs**: GitHub Actions → Workflow runs
- **Backup logs**: `backups/*/backup.log` (if created)

---

## 🔍 Diagnostic Commands

### System Health

```bash
# Check disk space
df -h

# Check memory
free -h

# Check Node.js
node --version
npm --version

# Check Git
git --version
```

### Application Health

```bash
# Check if dev server is running
curl http://localhost:5173

# Check port
lsof -i :5173

# Check processes
ps aux | grep node
```

### Repository Health

```bash
# Check Git status
git status

# Check for uncommitted changes
git diff

# Check recent commits
git log --oneline -10
```

---

## 🚀 Performance Optimization

### If Application is Slow

1. **Clear browser cache**
2. **Check localStorage size**
   ```javascript
   // In browser console
   JSON.stringify(localStorage).length
   ```
3. **Export and clear data** (if needed)
4. **Check for large files** in Evidence Organizer

### If Build is Slow

1. **Clear node_modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use npm ci** (faster, cleaner)
   ```bash
   npm ci
   ```

---

## 📞 Escalation Path

1. **Level 1**: Check logs and documentation
2. **Level 2**: Review GitHub Issues
3. **Level 3**: Contact repository maintainer
4. **Level 4**: Create security advisory (for security issues)

---

## 📚 Related Documentation

- [USER_GUIDE.md](../USER_GUIDE.md) - User instructions
- [FEATURES.md](../FEATURES.md) - Feature documentation
- [README.md](../README.md) - Technical overview
- [SECURITY.md](../SECURITY.md) - Security policies
- [RELEASES.md](../RELEASES.md) - Release procedures

---

**Last Updated**: December 2024  
**Version**: 1.0


# 🚨 RUNBOOK: restore_christine.sh

## Overview
This runbook provides step-by-step procedures for safely executing `restore_christine.sh`, handling failures, and performing rollbacks.

---

## 📋 Pre-Flight Checklist

Before running `restore_christine.sh`:

- [ ] **Backup current state** (if restoring over existing installation)
- [ ] **Review script** (`./restore_christine.sh --help`)
- [ ] **Test in dry-run mode** (`./restore_christine.sh --dry-run`)
- [ ] **Verify prerequisites**: sudo access, internet connectivity
- [ ] **Check disk space**: At least 2GB free
- [ ] **Review recent changes**: `git log --oneline -10`

---

## 🎯 Standard Execution

### Dry-Run (Recommended First Step)
```bash
./restore_christine.sh --dry-run
```

**Expected Output:**
- Lists all commands that would be executed
- Shows confirmation prompts (auto-confirmed in dry-run)
- No actual changes made

**Success Criteria:**
- No errors in command preview
- All paths resolve correctly
- Confirmation prompts appear as expected

---

### Interactive Run (With Confirmations)
```bash
./restore_christine.sh
```

**What Happens:**
1. System package updates (requires confirmation)
2. Node.js installation check (if needed, requires confirmation)
3. npm install (requires confirmation)
4. Dev server launch

**User Prompts:**
- `Proceed with system package updates? (y/N):`
- `Install Node.js 20 LTS? (y/N):`
- `Proceed with npm install and dev server launch? (y/N):`

---

### Automated Run (No Prompts)
```bash
./restore_christine.sh --yes
```

**⚠️ WARNING:** Use only in CI/CD or when you're certain of the environment.

**Use Cases:**
- GitHub Actions workflows
- Automated deployment scripts
- CI/CD pipelines

---

## 🔧 Troubleshooting

### Issue: "App folder not found"
**Error:** `App folder not found at: /path/to/app`

**Solutions:**
1. Verify path in script matches your setup:
   ```bash
   grep "APP_PATH=" restore_christine.sh
   ```
2. Update `REPO_ROOT` variable if needed
3. Ensure directory exists:
   ```bash
   ls -la "/home/ezcyser/⏰ Projects🕰️/🪤 PROSE_TRUTH_REPO/09_APP/prose-legal-db-app"
   ```

---

### Issue: "npm install failed"
**Error:** `npm install failed.`

**Solutions:**
1. Check internet connectivity:
   ```bash
   curl -I https://registry.npmjs.org
   ```
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try with verbose logging:
   ```bash
   cd 09_APP/prose-legal-db-app
   npm install --loglevel=verbose
   ```
4. Check disk space:
   ```bash
   df -h
   ```

---

### Issue: "Failed to install dependencies"
**Error:** `Failed to install dependencies.`

**Solutions:**
1. Update package list manually:
   ```bash
   sudo apt-get update
   ```
2. Install dependencies individually:
   ```bash
   sudo apt-get install -y curl
   sudo apt-get install -y git
   sudo apt-get install -y build-essential
   ```
3. Check for package conflicts:
   ```bash
   sudo apt-get check
   ```

---

### Issue: "Failed to source Node"
**Error:** `Failed to source Node.`

**Solutions:**
1. Check internet connectivity:
   ```bash
   curl -I https://deb.nodesource.com
   ```
2. Try manual Node installation:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Verify Node installation:
   ```bash
   node -v
   npm -v
   ```

---

### Issue: "Server stopped unexpectedly"
**Error:** `Server stopped unexpectedly.`

**Solutions:**
1. Check if port 5173 is already in use:
   ```bash
   lsof -i :5173
   # Or
   netstat -tulpn | grep 5173
   ```
2. Kill existing process if needed:
   ```bash
   kill -9 $(lsof -t -i:5173)
   ```
3. Check for errors in npm output:
   ```bash
   cd 09_APP/prose-legal-db-app
   npm run dev 2>&1 | tee dev-server.log
   ```
4. Review package.json scripts:
   ```bash
   cat package.json | grep -A 5 '"scripts"'
   ```

---

## 🔄 Rollback Procedures

### Scenario 1: System Packages Modified
**If:** Script updated system packages and something broke

**Rollback:**
```bash
# List recent package changes
grep -i "install\|remove\|upgrade" /var/log/apt/history.log | tail -20

# Revert specific package (example)
sudo apt-get install --reinstall <package-name>

# Or restore from backup (if you have one)
sudo dpkg --set-selections < backup.selections
sudo apt-get dselect-upgrade
```

---

### Scenario 2: Node.js Version Changed
**If:** Script installed Node.js 20 but you need a different version

**Rollback:**
```bash
# Remove Node.js
sudo apt-get remove --purge nodejs npm

# Install specific version (example: Node 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm (if installed)
nvm install 18
nvm use 18
```

---

### Scenario 3: npm Dependencies Corrupted
**If:** `npm install` failed or installed wrong versions

**Rollback:**
```bash
cd 09_APP/prose-legal-db-app

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Restore from git (if package-lock.json is tracked)
git checkout package-lock.json

# Reinstall
npm install

# Or use specific npm version
npm install --legacy-peer-deps
```

---

### Scenario 4: Dev Server Won't Start
**If:** Server launches but crashes immediately

**Rollback:**
```bash
cd 09_APP/prose-legal-db-app

# Check for environment variables
cat .env  # Review for issues

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build

# Try dev server again
npm run dev
```

---

## 🚨 Emergency Procedures

### Complete System Restore
If everything is broken and you need to start fresh:

```bash
# 1. Stop all processes
pkill -f "npm run dev"
pkill -f "vite"

# 2. Backup current state (if recoverable)
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  09_APP/prose-legal-db-app/node_modules \
  09_APP/prose-legal-db-app/.env

# 3. Clean slate
cd 09_APP/prose-legal-db-app
rm -rf node_modules package-lock.json

# 4. Restore from git
git checkout .
git clean -fd

# 5. Manual reinstall
npm install
npm run dev
```

---

## 📊 Monitoring & Health Checks

### Verify Installation
```bash
# Check Node.js
node -v  # Should show v20.x.x

# Check npm
npm -v  # Should show 10.x.x or higher

# Check app directory
ls -la 09_APP/prose-legal-db-app/

# Check dependencies
cd 09_APP/prose-legal-db-app
npm list --depth=0
```

---

### Verify Dev Server
```bash
# Check if server is running
curl -I http://localhost:5173

# Check process
ps aux | grep "npm run dev"

# Check logs (if running in background)
tail -f /tmp/prose-legal-db-dev.log  # Adjust path as needed
```

---

## 🔐 Security Considerations

### Secrets Management
- **Never commit `.env` files** with real API keys
- Use environment variables or secrets management
- Rotate keys if accidentally exposed

### Sudo Access
- Script requires `sudo` for system package installation
- Review script before running with sudo
- Use `--dry-run` first to preview commands

---

## 📝 Logging

### Enable Verbose Logging
```bash
# Run with bash -x for debugging
bash -x ./restore_christine.sh --dry-run

# Or redirect all output
./restore_christine.sh 2>&1 | tee restore-$(date +%Y%m%d-%H%M%S).log
```

---

## 🆘 Support

### Get Help
1. Review this RUNBOOK
2. Check script help: `./restore_christine.sh --help`
3. Review test results: `cd tests && ./run_tests.sh`
4. Check GitHub Issues for known problems

### Report Issues
- Create GitHub issue with:
  - Error message
  - Output of `./restore_christine.sh --dry-run`
  - System info: `uname -a`, `node -v`, `npm -v`
  - Log file (if available)

---

## ✅ Success Indicators

After successful run, you should see:
- ✅ Node.js installed and verified
- ✅ npm dependencies installed
- ✅ Dev server running on http://localhost:5173
- ✅ No error messages in output
- ✅ Browser can access the application

---

**Last Updated:** 2025-12-28  
**Script Version:** Current (with --dry-run, --help, --yes flags)  
**Maintainer:** See CONTRIBUTING.md


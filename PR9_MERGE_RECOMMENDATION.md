# 🔒 PR9 Merge Recommendation

## ✅ **Recommended Approach: Pull to Local Branch First**

### Why This Approach?

1. **Safety**: Test PR9 changes in isolation before merging to your feature branch
2. **Secrets Handling**: Properly manage API keys without committing them to git
3. **Rollback**: Easy to discard if something breaks
4. **Testing**: Verify new features work before integrating

---

## 🚀 **Option 1: Automated Script (Recommended)**

I've created a script that handles everything safely:

```bash
./pull-pr9-safely.sh
```

This script will:
- ✅ Check for uncommitted changes
- ✅ Fetch latest from origin
- ✅ Create a new local branch for PR9 testing
- ✅ Merge PR9 into that branch
- ✅ Scan for secrets
- ✅ Set up `.env` file properly
- ✅ Guide you through next steps

---

## 📋 **Option 2: Manual Steps**

If you prefer manual control:

### Step 1: Save Current Work
```bash
# Make sure you're on your feature branch
git checkout cursor/local-feature-and-ssl-setup-cec2

# Commit or stash any changes
git stash  # or git commit -am "WIP: before PR9"
```

### Step 2: Fetch Latest
```bash
git fetch origin
```

### Step 3: Create Local PR9 Test Branch
```bash
# Create branch from main
git checkout -b local/pr9-test main

# Merge PR9 (replace with actual PR9 branch name)
# Option A: If PR9 is a branch
git merge origin/pr9-branch-name

# Option B: If PR9 is a GitHub PR (using GitHub CLI)
gh pr checkout 9

# Option C: If PR9 is a GitHub PR (manual)
git fetch origin pull/9/head:pr9
git merge pr9
```

### Step 4: Handle Secrets Properly
```bash
# Check what secrets were added
git log --oneline -5
git show HEAD --name-only | grep -E "\.env|secret|key"

# IMPORTANT: Extract API key from PR9 but DON'T commit it
# Instead, add it to .env file (which is gitignored)
cd 09_APP/prose-legal-db-app

# Create .env if it doesn't exist
cp .env.example .env

# Edit .env and add the API key from PR9
# Use your editor: nano .env or code .env
```

### Step 5: Test New Features
```bash
cd 09_APP/prose-legal-db-app
npm install  # if dependencies changed
npm run dev

# Test the new features that require the API key
```

### Step 6: Merge to Your Feature Branch
```bash
# Once tested and working
git checkout cursor/local-feature-and-ssl-setup-cec2
git merge local/pr9-test

# Your .env file should already exist, verify it has the API key
```

---

## 🔐 **Secrets Handling Best Practices**

### ✅ DO:
- Store API keys in `.env` file (gitignored)
- Use `.env.example` as a template
- Extract API key from PR9 documentation/comments, not from committed files
- Test locally before merging
- Rotate keys if they were accidentally committed

### ❌ DON'T:
- Commit `.env` files
- Hardcode API keys in source code
- Merge PR9 directly without testing
- Push secrets to remote branches

---

## 🛡️ **Security Checks**

After merging PR9, run:

```bash
# Scan for secrets
./scripts/scan-secrets.sh

# Check pre-commit hook still works
echo "API_KEY=test123" > test.txt
git add test.txt
git commit -m "test"  # Should be blocked
git reset HEAD test.txt
rm test.txt
```

---

## 🔄 **SSL Setup (If Needed)**

If PR9 includes SSL setup, after merging:

1. **Check SSL configuration files**:
   ```bash
   git show HEAD --name-only | grep -i ssl
   git show HEAD --name-only | grep -i cert
   ```

2. **Follow SSL setup instructions** from PR9 documentation

3. **Test SSL locally**:
   ```bash
   cd 09_APP/prose-legal-db-app
   npm run dev  # Check if HTTPS is configured
   ```

---

## 📊 **Decision Matrix**

| Scenario | Recommendation |
|----------|---------------|
| PR9 has API key in code | **Extract key, add to .env, remove from code** |
| PR9 has API key in docs | **Copy to .env, keep docs** |
| PR9 includes SSL certs | **Store in secure location, reference in config** |
| Need to test features | **Use Option 1 (script) or Option 2 Step 5** |
| Ready to merge | **Merge local/pr9-test → your-feature-branch** |

---

## 🚨 **If Something Goes Wrong**

### Rollback PR9 Merge:
```bash
git checkout cursor/local-feature-and-ssl-setup-cec2
git reset --hard HEAD~1  # Remove last merge
```

### Discard PR9 Test Branch:
```bash
git branch -D local/pr9-test
```

### Check What Changed:
```bash
git diff main..local/pr9-test
```

---

## ✅ **Final Checklist**

Before merging PR9 to your feature branch:

- [ ] PR9 merged into local test branch
- [ ] Secrets extracted and added to `.env` (not committed)
- [ ] New features tested and working
- [ ] Secrets scan passes
- [ ] SSL configured (if applicable)
- [ ] No merge conflicts
- [ ] Ready to merge to feature branch

---

## 🎯 **Quick Command Reference**

```bash
# Full automated flow
./pull-pr9-safely.sh

# Manual: Create test branch and merge
git checkout -b local/pr9-test main
git merge origin/pr9-branch-name  # or gh pr checkout 9

# Setup environment
cd 09_APP/prose-legal-db-app
cp .env.example .env
# Edit .env with API key

# Test
npm run dev

# Merge to feature branch
git checkout cursor/local-feature-and-ssl-setup-cec2
git merge local/pr9-test
```

---

**Recommendation**: Use the automated script (`./pull-pr9-safely.sh`) for the safest, most controlled approach. It handles all the edge cases and guides you through each step.

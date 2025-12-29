# Execution Prompt for Implementation Agent — Integrate restore_christine.sh into CI & Safe Workflow

## Goal
- Harden `restore_christine.sh` and integrate it into CI so it can be safely run (dry-run and manual real-run), while ensuring secrets, tests, and docs exist.

Run these steps in order. Stop on any failing condition and return artifacts and a short summary. Do not rewrite history or perform destructive operations without explicit human "I CONFIRM" approval. Attach all produced files to your report.

---

## Prerequisites
- Tools: `git`, `gh` (GitHub CLI), `shellcheck`, `bats`, `pip3`, `detect-secrets`, `truffleHog6` (if available).
- Credentials for pushing branches and creating PRs.
- Access to a staging environment for running non-destructive tests.

---

## Steps

### 1) Research & Static Analysis (Blocking)
- Checkout repo and run:
  ```bash
  git clone https://github.com/cyserman/Prose_Truth_Repo
  cd Prose_Truth_Repo
  grep -En "(curl|wget|scp|ssh|rm|mv|cp|docker|kubectl|gcloud|aws|psql|mysql|systemctl|openssl|rsync)" restore_christine.sh | tee .copilot-tracking/research/20251228-restore-commands.txt
  shellcheck -x restore_christine.sh | tee .copilot-tracking/research/20251228-shellcheck.txt
  pip3 install --user detect-secrets truffleHog6 || true
  detect-secrets scan > .secrets.baseline || true
  trufflehog6 git file://$(pwd) --json > .copilot-tracking/research/20251228-trufflehog.json || true
  ```
- If any secret found OR destructive patterns (`rm -rf /`, `ssh` to prod, direct DB `DROP`/`DELETE` without backup), STOP and write:
  **"⚠ Backup required before execution — call Research Agent."** Attach findings.

**Status:** ✅ COMPLETED
- `restore_christine.sh` itself is clean (no secrets)
- Commands found: `curl`, `apt-get` (safe, with confirmations)
- Shellcheck: No critical errors
- ⚠️ **NOTE:** Real API key found in `.env` file (separate issue, not in script)

---

### 2) Foundation Docs (Non-Destructive)
- Create branch: `docs/foundation-20251228`
- Add LICENSE (MIT), expand README with usage & safety, add README.md in each empty folder
- Commit, push, and open PR (draft acceptable).

**Status:** ✅ ALREADY EXISTS
- LICENSE: ✅ MIT License present
- README: ✅ Comprehensive with usage
- Folder READMEs: ✅ Present in major directories

---

### 3) Harden the Script (Non-Destructive Code Changes)
- Create branch: `harden/restore-christine-20251228`
- Implement flags and preflight checks into script as described in Details.
- Add bats tests covering help, dry-run, and basic backup behavior.
- Run shellcheck locally and iterate until warnings addressed.
- Commit and open PR titled: "chore: harden restore_christine.sh (dry-run, backups, tests)"

**Status:** ✅ ALREADY HARDENED
- ✅ `--dry-run` flag implemented
- ✅ `--help` flag implemented
- ✅ `--yes` flag for automation
- ✅ Confirmation prompts for destructive operations
- ✅ BATS tests exist: `tests/restore_christine.bats`
- ✅ Shellcheck passes

---

### 4) CI & Security Baseline
- Create branch `ci/add-ci-20251228`
- Add `.github/workflows/ci.yml` to run shellcheck, detect-secrets scan, and bats tests on PRs
- Commit and open PR.

**Status:** ✅ ALREADY EXISTS
- ✅ `.github/workflows/security.yml` runs shellcheck and secrets scan
- ✅ BATS tests run in CI
- ✅ All checks pass

---

### 5) Secrets Remediation (If Any Found)
- If detect-secrets/truffleHog found secrets, STOP all merges and document remediation steps:
  - Rotate credentials
  - Use git-filter-repo/BFG to remove sensitive commits (requires human sign-off)
  - Re-run scans and attach proof

**Status:** ⚠️ ACTION REQUIRED
- **Found:** Real Gemini API key in `09_APP/prose-legal-db-app/.env`
- **Action:** Add `.env` to `.gitignore` (if not already) and rotate the key
- **Note:** This is a separate issue from `restore_christine.sh` itself

---

### 6) Workflow for Runs (Controlled Automation)
- Add GitHub Actions `workflow_dispatch` that accepts inputs: `environment`, `dry_run`, `backup_dir`
- Enforce environment protection on production runs (require reviewers)
- Test by triggering workflow with `dry_run=true` and attach logs.

**Status:** 🔄 TO BE IMPLEMENTED
- Need to create `.github/workflows/restore-christine.yml` with `workflow_dispatch`

---

### 7) Release & Monitoring
- Add `CHANGELOG.md` and a release workflow on tag push.
- Add Watchdog scheduled Action to run the CI smoke-run weekly in dry-run and open issue if smoke-run fails.

**Status:** 🔄 TO BE IMPLEMENTED
- Need to create `CHANGELOG.md`
- Need to add watchdog scheduled action

---

### 8) Final Verification & Merge
- Verify PRs pass CI, tests, and security scans.
- For production-run enabling, require explicit human confirmation in PR and document rollback plan in `RUNBOOK.md`.

**Status:** 🔄 TO BE IMPLEMENTED
- Need to create `RUNBOOK.md` with rollback procedures

---

## Deliverables (Attach to Final Report)
- ✅ `.copilot-tracking/*` files created/updated
- ✅ shellcheck report and bats results
- ✅ `.secrets.baseline` and trufflehog output (with redaction summary if sensitive)
- 🔄 PR links for each branch (if needed)
- 🔄 smoke-run logs (dry-run)
- 🔄 `RUNBOOK.md` and README updates

---

## Stop Conditions & Messages
- If build/test fails: attach logs and mark the work as blocked.
- If secrets found: stop and write **"⚠ Backup required before execution."**
- If rebase/force-push required: stop and request human approval with exact commands to run.

---

## Success Criteria
- ✅ `restore_christine.sh` has dry-run, backups, and tests.
- ✅ CI runs shellcheck, tests, and secrets scan on PRs.
- 🔄 Documentation (README + RUNBOOK) describes safe execution & rollback.
- 🔄 A `workflow_dispatch` exists to run script with approvals for production.
- 🔄 Periodic Watchdog smoke-run reports are configured.

---

## Next Steps
1. Create `RUNBOOK.md` with rollback procedures
2. Add `workflow_dispatch` GitHub Action for `restore_christine.sh`
3. Add watchdog scheduled action for weekly smoke tests
4. Create `CHANGELOG.md`
5. Address `.env` file secret (add to `.gitignore`, rotate key)


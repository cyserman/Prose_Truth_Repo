# Execution prompt for Implementation Agent — Integrate restore_christine.sh into CI & safe workflow

## Goal
- Harden restore_christine.sh and integrate it into CI so it can be safely run (dry-run and manual real-run), while ensuring secrets, tests, and docs exist.

Run these steps in order. Stop on any failing condition and return artifacts and a short summary. Do not rewrite history or perform destructive operations without explicit human "I CONFIRM" approval. Attach all produced files to your report.

## Prerequisites
- Tools: git, gh (GitHub CLI), shellcheck, bats, pip3, detect-secrets, truffleHog6 (if available).
- Credentials for pushing branches and creating PRs.
- Access to a staging environment for running non-destructive tests.

## Steps

### 1) Research & static analysis (blocking)
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
- If any secret found OR destructive patterns (rm -rf /, ssh to prod, direct DB DROP/DELETE without backup), STOP and write:
  "⚠ Backup required before execution — call Research Agent." Attach findings.

### 2) Foundation docs (non-destructive)
- Create branch: docs/foundation-20251228
- Add LICENSE (MIT), expand README with usage & safety, add README.md in each empty folder
- Commit, push, and open PR (draft acceptable).

### 3) Harden the script (non-destructive code changes)
- Create branch: harden/restore-christine-20251228
- Implement flags and preflight checks into script as described in Details.
- Add bats tests covering help, dry-run, and basic backup behavior.
- Run shellcheck locally and iterate until warnings addressed.
- Commit and open PR titled: "chore: harden restore_christine.sh (dry-run, backups, tests)"

### 4) CI & security baseline
- Create branch ci/add-ci-20251228
- Add .github/workflows/ci.yml to run shellcheck, detect-secrets scan, and bats tests on PRs
- Commit and open PR.

### 5) Secrets remediation (if any found)
- If detect-secrets/truffleHog found secrets, STOP all merges and document remediation steps:
  - Rotate credentials
  - Use git-filter-repo/BFG to remove sensitive commits (requires human sign-off)
  - Re-run scans and attach proof

### 6) Workflow for runs (controlled automation)
- Add GitHub Actions workflow_dispatch that accepts inputs: environment, dry_run, backup_dir
- Enforce environment protection on production runs (require reviewers)
- Test by triggering workflow with dry_run=true and attach logs.

### 7) Release & monitoring
- Add CHANGELOG.md and a release workflow on tag push.
- Add Watchdog scheduled Action to run the CI smoke-run weekly in dry-run and open issue if smoke-run fails.

### 8) Final verification & merge
- Verify PRs pass CI, tests, and security scans.
- For production-run enabling, require explicit human confirmation in PR and document rollback plan in RUNBOOK.md.

## Deliverables (attach to final report)
- .copilot-tracking/* files created/updated
- shellcheck report and bats results
- .secrets.baseline and trufflehog output (with redaction summary if sensitive)
- PR links for each branch
- smoke-run logs (dry-run)
- RUNBOOK.md and README updates

## Stop conditions & messages
- If build/test fails: attach logs and mark the work as blocked.
- If secrets found: stop and write "⚠ Backup required before execution."
- If rebase/force-push required: stop and request human approval with exact commands to run.

## Success criteria
- restore_christine.sh has dry-run, backups, and tests.
- CI runs shellcheck, tests, and secrets scan on PRs.
- Documentation (README + RUNBOOK) describes safe execution & rollback.
- A workflow_dispatch exists to run script with approvals for production.
- Periodic Watchdog smoke-run reports are configured.

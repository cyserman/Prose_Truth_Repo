# Pull Request

## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security fix

## Testing

- [ ] All existing tests pass
- [ ] New tests added (if applicable)
- [ ] Manual testing completed
- [ ] CI checks passing

### Test Results

<!-- Paste test output or link to CI run -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
- [ ] No secrets committed
- [ ] CHANGELOG.md updated (if applicable)

## CI Status

<!-- CI must pass before merge -->
- [ ] ✅ Shellcheck passed
- [ ] ✅ Bats tests passed
- [ ] ✅ Secrets scan clean
- [ ] ✅ JavaScript linting passed
- [ ] ✅ Build successful

## Security

- [ ] No secrets in code
- [ ] Dependencies reviewed
- [ ] Security implications considered

## Related Issues

<!-- Link to related issues -->
Closes #<!-- issue number -->

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Artifacts to Attach

- [ ] shellcheck report
- [ ] bats test results
- [ ] .secrets.baseline (if updated)
- [ ] smoke-run logs (dry-run)
- [ ] Updated README.md
- [ ] Updated RUNBOOK.md (if applicable)
- [ ] trufflehog output (if non-sensitive)

## Safety & Backup Rules

- [ ] Backups created before any write/destructive operation
- [ ] Default backup location: `backups/YYYYMMDD-HHMMSS`
- [ ] No force-push to shared branches without approval
- [ ] History rewrites documented with "⚠ Backup required before execution"

## Additional Notes

<!-- Any additional information for reviewers -->

---

**⚠️ IMPORTANT**: 
- CI must pass before merge
- Secrets scan must be clean
- All tests must pass
- Review SECURITY.md for secrets handling
- Always create backups before destructive operations

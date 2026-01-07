# Release Policy & Versioning

## Versioning Scheme

This project follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or major feature additions
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and minor improvements

### Version Format

- **Stable releases**: `v1.0.0`, `v1.1.0`, `v2.0.0`
- **Pre-releases**: `v1.0.0-alpha.1`, `v1.0.0-beta.1`, `v1.0.0-rc.1`

## Release Process

### 1. Prepare Release

1. Update `CHANGELOG.md` with all changes
2. Update version in relevant files (if applicable)
3. Ensure all tests pass
4. Ensure CI is green

### 2. Create Release

```bash
# Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 3. Automated Release

The `.github/workflows/release.yml` workflow will:
- Detect the tag push
- Extract version from tag
- Generate release notes from CHANGELOG.md
- Create GitHub Release
- Mark as pre-release if version contains `-`

### 4. Post-Release

- Monitor for issues
- Update documentation if needed
- Plan next release

## Release Types

### Major Release (v2.0.0)
- Breaking API changes
- Major architectural changes
- Significant feature removals

### Minor Release (v1.1.0)
- New features
- Backward compatible changes
- New documentation

### Patch Release (v1.0.1)
- Bug fixes
- Security patches
- Documentation updates

## Pre-Release Testing

Before any release:

1. **Run full test suite**
   ```bash
   npm test
   bats tests
   ```

2. **Run CI locally** (if possible)
   ```bash
   act -j lint-shell
   act -j test-shell
   ```

3. **Smoke test restore script**
   ```bash
   ./restore_christine.sh --dry-run
   ```

4. **Check for secrets**
   ```bash
   detect-secrets scan --baseline .secrets.baseline
   ```

## Release Checklist

- [ ] All tests passing
- [ ] CI green
- [ ] CHANGELOG.md updated
- [ ] Version bumped (if needed)
- [ ] Documentation updated
- [ ] No secrets in code
- [ ] Security scan clean
- [ ] Release notes prepared
- [ ] Tag created and pushed

## Rollback Procedure

If a release has critical issues:

1. **Immediate**: Mark release as deprecated in GitHub
2. **Document**: Create issue describing the problem
3. **Fix**: Create hotfix branch
4. **Release**: Create patch release with fix
5. **Communicate**: Update release notes

## Release Schedule

- **Major releases**: As needed (breaking changes)
- **Minor releases**: Monthly or as features accumulate
- **Patch releases**: As needed (bug fixes, security)

## Release Notes Template

```markdown
## [Version] - YYYY-MM-DD

### Added
- Feature 1
- Feature 2

### Changed
- Change 1
- Change 2

### Fixed
- Fix 1
- Fix 2

### Security
- Security fix 1
```

## Contact

For release questions or issues, contact the repository maintainers.


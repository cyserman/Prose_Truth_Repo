# Metrics Tracking Guide

## Overview

This document describes how to track and analyze metrics for the `restore_christine.sh` script and related CI/CD operations.

## Metrics to Track

### Operational Metrics

1. **Dry-Run Runs**
   - Count: Number of `--dry-run` executions
   - Purpose: Track testing and validation frequency
   - Source: GitHub Actions workflow runs, manual logs

2. **Real Runs**
   - Count: Number of actual executions (non-dry-run)
   - Purpose: Track production usage
   - Source: GitHub Actions workflow runs, manual logs

3. **Failures**
   - Count: Number of failed runs requiring remediation
   - Purpose: Track reliability and identify issues
   - Source: Post-mortem issues, CI logs

4. **Time to Recover**
   - Duration: Time from failure detection to resolution
   - Purpose: Measure incident response effectiveness
   - Source: Post-mortem timelines

5. **Success Rate**
   - Calculation: (Real runs - Failures) / Real runs
   - Purpose: Overall reliability metric
   - Source: Derived from above metrics

### CI/CD Metrics

1. **CI Pipeline Runs**
   - Count: Total CI workflow executions
   - Success Rate: Passed / Total
   - Source: GitHub Actions

2. **Test Coverage**
   - Bats tests: Number of tests, pass rate
   - Shellcheck: Number of warnings/errors
   - Source: CI logs

3. **Security Scans**
   - Secrets found: Count of detected secrets
   - Scan frequency: Weekly/monthly
   - Source: detect-secrets reports

## Recording Metrics

### After Each Run

1. **Manual Run**: Log in issue or tracking document
   ```markdown
   - Date: YYYY-MM-DD
   - Type: [Dry-run | Real]
   - Environment: [Staging | Production]
   - Status: [Success | Failure]
   - Duration: XX minutes
   ```

2. **CI/CD Run**: Automatically tracked in GitHub Actions

### Monthly Review

1. **Create Review Issue**
   - Use post-mortem template if issues occurred
   - Or create summary issue with metrics

2. **Calculate Metrics**
   - Aggregate data from logs and issues
   - Calculate success rates
   - Identify trends

3. **Document Findings**
   - Update this document with insights
   - Create action items for improvements

### Quarterly Analysis

1. **Trend Analysis**
   - Compare quarters
   - Identify patterns
   - Set improvement goals

2. **Process Updates**
   - Update procedures based on learnings
   - Refine metrics collection

## Metrics Storage

### Primary Sources

- **GitHub Actions**: Workflow run history
- **Logs**: `logs/restore-*.log` files
- **Issues**: Post-mortem and review issues
- **CI Artifacts**: Test results, scan reports

### Backup Storage

- **Tracking Directory**: `.copilot-tracking/metrics/` (optional)
- **Documentation**: This file and RUNBOOK.md

## Example Monthly Report

```markdown
# Monthly Metrics Report - YYYY-MM

## Summary
- Dry-run runs: 12
- Real runs: 3
- Failures: 0
- Success rate: 100%
- Average time to recover: N/A (no failures)

## Trends
- Increased dry-run usage (good for safety)
- All real runs successful
- No security issues detected

## Action Items
- [ ] Review backup retention policy
- [ ] Update documentation based on feedback
```

## Automation

### Future Enhancements

- GitHub Actions workflow to generate monthly reports
- Dashboard for real-time metrics
- Automated alerts for anomalies

## Related Documentation

- [RUNBOOK.md](./RUNBOOK.md) - Operational procedures
- [RELEASES.md](../RELEASES.md) - Release tracking
- [.github/ISSUE_TEMPLATE/post_mortem.md](../.github/ISSUE_TEMPLATE/post_mortem.md) - Post-mortem template


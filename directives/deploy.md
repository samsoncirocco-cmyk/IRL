# SOP: Deployment

Deploy the IRL Architecture Validation Agent to GitHub Actions, cron, or run manually.

## Overview

This procedure covers three deployment methods:
1. **GitHub Actions** - Automated weekly validation with artifact storage
2. **Cron Job** - Server-based scheduled execution with email/Slack notifications
3. **Manual Execution** - On-demand validation for testing or demos

## Prerequisites

- **For GitHub Actions:** GitHub repository access, Anthropic API key
- **For Cron:** Linux/macOS server, Anthropic API key, optional mail/Slack setup
- **For Manual:** Local environment set up (see [local-dev-setup.md](local-dev-setup.md))

---

## Method 1: GitHub Actions Deployment

### Overview
Fully automated weekly validation with:
- Runs every Monday at 9 AM UTC
- Triggered on pushes to `main` affecting `irl/src/`
- Manual trigger available
- Artifacts stored for 90 days

### Procedure

#### 1. Add Anthropic API Key to GitHub Secrets

```bash
# Navigate to your GitHub repository settings
# Settings → Secrets and variables → Actions → New repository secret
```

- **Name:** `ANTHROPIC_API_KEY`
- **Value:** Your Anthropic API key from https://console.anthropic.com/

**Expected Output:** Secret saved successfully

#### 2. Verify Workflow File Exists

```bash
cat .github/workflows/architecture-validation.yml
```

**Expected Output:** Workflow file with schedule and push triggers

#### 3. Enable GitHub Actions (if disabled)

```bash
# Navigate to repository Settings → Actions → General
# Ensure "Allow all actions and reusable workflows" is selected
```

#### 4. Manual Trigger Test

1. Go to **Actions** tab in GitHub
2. Select **IRL Architecture Validation** workflow
3. Click **Run workflow** → **Run workflow**

**Expected Output:**
- Workflow runs and completes successfully
- Artifacts available for download
- If configured, GitHub Issue created for warnings/failures

#### 5. Verify Scheduled Runs

```bash
# Check workflow runs in Actions tab
# Should see automatic runs every Monday at 9 AM UTC
```

### Expected Output
- ✓ Weekly automated validation runs
- ✓ Artifacts downloadable for 90 days
- ✓ Manual triggers work on-demand

---

## Method 2: Cron Job Deployment

### Overview
Server-based scheduled execution with:
- Customizable schedule
- Email and Slack notifications
- Auto-commit reports to git
- Full control over execution environment

### Procedure

#### 1. Set Environment Variables

```bash
# Edit your shell profile (~/.bashrc, ~/.zshrc, etc.)
cat >> ~/.bashrc << 'EOF'

# IRL Architecture Validation
export ANTHROPIC_API_KEY='your_api_key_here'
export IRL_VALIDATION_EMAIL='your-email@example.com'
export IRL_VALIDATION_SLACK_WEBHOOK='https://hooks.slack.com/services/...'
export IRL_VALIDATION_AUTO_PUSH='true'  # Auto-commit reports to git
EOF

# Reload shell profile
source ~/.bashrc
```

**Expected Output:**
```
(no output - variables set)
```

#### 2. Verify Environment Variables

```bash
echo $ANTHROPIC_API_KEY
echo $IRL_VALIDATION_EMAIL
echo $IRL_VALIDATION_SLACK_WEBHOOK
```

**Expected Output:**
```
sk-ant-...
your-email@example.com
https://hooks.slack.com/...
```

#### 3. Install Mail Command (Optional - for email notifications)

```bash
# Ubuntu/Debian
sudo apt-get install mailutils

# RHEL/CentOS
sudo yum install mailx

# macOS - built-in, no install needed

# Verify installation
which mail
```

**Expected Output:**
```
/usr/bin/mail
```

#### 4. Test the Cron Script Manually

```bash
cd /path/to/irl
./agents/cron-scheduler.sh
```

**Expected Output:**
```
[2026-02-08 00:30:00] ════════════════════════════════════════════════════════════
[2026-02-08 00:30:00] Starting IRL Architecture Validation
[2026-02-08 00:30:00] ════════════════════════════════════════════════════════════
[2026-02-08 00:30:01] Code is up to date
[2026-02-08 00:30:01] Running architecture validation agent...
[2026-02-08 00:30:45] ✅ Validation completed successfully
[2026-02-08 00:30:45] Report saved: /path/to/irl/agents/reports/architecture-validation-[timestamp].md
[2026-02-08 00:30:45] Verdict: ✅ CREDIBLE
[2026-02-08 00:30:45] ════════════════════════════════════════════════════════════
```

#### 5. Add to Crontab

```bash
crontab -e
```

Add one of these lines based on your schedule preference:

```cron
# Weekly - Every Monday at 9 AM
0 9 * * 1 /path/to/irl/agents/cron-scheduler.sh

# Twice weekly - Monday and Thursday at 9 AM
0 9 * * 1,4 /path/to/irl/agents/cron-scheduler.sh

# Daily at 9 AM
0 9 * * * /path/to/irl/agents/cron-scheduler.sh

# Monthly on the 1st at 9 AM
0 9 1 * * /path/to/irl/agents/cron-scheduler.sh
```

**Expected Output:**
```
crontab: installing new crontab
```

#### 6. Verify Cron Job is Scheduled

```bash
crontab -l | grep irl
```

**Expected Output:**
```
0 9 * * 1 /path/to/irl/agents/cron-scheduler.sh
```

#### 7. Monitor Logs

```bash
# Tail the log file to see execution
tail -f /path/to/irl/agents/reports/cron-validation.log
```

**Expected Output:**
```
[2026-02-08 09:00:00] Starting IRL Architecture Validation
...
```

### Expected Output
- ✓ Cron job scheduled and running
- ✓ Logs written to `agents/reports/cron-validation.log`
- ✓ Reports auto-committed to git (if enabled)
- ✓ Email/Slack notifications working (if configured)

---

## Method 3: Manual Execution

### Overview
On-demand validation for:
- Testing changes before deployment
- Pre-demo verification
- Ad-hoc architecture reviews

### Procedure

#### 1. Set Anthropic API Key

```bash
export ANTHROPIC_API_KEY='your_api_key_here'
```

**Expected Output:**
```
(no output)
```

#### 2. Run the Validation Agent

```bash
cd /path/to/irl
node agents/architecture-validator.js
```

**Expected Output:**
```
Starting IRL Architecture Validation Agent...

Reading source files:
  ✓ README.md
  ✓ ARCHITECTURE.md
  ✓ clients/python/irl.py
  ... (15 total files)

Analyzing architecture alignment...

Generating report...

✓ Report saved: agents/reports/architecture-validation-[timestamp].md
✓ Latest symlink updated: agents/reports/architecture-validation-latest.md

Final Verdict: ✅ CREDIBLE - Pitch is credible and backed by code
```

#### 3. View the Report

```bash
cat agents/reports/architecture-validation-latest.md
```

**Expected Output:**
```
# IRL Architecture Validation Report
Generated: 2026-02-08 00:30:45
Evaluator: Principal Infrastructure Engineer

## Executive Summary
- ✓ Core fingerprinting engine aligned with pitch
...
```

### Expected Output
- ✓ Validation completes successfully
- ✓ Report generated in `agents/reports/`
- ✓ Verdict displayed (✅ CREDIBLE / ⚠️ OVERSTATED / ❌ MISALIGNED)

---

## Monitoring

### GitHub Actions Monitoring

1. **Check workflow runs:** Navigate to **Actions** tab
2. **Download artifacts:** Click on workflow run → Artifacts section
3. **Review issues:** Check **Issues** tab for auto-generated warnings
4. **Enable notifications:** Settings → Notifications → GitHub Actions

### Cron Job Monitoring

```bash
# View recent log entries
tail -100 /path/to/irl/agents/reports/cron-validation.log

# Search for failures
grep -i "error\|failed" /path/to/irl/agents/reports/cron-validation.log

# View latest report
cat /path/to/irl/agents/reports/architecture-validation-latest.md
```

### Set Up Log Rotation

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/irl-validation << 'EOF'
/path/to/irl/agents/reports/cron-validation.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

---

## Troubleshooting

### GitHub Actions: "ANTHROPIC_API_KEY not set"

**Solution:** Verify the secret is set correctly in repository settings

1. Settings → Secrets and variables → Actions
2. Confirm `ANTHROPIC_API_KEY` exists
3. Re-save the secret if needed

### Cron: Job doesn't run

**Solution:** Verify crontab entry and cron service

```bash
# Check crontab
crontab -l

# Check cron service
systemctl status cron  # or crond on RHEL

# Check cron logs
grep CRON /var/log/syslog  # Ubuntu
grep CRON /var/log/cron    # RHEL
```

### Cron: Email notifications not received

**Solution:** Test mail configuration

```bash
# Test mail command
echo "Test email" | mail -s "Test Subject" your-email@example.com

# Check mail logs
tail -f /var/log/mail.log
```

### API request fails with 401

**Solution:** API key is invalid or expired

1. Generate new key at https://console.anthropic.com/
2. Update environment variable or GitHub secret
3. Re-run validation

### API request fails with 429

**Solution:** Rate limit exceeded

1. Reduce validation frequency
2. Check Anthropic account usage limits
3. Wait for rate limit reset

---

## Cost Estimates

| Frequency | Monthly Cost (estimate) |
|-----------|------------------------|
| Weekly    | $2-8                  |
| Twice weekly | $4-16             |
| Daily     | $15-60                |

*Costs vary based on codebase size. Model: Claude Opus 4.5*

---

## Related SOPs

- [local-dev-setup.md](local-dev-setup.md) - Set up development environment
- [architecture-validation.md](architecture-validation.md) - Run validation agent
- [health-monitoring.md](health-monitoring.md) - Monitor system health

---

## Next Steps

After deployment:
1. Monitor first few runs to ensure stability
2. Review reports for actionable insights
3. Set up Slack/email notifications if not done
4. Adjust schedule based on team cadence

# Architecture Validation Agent - Deployment Guide

This guide covers different deployment options for the IRL Architecture Validation Agent.

## Prerequisites

- Node.js 20+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Git repository (for GitHub Actions deployment)

## Deployment Options

### Option 1: GitHub Actions (Recommended for Teams)

**Pros:**
- Fully automated
- No server maintenance
- Integrated with GitHub Issues
- Artifacts stored for 90 days

**Setup:**

1. **Add API Key to GitHub Secrets:**
   - Go to your repository **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key

2. **Enable Workflow:**
   - The workflow file is already at `.github/workflows/architecture-validation.yml`
   - It will run automatically on:
     - Weekly schedule (Mondays at 9 AM UTC)
     - Push to main branch (affecting `irl/src/` files)
     - Manual trigger

3. **Manual Trigger:**
   - Go to **Actions** tab
   - Select **IRL Architecture Validation**
   - Click **Run workflow**

4. **View Results:**
   - Check **Actions** tab for workflow runs
   - Download artifacts for full reports
   - Check **Issues** tab for auto-generated issues

---

### Option 2: Cron Job (Recommended for Servers)

**Pros:**
- Runs on your own infrastructure
- Full control over scheduling
- Can integrate with local notification systems

**Setup:**

1. **Set Environment Variables:**

   Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

   ```bash
   export ANTHROPIC_API_KEY='your_api_key_here'

   # Optional: Email notifications
   export IRL_VALIDATION_EMAIL='your-email@example.com'

   # Optional: Slack notifications
   export IRL_VALIDATION_SLACK_WEBHOOK='https://hooks.slack.com/services/...'

   # Optional: Auto-push reports to git
   export IRL_VALIDATION_AUTO_PUSH='true'
   ```

2. **Install Mail Command (Optional, for email notifications):**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install mailutils

   # macOS
   # Built-in mail command available

   # RHEL/CentOS
   sudo yum install mailx
   ```

3. **Add to Crontab:**

   ```bash
   crontab -e
   ```

   Add this line (runs every Monday at 9 AM):

   ```cron
   0 9 * * 1 /path/to/code_irl/agents/cron-scheduler.sh
   ```

   Other schedule examples:
   ```cron
   # Daily at 9 AM
   0 9 * * * /path/to/code_irl/agents/cron-scheduler.sh

   # Twice weekly (Monday and Thursday at 9 AM)
   0 9 * * 1,4 /path/to/code_irl/agents/cron-scheduler.sh

   # Monthly on the 1st at 9 AM
   0 9 1 * * /path/to/code_irl/agents/cron-scheduler.sh
   ```

4. **Test the Setup:**

   ```bash
   # Run manually to test
   cd /path/to/code_irl
   ./agents/cron-scheduler.sh
   ```

5. **View Logs:**

   ```bash
   tail -f /path/to/code_irl/agents/reports/cron-validation.log
   ```

---

### Option 3: Manual Execution (Development/Testing)

**Pros:**
- Immediate feedback
- No setup required
- Good for testing changes

**Setup:**

1. **Set API Key:**

   ```bash
   export ANTHROPIC_API_KEY='your_api_key_here'
   ```

2. **Run the Agent:**

   ```bash
   cd /path/to/code_irl
   node agents/architecture-validator.js
   ```

3. **View Results:**

   ```bash
   # View latest report
   cat agents/reports/architecture-validation-latest.md

   # View all reports
   ls -lht agents/reports/
   ```

---

## Notification Integrations

### Slack Notifications

When using the cron scheduler, you can receive Slack notifications:

1. **Create a Slack Webhook:**
   - Go to https://api.slack.com/messaging/webhooks
   - Create an Incoming Webhook for your workspace
   - Copy the webhook URL

2. **Set Environment Variable:**

   ```bash
   export IRL_VALIDATION_SLACK_WEBHOOK='https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   ```

3. **Test:**

   ```bash
   ./agents/cron-scheduler.sh
   ```

### Email Notifications

1. **Ensure mail command is installed** (see cron setup above)

2. **Set Environment Variable:**

   ```bash
   export IRL_VALIDATION_EMAIL='your-email@example.com'
   ```

3. **Configure SMTP** (if not already configured):

   ```bash
   # Ubuntu/Debian - Edit /etc/ssmtp/ssmtp.conf
   sudo nano /etc/ssmtp/ssmtp.conf
   ```

   Example configuration:
   ```
   root=your-email@example.com
   mailhub=smtp.gmail.com:587
   AuthUser=your-email@example.com
   AuthPass=your-app-password
   UseSTARTTLS=YES
   ```

---

## Cost Estimates

The validation agent uses Claude Opus 4.5, the most capable model. Estimated costs:

| Frequency | Estimated Monthly Cost |
|-----------|------------------------|
| Weekly    | $2-8                  |
| Twice weekly | $4-16            |
| Daily     | $15-60                |

*Costs vary based on codebase size. Each run analyzes ~15 files and generates a detailed report.*

---

## Monitoring

### GitHub Actions

- Check the **Actions** tab for workflow status
- Enable GitHub notifications for workflow failures
- Review auto-generated issues

### Cron Jobs

- Monitor the log file: `agents/reports/cron-validation.log`
- Set up log rotation to prevent disk usage issues:

  ```bash
  # Add to /etc/logrotate.d/irl-validation
  /path/to/code_irl/agents/reports/cron-validation.log {
      weekly
      rotate 4
      compress
      missingok
      notifempty
  }
  ```

### Manual Checks

- Review the latest report periodically:
  ```bash
  cat agents/reports/architecture-validation-latest.md
  ```

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Solution:**
- Ensure the environment variable is set
- For cron jobs, variables must be set in the crontab or sourced script
- Test by running: `echo $ANTHROPIC_API_KEY`

### "API request failed with status 401"

**Solution:**
- Your API key is invalid or expired
- Generate a new key at https://console.anthropic.com/
- Update the environment variable or GitHub secret

### "API request failed with status 429"

**Solution:**
- You've hit rate limits
- Reduce validation frequency
- Check your Anthropic account usage limits

### GitHub Actions workflow not running

**Solution:**
- Check that the workflow file is in `.github/workflows/`
- Ensure `ANTHROPIC_API_KEY` secret is set
- Verify workflow permissions (Settings → Actions → General)
- Check if Actions are enabled for the repository

### Cron job not running

**Solution:**
- Verify crontab entry: `crontab -l`
- Check cron service is running: `systemctl status cron`
- Ensure script has execute permissions: `chmod +x agents/cron-scheduler.sh`
- Check logs: `tail -f agents/reports/cron-validation.log`
- Test manually: `./agents/cron-scheduler.sh`

### No email notifications received

**Solution:**
- Verify `mail` command is installed: `which mail`
- Test mail configuration: `echo "test" | mail -s "Test" your-email@example.com`
- Check spam folder
- Review mail server logs

### Slack notifications not working

**Solution:**
- Verify webhook URL is correct
- Test webhook with curl:
  ```bash
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Test message"}' \
    $IRL_VALIDATION_SLACK_WEBHOOK
  ```
- Check Slack app permissions
- Ensure webhook is not disabled

---

## Security Best Practices

1. **API Key Storage:**
   - Never commit API keys to git
   - Use environment variables or secrets managers
   - Rotate keys periodically

2. **GitHub Secrets:**
   - Use repository secrets, not organization secrets (unless appropriate)
   - Limit access to repository settings
   - Audit secret usage regularly

3. **Server Deployments:**
   - Restrict file permissions on scripts: `chmod 700 agents/*.sh`
   - Use dedicated service account for cron jobs
   - Encrypt logs if they contain sensitive information

4. **Network Security:**
   - Ensure firewall allows HTTPS to api.anthropic.com
   - Use VPN or private networks where appropriate
   - Monitor API usage for anomalies

---

## Scaling

### Multiple Repositories

To use the same agent across multiple IRL deployments:

1. **Shared Configuration:**
   - Create a central configuration repository
   - Use git submodules or symlinks

2. **Centralized Reporting:**
   - Modify the agent to send reports to a central dashboard
   - Use S3, GCS, or similar for report storage

3. **Parallel Execution:**
   - Use GitHub Actions matrix strategy
   - Deploy on Kubernetes with CronJobs

### Custom Validation Rules

To add custom validation rules:

1. Edit `agents/architecture-validator.js`
2. Modify the `VALIDATION_FRAMEWORK` constant
3. Add custom file patterns to `SOURCE_FILES`
4. Update the verdict parsing logic if needed

---

## Support

For issues or questions:

1. Check this documentation first
2. Review existing reports for context
3. Open a GitHub issue with:
   - Deployment method (GitHub Actions / Cron / Manual)
   - Error messages and logs
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## License

This agent is part of the IRL project and follows the same license terms.

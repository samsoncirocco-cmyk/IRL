# GitHub Actions Setup for Architecture Validation Agent

This guide walks you through setting up the Architecture Validation Agent to run automatically on GitHub Actions.

## Prerequisites

- GitHub repository for this project
- Anthropic API key with available credits ([Get one here](https://console.anthropic.com/))
- Repository pushed to GitHub

## Step-by-Step Setup

### Step 1: Push Your Code to GitHub

If you haven't already pushed the agent code to GitHub:

```bash
# Add remote (if not already added)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Add Anthropic API Key to GitHub Secrets

1. **Navigate to your repository on GitHub**
   - Go to https://github.com/YOUR_USERNAME/YOUR_REPO

2. **Open Repository Settings**
   - Click the **Settings** tab (top right of repository page)

3. **Navigate to Secrets**
   - In the left sidebar, click **Secrets and variables**
   - Click **Actions**

4. **Add New Secret**
   - Click **New repository secret** button

5. **Configure the Secret**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (e.g., `sk-ant-api03-...`)
   - Click **Add secret**

**⚠️ Important:**
- The secret name MUST be exactly `ANTHROPIC_API_KEY` (case-sensitive)
- Make sure your API key has available credits at https://console.anthropic.com/
- Never commit your API key directly to the repository

### Step 3: Verify Workflow File Exists

The workflow file should already be committed at:
```
.github/workflows/architecture-validation.yml
```

To verify:
```bash
ls -la .github/workflows/architecture-validation.yml
```

You should see the file. If not, make sure you've pushed your latest commit.

### Step 4: Enable GitHub Actions (if needed)

Some repositories have Actions disabled by default.

1. Go to **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select:
   - **Allow all actions and reusable workflows** (recommended)
   - Or **Allow [organization] and select non-[organization], actions and reusable workflows**
3. Click **Save**

### Step 5: Test the Workflow

**Option A: Manual Trigger**

1. Go to the **Actions** tab in your repository
2. Click **IRL Architecture Validation** in the left sidebar
3. Click **Run workflow** button (top right)
4. Select branch (usually `main`)
5. Optionally configure:
   - ✅ Create GitHub Issue if problems found (default: true)
6. Click **Run workflow**

**Option B: Wait for Scheduled Run**

The workflow is configured to run automatically:
- **Every Monday at 9:00 AM UTC**
- **On push to main** (when files in `irl/src/` change)

### Step 6: Monitor the Workflow

1. **Go to Actions Tab**
   - Navigate to https://github.com/YOUR_USERNAME/YOUR_REPO/actions

2. **View Running/Completed Workflows**
   - Click on a workflow run to see details
   - Expand steps to see logs

3. **Check for Errors**
   - If the workflow fails, check the logs
   - Common issues:
     - API key not set correctly
     - Insufficient credits
     - Permissions issues

### Step 7: Review Generated Reports

After a successful run:

1. **Download Artifacts**
   - Scroll to bottom of workflow run page
   - Click **architecture-validation-report-XXX** under Artifacts
   - Download and extract the zip file

2. **Check Committed Reports**
   - Reports are auto-committed to `agents/reports/`
   - Pull the latest changes: `git pull origin main`
   - View latest: `cat agents/reports/architecture-validation-latest.md`

3. **Review GitHub Issues**
   - If the verdict is ⚠️ or ❌, an issue will be created
   - Check the **Issues** tab for details

## What Happens on Each Run?

The workflow performs these steps:

1. **Checkout code** - Gets latest code from repository
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm install` in `irl/` directory
4. **Run validation agent** - Executes the architecture validator
5. **Upload artifacts** - Saves reports (90-day retention)
6. **Commit reports** - Commits generated reports back to repository
7. **Create issues** - Opens GitHub issue if critical findings detected

## Workflow Configuration

The workflow is located at: `.github/workflows/architecture-validation.yml`

**Default Schedule:**
```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

**To Change Schedule:**

Edit the cron expression:
- `0 9 * * 1` - Weekly on Monday 9 AM
- `0 9 * * *` - Daily at 9 AM
- `0 9 1 * *` - Monthly on 1st at 9 AM
- `0 9 * * 1,4` - Monday and Thursday at 9 AM

**To Disable Auto-run on Push:**

Comment out or remove this section:
```yaml
push:
  branches:
    - main
  paths:
    - 'irl/src/**'
    - 'irl/index.js'
    - 'irl/pitch-deck.md'
    - 'IRL_MASTER_PLAN.md'
```

## Troubleshooting

### "Secret ANTHROPIC_API_KEY not found"

**Solution:**
1. Verify secret name is exactly `ANTHROPIC_API_KEY`
2. Check it's a **repository** secret, not an environment secret
3. Try re-creating the secret

### "API request failed with status 401"

**Solution:**
- Your API key is invalid
- Generate a new key at https://console.anthropic.com/
- Update the GitHub secret with the new key

### "API request failed with status 400: credit balance too low"

**Solution:**
1. Go to https://console.anthropic.com/
2. Navigate to **Plans & Billing**
3. Add credits or upgrade plan
4. Re-run the workflow

### "Permission denied" when committing reports

**Solution:**
1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### Workflow doesn't run on schedule

**Solution:**
1. Ensure GitHub Actions are enabled
2. Check the repository is active (GitHub may pause Actions on inactive repos)
3. Verify the cron syntax is correct
4. Wait for the next scheduled time (check in UTC)

### No issues created despite failures

**Solution:**
1. Check workflow logs for errors
2. Verify the verdict parsing logic worked
3. Check repository permissions for issue creation
4. Look at workflow file settings for `notify_on_issues`

## Cost Management

Each validation run costs approximately **$0.50 - $2.00** depending on codebase size.

**Weekly runs:** ~$2-8/month
**Daily runs:** ~$15-60/month

To reduce costs:
- Run less frequently (change cron schedule)
- Disable auto-run on push
- Only run manually before important meetings

## Security Best Practices

1. **Never commit API keys** - Always use GitHub Secrets
2. **Rotate keys regularly** - Generate new keys every 90 days
3. **Monitor usage** - Check Anthropic console for unexpected usage
4. **Limit permissions** - Use repository secrets, not organization secrets
5. **Review workflow logs** - Ensure no sensitive data is logged

## Next Steps

After setup is complete:

1. ✅ Wait for first scheduled run (or trigger manually)
2. ✅ Review the generated report
3. ✅ Address any critical findings
4. ✅ Monitor weekly reports for architectural drift
5. ✅ Update pitch materials to stay aligned with implementation

## Additional Resources

- [Agent Documentation](agents/README.md)
- [Deployment Guide](agents/DEPLOYMENT.md)
- [Quick Start Guide](agents/QUICK_START.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Anthropic Console](https://console.anthropic.com/)

---

**Questions or issues?** Open a GitHub issue in this repository.

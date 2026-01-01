# Architecture Validation Agent - Quick Start

Get started with the IRL Architecture Validation Agent in 5 minutes.

## What Is This?

An autonomous agent that acts as a **Principal Infrastructure Engineer**, performing regular design reviews of your IRL codebase. It evaluates whether your implementation aligns with your architectural vision and identifies gaps, risks, and compliance issues.

## Prerequisites

- Node.js 20+
- Anthropic API key ([Get one free](https://console.anthropic.com/))

## 3-Step Setup

### 1. Get Your API Key

```bash
# Sign up at https://console.anthropic.com/
# Copy your API key
export ANTHROPIC_API_KEY='sk-ant-...'
```

### 2. Test the Agent

```bash
# Verify everything works (no API key needed)
node agents/test-agent.js
```

Expected output:
```
✅ All tests passed! Agent is ready to use.
```

### 3. Run Your First Validation

```bash
# Run a full architecture validation
node agents/architecture-validator.js
```

This will:
- Analyze your entire IRL codebase
- Generate a detailed report
- Save to `agents/reports/architecture-validation-[timestamp].md`
- Exit with code 0 (credible) or 1 (issues found)

## View the Report

```bash
# View the latest report
cat agents/reports/architecture-validation-latest.md

# Or open in your editor
code agents/reports/architecture-validation-latest.md
```

## What's in the Report?

Each report includes:

1. **Executive Summary** - 5-7 bullet overview
2. **Gap Analysis Table** - What's missing vs. what's pitched
3. **Determinism Review** - Are all decisions auditable?
4. **Security Check** - Compliance with "no PII storage" claim
5. **AI Guardrail Readiness** - Can you add semantic invariants safely?
6. **Enterprise Skepticism Test** - What would a F500 buyer challenge?
7. **Risk Assessment** - Top technical and product risks
8. **Final Verdict** - ✅ Credible / ⚠️ Overstated / ❌ Misaligned

## Automate It

### Option A: GitHub Actions (Recommended)

Already set up! Just add your API key to GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `ANTHROPIC_API_KEY`
3. Done! Runs every Monday at 9 AM UTC

### Option B: Cron Job

```bash
# Add to your crontab (runs weekly)
crontab -e

# Add this line:
0 9 * * 1 /path/to/code_irl/agents/cron-scheduler.sh
```

## Common Use Cases

### Before a Pitch Meeting

```bash
# Run validation to ensure claims are backed by code
node agents/architecture-validator.js

# Check the verdict
grep -A 5 "Final Verdict" agents/reports/architecture-validation-latest.md
```

### Weekly Code Review

```bash
# Set up cron job (see Option B above)
# Reports automatically saved to agents/reports/
# Review latest report every Monday
```

### Before Investor Demo

```bash
# Run validation
node agents/architecture-validator.js

# If verdict is ⚠️ or ❌, review the Gap Analysis Table
# Address critical gaps before the demo
```

### During Development Sprint

```bash
# Run after major feature completion
node agents/architecture-validator.js

# Compare with previous report to see progress
diff agents/reports/architecture-validation-[old].md \
     agents/reports/architecture-validation-latest.md
```

## Understanding Verdicts

### ✅ Credible
**What it means:** Your implementation supports your architectural claims. Pitch with confidence.

**Action:** None required. Continue building.

### ⚠️ Overstated
**What it means:** You're on the right track, but some pitch claims overstate current capabilities.

**Action:** Review Gap Analysis Table. Either:
- Adjust pitch materials to match reality
- Prioritize building missing features

### ❌ Misaligned
**What it means:** Significant mismatch between pitch and implementation. Needs immediate attention.

**Action:** Review entire report. Either:
- Major refactor to align with pitch
- Pivot pitch to match current implementation

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

```bash
# Make sure you've exported the key
echo $ANTHROPIC_API_KEY

# If empty, set it:
export ANTHROPIC_API_KEY='sk-ant-...'
```

### "API request failed with status 401"

Your API key is invalid. Get a new one at https://console.anthropic.com/

### "File does not exist" errors

You're running from the wrong directory:

```bash
# Must run from project root
cd /path/to/code_irl
node agents/architecture-validator.js
```

### Tests pass but validation fails

Your API key might be out of credits. Check your Anthropic dashboard.

## Cost

- **Model Used:** Claude Opus 4.5 (most capable)
- **Cost per Run:** ~$0.50 - $2.00
- **Weekly Usage:** ~$2 - $8/month

**Pro tip:** Run manually before important meetings/demos. Use automation for regular monitoring.

## Next Steps

- [Full Documentation](README.md) - Deep dive into features
- [Deployment Guide](DEPLOYMENT.md) - Advanced setups
- [View Sample Report](reports/architecture-validation-latest.md) - See what output looks like

## Questions?

Open a GitHub issue or check the [main documentation](README.md).

---

**Happy validating! 🛡️**

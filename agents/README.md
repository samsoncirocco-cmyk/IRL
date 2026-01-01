# IRL Autonomous Agents

This directory contains autonomous agents that perform regular maintenance, validation, and monitoring tasks for the IRL system.

## Architecture Validation Agent

### Overview

The **Architecture Validation Agent** acts as a Principal Infrastructure Engineer, performing regular design reviews to ensure the codebase remains aligned with the pitched architecture.

### Purpose

This agent performs critical validation checks:

- **Architecture Alignment**: Verifies implementation supports the pitched architecture
- **Gap Analysis**: Identifies missing features and technical debt
- **Determinism Review**: Ensures all decisions are auditable and reproducible
- **Security Assessment**: Validates compliance claims (no PII storage, etc.)
- **Enterprise Readiness**: Tests the product against enterprise buyer objections
- **Risk Analysis**: Identifies technical and product risks

### When It Runs

The agent runs automatically:

1. **Weekly Schedule**: Every Monday at 9 AM UTC
2. **On Code Changes**: When source files in `irl/src/` are modified
3. **Manual Trigger**: Can be run on-demand via GitHub Actions

### How to Use

#### Manual Execution (Local)

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=your_key_here

# Run the validation agent
node agents/architecture-validator.js
```

#### Manual Execution (GitHub Actions)

1. Go to **Actions** tab in GitHub
2. Select **IRL Architecture Validation** workflow
3. Click **Run workflow**
4. Optionally enable issue creation for findings

#### View Results

**Local Execution:**
- Reports saved to: `agents/reports/architecture-validation-[timestamp].md`
- Latest report: `agents/reports/architecture-validation-latest.md`

**GitHub Actions:**
- Download artifacts from workflow run
- Check for auto-generated issues (if validation fails)
- Reports are automatically committed to the repository

### Report Structure

Each validation report includes:

1. **Executive Summary** (5-7 bullets)
2. **Gap Analysis Table** (Pitch claims vs. current support)
3. **Determinism & Auditability Review**
4. **Security & Compliance Reality Check**
5. **AI Guardrail Readiness Assessment**
6. **Enterprise Buyer Skepticism Test**
7. **Execution Risk Assessment** (Technical & product risks)
8. **Final Verdict** (Credible / Overstated / Misaligned)

### Verdicts

The agent provides one of three verdicts:

- ✅ **Credible**: Pitch is credible with current trajectory
- ⚠️ **Overstated**: Pitch is directionally right but overstates readiness
- ❌ **Misaligned**: Pitch is misaligned with the current system

### GitHub Integration

When issues are found, the agent:

1. **Commits Reports**: Automatically commits reports to `agents/reports/`
2. **Creates Issues**: Opens GitHub issues for critical findings
3. **Labels**: Tags issues with `architecture`, `validation`, and severity labels
4. **Artifacts**: Uploads full reports as workflow artifacts (90-day retention)

### Configuration

**Environment Variables:**
- `ANTHROPIC_API_KEY`: Required for Claude API access (set in GitHub Secrets)

**GitHub Secrets Required:**
- `ANTHROPIC_API_KEY`: Your Anthropic API key

**Workflow Configuration:**
Edit `.github/workflows/architecture-validation.yml` to:
- Change schedule (default: weekly Monday 9 AM UTC)
- Disable auto-run on push
- Adjust artifact retention
- Modify issue creation logic

### Agent Architecture

The validation agent:

1. **Gathers Context**: Reads all critical source files
2. **Compiles Codebase**: Creates structured markdown representation
3. **Sends to Claude**: Uses Claude Opus 4.5 (most capable model)
4. **Parses Response**: Extracts verdict and structured findings
5. **Saves Report**: Writes detailed markdown report
6. **Takes Action**: Creates issues, commits reports, notifies team

### Files Analyzed

The agent analyzes:

- `irl/src/sentinel.js` - Core fingerprinting and invariant logic
- `irl/src/sidecar.js` - HTTP proxy implementation
- `irl/src/driftReport.js` - Drift detection and severity grading
- `irl/src/governance.js` - Quarantine review/release
- `irl/src/storage.js` - Registry and persistence
- `irl/src/diff.js` - Structural diff algorithm
- `irl/src/patchManager.js` - Virtual patching (Healer)
- `irl/index.js` - Main entry point
- `README.md` - Product overview
- `irl/pitch-deck.md` - Pitch materials
- `IRL_MASTER_PLAN.md` - Roadmap and status
- `CLAUDE.md` - Agent instructions

### Best Practices

1. **Review Reports Weekly**: Check the latest validation report
2. **Address Critical Issues**: Prioritize ❌ misaligned and ⚠️ overstated verdicts
3. **Track Progress**: Use reports to measure alignment over time
4. **Update Pitch Materials**: Keep pitch-deck.md aligned with implementation
5. **Document Changes**: Update IRL_MASTER_PLAN.md as features are completed

### Troubleshooting

**Agent fails with API error:**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits
- Ensure network connectivity to api.anthropic.com

**Report shows unexpected verdict:**
- Review recent code changes
- Check if pitch materials are outdated
- Verify all features marked as "implemented" actually work

**GitHub Action fails:**
- Check workflow logs for specific error
- Verify repository secrets are configured
- Ensure git push permissions are set

### Future Enhancements

Potential improvements to the agent:

- [ ] Trend analysis across multiple reports
- [ ] Integration with Slack/Discord for notifications
- [ ] Automated PR comments on architecture changes
- [ ] Custom validation rules per component
- [ ] Benchmark against competitor architectures
- [ ] Generate remediation action items

### Related Documentation

- [CLAUDE.md](/CLAUDE.md) - Team topology and protocols
- [IRL_MASTER_PLAN.md](/IRL_MASTER_PLAN.md) - Product roadmap
- [CONTRIBUTING.md](/CONTRIBUTING.md) - Contribution guidelines

---

**Note**: This agent uses Claude Opus 4.5, the most capable model, to ensure thorough and accurate architectural analysis. Cost is approximately $0.50-2.00 per validation run depending on codebase size.

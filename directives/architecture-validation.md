# SOP: Architecture Validation

Run the IRL Architecture Validation Agent to verify alignment between pitch and implementation.

## Overview

The Architecture Validation Agent acts as a **Principal Infrastructure Engineer**, evaluating whether the IRL codebase matches the architectural claims made in pitch materials. It generates a detailed report with:

- Executive summary
- Gap analysis (what's missing vs. what's pitched)
- Determinism review (are decisions auditable?)
- Security check (PII handling compliance)
- Enterprise readiness assessment
- Risk analysis
- Final verdict (✅ CREDIBLE / ⚠️ OVERSTATED / ❌ MISALIGNED)

## Prerequisites

- **Node.js:** Version 20+ installed
- **Anthropic API Key:** Set as environment variable
- **Repository:** IRL repository cloned and up-to-date
- **Network:** Access to `api.anthropic.com`

---

## Procedure

### 1. Set Anthropic API Key

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

**Verify:**
```bash
echo $ANTHROPIC_API_KEY
```

**Expected Output:**
```
sk-ant-api03-...
```

### 2. Navigate to Repository Root

```bash
cd /path/to/irl
```

**Verify:**
```bash
ls -la agents/architecture-validator.js
```

**Expected Output:**
```
-rw-r--r-- 1 user user 12345 Feb 06 03:50 agents/architecture-validator.js
```

### 3. Run the Validation Agent

```bash
node agents/architecture-validator.js
```

**Expected Output:**
```
Starting IRL Architecture Validation Agent...
Model: claude-opus-4-5
Perspective: Principal Infrastructure Engineer

Reading source files:
  ✓ README.md (9470 bytes)
  ✓ ARCHITECTURE.md (16927 bytes)
  ✓ clients/python/irl.py (3215 bytes)
  ✓ clients/java/IrlClient.java (2134 bytes)
  ✓ agents/cron-scheduler.sh (4521 bytes)
  ... (15 total files)

Total source code: ~45KB

Analyzing architecture alignment...
(This may take 30-60 seconds)

Generating report...

✓ Report saved: agents/reports/architecture-validation-1707350445123.md
✓ Latest symlink updated: agents/reports/architecture-validation-latest.md

Final Verdict: ✅ CREDIBLE - Pitch is credible and backed by code
```

### 4. View the Report

```bash
cat agents/reports/architecture-validation-latest.md
```

**Expected Output:**
```markdown
# IRL Architecture Validation Report
Generated: 2026-02-08T00:47:25.123Z
Evaluator: Principal Infrastructure Engineer
Model: claude-opus-4-5

## Executive Summary
- ✓ Core fingerprinting engine concept is architecturally sound
- ✓ Python and Java clients demonstrate language-agnostic design
- ⚠️ Sidecar implementation (src/) not yet present in codebase
- ✓ MCP server documentation aligns with agent-native pitch
...

## Final Verdict
⚠️ OVERSTATED - Pitch is directionally right but some capabilities are documented, not implemented
```

### 5. Interpret the Verdict

| Verdict | Meaning | Action |
|---------|---------|--------|
| ✅ **CREDIBLE** | Pitch is backed by code | Proceed with confidence |
| ⚠️ **OVERSTATED** | Some claims exceed implementation | Review Gap Analysis → prioritize features or adjust pitch |
| ❌ **MISALIGNED** | Major mismatch between pitch and code | Major refactor or pivot required |

---

## Expected Output

After running validation:
- ✓ Detailed markdown report generated
- ✓ Report saved to `agents/reports/architecture-validation-[timestamp].md`
- ✓ Symlink `architecture-validation-latest.md` points to newest report
- ✓ Exit code 0 (credible) or 1 (issues found)

---

## Use Cases

### Use Case 1: Pre-Pitch Verification

**When:** Before investor meeting or customer demo

**Procedure:**
```bash
# Run validation
node agents/architecture-validator.js

# Check verdict
grep "Final Verdict" agents/reports/architecture-validation-latest.md

# If ⚠️ or ❌, review Gap Analysis Table
grep -A 20 "Gap Analysis Table" agents/reports/architecture-validation-latest.md
```

**Action:**
- ✅ CREDIBLE → Proceed with pitch
- ⚠️ OVERSTATED → Adjust pitch claims or prioritize missing features
- ❌ MISALIGNED → Defer pitch until alignment is achieved

### Use Case 2: Weekly Architecture Review

**When:** Every Monday morning (automated via cron or GitHub Actions)

**Procedure:**
See [deploy.md](deploy.md) for GitHub Actions or cron setup

**Action:**
- Review report for drift between pitch and implementation
- Track progress on Gap Analysis items week-over-week
- Identify new risks or blockers

### Use Case 3: Post-Sprint Review

**When:** After completing major features

**Procedure:**
```bash
# Run validation
node agents/architecture-validator.js

# Compare with previous report
diff agents/reports/architecture-validation-[old-timestamp].md \
     agents/reports/architecture-validation-latest.md
```

**Action:**
- Verify new features close gaps in Gap Analysis
- Confirm no new architectural risks introduced
- Update pitch materials if new capabilities added

---

## Report Sections Explained

### 1. Executive Summary
5-7 bullet points highlighting:
- ✓ Strengths (what's implemented well)
- ⚠️ Gaps (what's missing)
- ❌ Misalignments (what contradicts the pitch)

### 2. Gap Analysis Table

| Pitched Capability | Evidence in Codebase | Assessment |
|--------------------|---------------------|------------|
| Structural Fingerprinting | `clients/python/irl.py` uses `/validate` endpoint | ✅ Documented |
| Sidecar Proxy | `ARCHITECTURE.md` describes `src/sidecar.js` | ⚠️ File not found |
| MCP Servers | `docs/MCP_WORKFLOWS.md` | ✅ Documented |

**Read this table to prioritize work** - ⚠️ items are your roadmap.

### 3. Determinism Review
Evaluates whether all decisions are:
- Auditable (logged with timestamps and actors)
- Reproducible (same input → same output)
- Safe (no dynamic code execution)

### 4. Security Check
Verifies compliance with "zero-knowledge PII" claim:
- No raw PII in audit logs
- SHA-256 checksums only
- PII stripping before storage

### 5. Enterprise Readiness
Principal Engineer's questions:
- Where's the circuit breaker for downstream failures?
- What happens if the sidecar crashes?
- How do you prevent baseline poisoning?

### 6. Risk Assessment
Top 3-5 technical or product risks:
- "Sidecar is single point of failure"
- "No versioning for baselines"
- "Unclear patch conflict resolution strategy"

### 7. Final Verdict
✅ / ⚠️ / ❌ with summary reasoning

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Solution:** Export the environment variable

```bash
export ANTHROPIC_API_KEY='sk-ant-...'
node agents/architecture-validator.js
```

### "API request failed with status 401"

**Solution:** API key is invalid or expired

1. Go to https://console.anthropic.com/
2. Generate a new API key
3. Update environment variable
4. Re-run validation

### "API request failed with status 429"

**Solution:** Rate limit exceeded

1. Wait 60 seconds
2. Reduce validation frequency
3. Check Anthropic account usage limits

### Tests pass but validation fails

**Solution:** API key may be out of credits

1. Check Anthropic dashboard for usage/credits
2. Add credits or wait for monthly reset
3. Consider using a different API key

### "File does not exist" errors

**Solution:** Running from wrong directory

```bash
# Must run from repository root
cd /path/to/irl
node agents/architecture-validator.js
```

### Report shows ❌ MISALIGNED unexpectedly

**Solution:** Review Gap Analysis Table carefully

```bash
# Extract gap analysis
grep -A 30 "Gap Analysis Table" agents/reports/architecture-validation-latest.md

# Identify critical gaps
# Either implement missing features or adjust pitch
```

---

## Automation

### GitHub Actions (Weekly Schedule)

See [deploy.md](deploy.md) for complete setup.

**Quick summary:**
1. Add `ANTHROPIC_API_KEY` to GitHub Secrets
2. Workflow runs automatically every Monday at 9 AM UTC
3. Artifacts downloadable for 90 days
4. Issues auto-created for warnings/failures

### Cron Job (Server-Based)

```bash
# Add to crontab
crontab -e

# Run every Monday at 9 AM
0 9 * * 1 /path/to/irl/agents/cron-scheduler.sh
```

See [deploy.md](deploy.md) for email/Slack notification setup.

---

## Cost Estimates

| Frequency | Monthly Cost |
|-----------|--------------|
| Weekly    | $2-8        |
| Twice weekly | $4-16    |
| Daily     | $15-60      |

*Based on Claude Opus 4.5 pricing. Costs vary with codebase size.*

---

## Related SOPs

- [deploy.md](deploy.md) - Automate validation with GitHub Actions or cron
- [local-dev-setup.md](local-dev-setup.md) - Set up development environment
- [health-monitoring.md](health-monitoring.md) - Monitor system health

---

## Best Practices

1. **Run before demos/pitches** - Verify claims are backed by code
2. **Track week-over-week** - Monitor progress on Gap Analysis
3. **Automate weekly** - Catch drift early
4. **Share reports with team** - Builds shared understanding of technical debt
5. **Update pitch when gaps close** - Keep marketing aligned with reality

---

## Next Steps

1. Set up automation: [deploy.md](deploy.md)
2. Review Gap Analysis Table and prioritize missing features
3. Run validation after every major feature completion

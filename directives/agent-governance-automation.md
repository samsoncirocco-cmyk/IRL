# SOP: Agent Governance Automation

Automate incident approval workflows using IRL MCP servers and Claude Desktop.

## Overview

This SOP covers automated incident governance patterns:
1. **Auto-approve safe patches** - Simple field renamings
2. **Flag complex drift** - TYPE_MISMATCH or multi-field changes
3. **Batch processing** - Handle multiple incidents efficiently
4. **Scheduled automation** - Cron-based or event-driven workflows

## Prerequisites

- **MCP Servers:** Configured in Claude Desktop (see [mcp-server-setup.md](mcp-server-setup.md))
- **Incidents:** Quarantined payloads exist
- **Understanding:** Reviewed [incident-handling.md](incident-handling.md)

---

## Pattern 1: Auto-Approve Safe Patches

### Workflow

**Trigger:** Daily cron job or manual command

**Agent Task:** "Review all incidents for finance_integration and auto-approve simple field renamings"

**Agent Logic:**
1. Uses `list_quarantined_incidents` to get all incidents
2. For each incident:
   - Uses `preview_incident` to analyze drift
   - **Auto-approve if:**
     - Only FIELD_ADDED + FIELD_REMOVED (1:1 rename pattern)
     - No TYPE_MISMATCH
     - No invariant violations
   - **Flag for review if:**
     - TYPE_MISMATCH detected
     - > 2 drift items
     - Unknown field patterns
3. Uses `approve_patch` for safe incidents
4. Creates GitHub issues for flagged incidents

### Example Conversation

**User:** "Auto-approve safe patches for finance_integration"

**Claude:**
```
I'll analyze all incidents and auto-approve simple field renamings.

[Uses list_quarantined_incidents]
Found 3 incidents to review.

[Uses preview_incident for incident 1]
Incident 2026-01-01T17-28-20-262Z_228986:
- FIELD_REMOVED: username
- FIELD_ADDED: user_name
Analysis: Simple field rename (1:1 mapping), safe to approve

[Uses approve_patch]
✓ Approved and released incident 1

[Uses preview_incident for incident 2]
Incident 2026-01-01T17-28-23-960Z_405123:
- TYPE_MISMATCH: total (number → string)
Analysis: Type change requires human review

Flagged for review: Creating GitHub issue...

[Uses preview_incident for incident 3]
Incident 2026-01-01T17-29-10-112Z_667234:
- FIELD_REMOVED: username
- FIELD_ADDED: user_name
Analysis: Simple field rename, safe to approve

[Uses approve_patch]
✓ Approved and released incident 3

Summary:
- Auto-approved: 2 incidents (simple renamings)
- Flagged for review: 1 incident (type mismatch)
- GitHub issue #456 created for manual review
```

---

## Pattern 2: Scheduled Batch Processing

### Setup

Create automation script:

```bash
#!/bin/bash
# auto-approve-incidents.sh

export ANTHROPIC_API_KEY='your-api-key'

# Use Claude CLI with MCP server
claude --mcp irl-governance \
  "Review all incidents for finance_integration and auto-approve simple field renamings. Create GitHub issues for complex drift."
```

**Add to crontab:**
```bash
# Every 4 hours: Auto-process incidents
0 */4 * * * /path/to/auto-approve-incidents.sh >> /var/log/irl-auto-approve.log 2>&1
```

---

## Pattern 3: Integration-Specific Policies

### Define Approval Policies

**Policy: Stripe Webhooks**
- Auto-approve: FIELD_ADDED for optional metadata fields
- Flag: Any FIELD_REMOVED or TYPE_MISMATCH

**Policy: Salesforce Leads**
- Auto-approve: Field renamings only
- Flag: New required fields

**Policy: LLM Outputs**
- Flag everything for review (LLM outputs are unpredictable)

### Implement with Agent Instructions

**User:** "Review stripe_webhook incidents with this policy: auto-approve FIELD_ADDED for metadata.* fields, flag everything else"

**Claude:**
```
I'll apply the Stripe webhook policy.

[Analyzes incidents with custom logic]
- Incident 1: metadata.customer_id added → Auto-approved
- Incident 2: event_type removed → Flagged (FIELD_REMOVED)
- Incident 3: data.total type changed → Flagged (TYPE_MISMATCH)

Results:
- Auto-approved: 1
- Flagged: 2
```

---

## Pattern 4: Proactive Drift Detection in CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/validate-payload.yml
name: IRL Proactive Validation

on:
  pull_request:
    paths:
      - 'tests/fixtures/payloads/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Payloads with IRL Sentinel
        run: |
          # Use MCP server to validate before merge
          claude --mcp irl-sentinel \
            "Validate all payloads in tests/fixtures/payloads/ against registered baselines. Block merge if invariant violations detected."
```

---

## Decision Matrix

| Drift Pattern | Auto-Approve? | Reasoning |
|---------------|---------------|-----------|
| Single field rename (FIELD_ADDED + FIELD_REMOVED) | ✅ Yes | Safe, deterministic |
| Type mismatch (number → string) | ❌ No | Breaking change, needs review |
| New optional field | ⚠️ Depends | Check baseline policy |
| Removed required field | ❌ No | Breaking change |
| Multiple renamings (> 2 fields) | ⚠️ Review | Test patch in staging first |
| Invariant violation | ❌ No | Semantic rule broken |

---

## Safety Guardrails

### 1. Approval Limits

```python
# Pseudo-logic for agent
if auto_approved_count_today > 50:
    flag_for_human_review("High auto-approval volume, manual verification needed")
```

### 2. Patch Testing

Always call `apply_patch_preview` before `approve_patch`:

**User:** "Test the patch before approving"

**Claude:**
```
[Uses apply_patch_preview]
Patch test results:
- Input: {"amount": 100, "curr": "USD"}
- Output: {"total": 100, "currency": "USD"}
✓ Patch transforms payload successfully

[Uses approve_patch]
✓ Approved based on successful test
```

### 3. Audit Logging

All auto-approvals include:
- `approved_by: 'agent-auto-approver'`
- Timestamp
- Reasoning (logged separately)

**Review audit log:**
```bash
grep "agent-auto-approver" quarantine/*/audit.log
```

---

## Monitoring

### Daily Summary Report

**User:** "Generate a daily summary of auto-approved and flagged incidents"

**Claude:**
```
IRL Governance Summary - 2026-02-08

Auto-Approved Incidents: 23
- finance_integration: 12 (field renamings)
- stripe_webhook: 8 (metadata fields)
- user_integration: 3 (field renamings)

Flagged for Review: 5
- finance_integration: 2 (type mismatches)
- salesforce_lead: 3 (new required fields)

GitHub Issues Created: 5
- #456: TYPE_MISMATCH in finance_integration
- #457: New required field in salesforce_lead
...

Recommendations:
- Update finance_integration baseline (2 incidents with same drift pattern)
- Review salesforce_lead schema with upstream team
```

---

## Troubleshooting

### Too many false positives

**Solution:** Refine approval criteria

```
# Instead of "auto-approve all field renamings"
# Use: "auto-approve field renamings only if drift_items.length === 2"
```

### Agent approves unsafe patches

**Solution:** Add explicit safety checks

**User:** "Auto-approve ONLY if: (1) exactly 2 drift items, (2) one FIELD_ADDED + one FIELD_REMOVED, (3) no TYPE_MISMATCH, (4) patch preview succeeds"

### High volume of flagged incidents

**Solution:** Update baseline to match new schema

```bash
# Register new baseline
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d @new_baseline.json
```

---

## Related SOPs

- [incident-handling.md](incident-handling.md) - Manual incident review process
- [mcp-server-setup.md](mcp-server-setup.md) - Configure MCP servers
- [health-monitoring.md](health-monitoring.md) - Monitor quarantine status

---

## Best Practices

1. **Start conservative** - Auto-approve only simple renamings, expand gradually
2. **Test patches** - Always use `apply_patch_preview` before approval
3. **Monitor metrics** - Track auto-approval success rate
4. **Human-in-loop for uncertainty** - When in doubt, flag for review
5. **Update baselines proactively** - Reduce recurring drift

---

## Next Steps

1. Configure MCP servers: [mcp-server-setup.md](mcp-server-setup.md)
2. Test automation with a few incidents manually
3. Set up scheduled batch processing
4. Monitor and refine approval criteria based on results

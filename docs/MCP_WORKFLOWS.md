# MCP Agent Workflows

Complete guide to agent automation patterns using IRL MCP servers.

## Overview

The three IRL MCP servers enable powerful agent-driven automation:
- **irl-governance**: Incident management and approval workflows
- **irl-sentinel**: Proactive validation and health monitoring
- **irl-ai-proposer**: Patch generation and testing

## Workflow 1: Automated Incident Approval

### Use Case
Automatically approve safe patches for known field renamings while flagging complex drift for human review.

### Agent Pseudocode
1. Agent calls `list_quarantined_incidents(integration_name='user_integration')`
2. For each incident:
   a. Agent calls `preview_incident(integration_name, incident_id)`
   b. Agent analyzes `drift_reports`:
      - If simple field rename (FIELD_ADDED + FIELD_REMOVED): Auto-approve
      - If TYPE_MISMATCH or multiple changes: Flag for human review
   c. If auto-approve:
      - Agent calls `approve_patch(integration_name, incident_id, approved_by='agent-auto-approver')`
      - Agent logs action to audit trail
   d. If flag for review:
      - Agent creates GitHub issue with drift details
      - Agent notifies team via Slack

### Real Example (Claude Desktop)
**User**: "Approve all simple field renamings for user_integration"

**Claude**: I'll analyze the quarantined incidents and auto-approve safe patches.

[Uses `list_quarantined_incidents` tool]
Found 2 incidents for user_integration.

[Uses `preview_incident` for incident 1]
Incident `2026-01-01T17-28-20-262Z_228986`:
- FIELD_REMOVED: `username`
- FIELD_ADDED: `user_name`
Analysis: Simple field rename, safe to approve.

[Uses `approve_patch` tool]
✓ Patch approved! Healed payload released to `/released/user_integration/...`

[Uses `preview_incident` for incident 2]
Incident `2026-01-01T17-28-23-960Z_405123`:
- TYPE_MISMATCH: `total` (expected: number, received: string)
Analysis: Type change requires human review.

Creating GitHub issue for manual review...

## Workflow 2: Proactive Schema Validation

### Use Case
Validate incoming payloads before they reach the Sidecar to catch drift early in CI/CD pipeline.

### Agent Pseudocode
1. Agent receives payload from external system
2. Agent calls `compute_fingerprint(payload, invariants)` via irl-sentinel
3. If invariant violations:
   - Agent blocks deployment
   - Agent logs violation details
   - Agent notifies team: "Negative payment amount detected"
4. Agent calls `detect_drift(baseline_payload, incoming_payload)`
5. If drift detected:
   - Agent calls `generate_patch(drift_reports, integration_name, use_ai=false)`
   - Agent calls `apply_patch_preview(payload, patch_code)`
   - If preview succeeds:
     - Agent quarantines incident with proposed patch
     - Agent notifies team: "Drift detected but patch ready for approval"
   - If preview fails:
     - Agent calls `generate_patch(drift_reports, integration_name, use_ai=true)`
     - Agent re-tests AI-generated patch
6. Agent allows deployment only if no violations and (no drift OR patch ready)

### Real Example (CI/CD Integration)
`.github/workflows/validate-schema.yml`:

```yaml
- name: Validate Schema with IRL Agent
  run: |
    # Agent validates payload before deployment
    claude --mcp irl-sentinel "Validate this payload against user_integration baseline"
```

**Agent response**:

✓ Fingerprint computed: `c8352fbb67ec6942...`

✓ No invariant violations

⚠ Drift detected: field `username` renamed to `user_name`

✓ Patch generated and tested successfully

→ Quarantined for approval, safe to deploy

## Workflow 3: Audit Trail Analysis

### Use Case
Analyze historical drift patterns to identify frequently changing fields and predict future schema evolution.

### Agent Pseudocode
1. Agent reads all `quarantine://` resources for integration
2. Agent analyzes drift patterns:
   - Most frequently added/removed fields
   - Common type mismatches
   - Patch approval success rate
3. Agent generates report:
   - "Field `user_id` renamed 5 times in past month"
   - "Consider making `total` field optional in baseline"
4. Agent creates recommendations:
   - Update baseline to reflect stable schema
   - Add invariants for frequently violated rules

### Real Example (Weekly Analysis)
**User**: "Analyze drift patterns for user_integration over the past week"

**Claude**: I'll analyze all quarantined incidents and generate insights.

[Reads `quarantine://user_integration/*` resources]
Analyzed 47 incidents:

**Pattern Analysis**:
- Field renamings: 32 (68%) - Mostly `username` ↔ `user_name`
- Type mismatches: 8 (17%) - `total` field (number vs string)
- New fields: 7 (15%) - `email`, `phone_number` added

**Recommendations**:
1. Update baseline to use `user_name` consistently
2. Add type invariant: `total` must be number
3. Make `email`/`phone_number` optional fields in baseline

Auto-approved: 32 incidents (simple renamings)
Flagged for review: 15 incidents (type changes, multiple fields)

## Workflow 4: Health Monitoring

### Use Case
Continuously monitor system health and alert when registry is out of sync or Sidecar is down.

### Agent Pseudocode
1. Agent calls `check_system_health()` (using sentinel resources)
2. Agent checks:
   - `registry://manifest` for `lastHealthySync` timestamps
   - Sidecar `/health` endpoint
   - Quarantine directory size (alert if > 100 incidents)
3. If issues detected:
   - Agent creates PagerDuty incident
   - Agent runs diagnostics (read audit logs, check circuit breaker)
4. Agent generates health report every 5 minutes

## Best Practices

### 1. Always Log Agent Actions
When approving patches:
- Use `approved_by='agent-{name}'` for audit trail
- Log reasoning: "Auto-approved: simple field rename"

### 2. Human-in-the-Loop for Complex Drift
Auto-approve only if:
- Single field rename (FIELD_ADDED + FIELD_REMOVED)
- No type mismatches
- No invariant violations
Otherwise: Flag for human review

### 3. Test Patches Before Approval
Always call `apply_patch_preview` before `approve_patch`:
- Ensures patch doesn't break payload structure
- Validates healed payload against invariants

### 4. Use Resources for Historical Analysis
- `quarantine://` - Analyze past incidents
- `released://` - Verify healed payloads
- `neo4j://` - Audit graph exports
- `registry://` - Check baseline evolution

## Tool Quick Reference

### Governance Tools
- `list_quarantined_incidents` - List all incidents
- `preview_incident` - View drift details
- `approve_patch` - Release healed payload
- `reject_incident` - Archive unsafe patch

### Sentinel Tools
- `compute_fingerprint` - Structural fingerprinting
- `detect_drift` - Drift detection
- `validate_invariants` - Rule validation
- `strip_pii` - Zero-knowledge stripping

### AI Proposer Tools
- `generate_patch` - Patch generation
- `validate_patch` - Syntax validation
- `apply_patch_preview` - Safe preview

## Troubleshooting

### "Incident not found"
- Verify integration name matches quarantine directory
- Check incident_id format: `2026-01-01T17-28-20-262Z_228986`

### "Patch preview failed"
- Review `patch_code` syntax
- Ensure JSON instructions (not JavaScript)
- Check safeMapper compatibility

### "API key not configured"
- Set `ANTHROPIC_API_KEY` in Claude Desktop config
- Required only for AI-based patch generation (`use_ai=true`)


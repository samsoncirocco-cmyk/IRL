# SOP: Incident Handling

Review, approve, or reject quarantined incidents caused by schema drift or invariant violations.

## Overview

When a payload fails validation (schema drift or invariant violation), it's quarantined for review. This SOP covers the incident lifecycle:

1. **List** quarantined incidents
2. **Preview** incident details and drift analysis
3. **Decide** whether to approve, reject, or patch
4. **Execute** the decision (approve/reject/heal)
5. **Verify** the outcome

## Prerequisites

- **Incidents exist:** Payloads have been quarantined (check `quarantine/` directory)
- **Access:** Read access to quarantine directory
- **For manual review:** Understanding of integration schema
- **For agent automation:** MCP servers configured (see [mcp-server-setup.md](mcp-server-setup.md))

---

## Manual Incident Handling

### 1. List Quarantined Incidents

```bash
# List all quarantined incidents
find quarantine/ -name "payload.json" -type f | sort

# Count incidents per integration
find quarantine/ -mindepth 1 -maxdepth 1 -type d -exec sh -c 'echo "$(basename {}): $(find {} -name payload.json | wc -l)"' \;
```

**Expected Output:**
```
finance_integration: 12
user_integration: 5
stripe_webhook: 3
```

### 2. Preview a Specific Incident

```bash
# Navigate to incident directory
cd quarantine/finance_integration/2026-01-01T17-28-20-262Z_228986/

# View quarantined payload
cat payload.json
```

**Expected Output:**
```json
{
  "amount": -50,
  "curr": "USD",
  "vendor": "Evil Corp"
}
```

**View drift report:**
```bash
cat drift_report.json
```

**Expected Output:**
```json
[
  {
    "path": "total",
    "changeType": "FIELD_REMOVED",
    "note": "Expected field 'total' is missing"
  },
  {
    "path": "amount",
    "changeType": "FIELD_ADDED",
    "note": "New field 'amount' detected"
  },
  {
    "path": "currency",
    "changeType": "FIELD_REMOVED"
  },
  {
    "path": "curr",
    "changeType": "FIELD_ADDED"
  }
]
```

**View proposed patch:**
```bash
cat proposed_patch.json
```

**Expected Output:**
```json
[
  {
    "op": "rename",
    "path": "amount",
    "target": "total"
  },
  {
    "op": "rename",
    "path": "curr",
    "target": "currency"
  }
]
```

### 3. Analyze the Incident

**Ask these questions:**

1. **Is this expected drift?**
   - Yes → Approve patch
   - No → Investigate with data producer

2. **Is the patch safe?**
   - Simple field rename → Safe to approve
   - Type mismatch → Requires validation
   - Multiple complex changes → Human review required

3. **Are invariant rules violated?**
   - If yes, check if payload should be rejected entirely

**Decision Tree:**
```
Is drift expected?
├─ Yes → Is patch safe?
│         ├─ Yes → APPROVE
│         └─ No → REVIEW + PATCH
└─ No → Contact data producer
        └─ Update baseline if schema changed upstream
```

### 4. Approve an Incident

```bash
# Move to released directory
INCIDENT_ID="2026-01-01T17-28-20-262Z_228986"
INTEGRATION="finance_integration"

# Create released directory structure
mkdir -p released/$INTEGRATION

# Copy healed payload to released
cp quarantine/$INTEGRATION/$INCIDENT_ID/proposed_patch_healed.json \
   released/$INTEGRATION/$INCIDENT_ID-healed.json

# Archive quarantine folder
mv quarantine/$INTEGRATION/$INCIDENT_ID \
   quarantine/$INTEGRATION/$INCIDENT_ID-APPROVED

# Create audit log entry
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] APPROVED incident $INCIDENT_ID by $(whoami)" \
  >> quarantine/$INTEGRATION/audit.log
```

**Expected Output:**
```
(files moved successfully)
```

### 5. Reject an Incident

```bash
# Archive incident as rejected
INCIDENT_ID="2026-01-01T17-28-23-960Z_405123"
INTEGRATION="finance_integration"

mv quarantine/$INTEGRATION/$INCIDENT_ID \
   quarantine/$INTEGRATION/$INCIDENT_ID-REJECTED

# Create audit log entry
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] REJECTED incident $INCIDENT_ID by $(whoami) - Reason: Invalid type conversion" \
  >> quarantine/$INTEGRATION/audit.log
```

**Expected Output:**
```
(incident archived as rejected)
```

---

## Agent-Driven Incident Handling (MCP)

### 1. List Incidents via Claude Desktop

**User:** "List all quarantined incidents for finance_integration"

**Claude:**
```
I'll check for quarantined incidents.

[Uses list_quarantined_incidents tool]

Found 2 quarantined incidents for finance_integration:

1. Incident ID: 2026-01-01T17-28-20-262Z_228986
   Status: QUARANTINED
   Timestamp: 2026-01-01 17:28:20 UTC
   Drift Reports: 2 issues

2. Incident ID: 2026-01-01T17-28-23-960Z_405123
   Status: QUARANTINED
   Timestamp: 2026-01-01 17:28:23 UTC
   Drift Reports: 1 issue
```

### 2. Preview Incident Details

**User:** "Show me details for incident 2026-01-01T17-28-20-262Z_228986"

**Claude:**
```
[Uses preview_incident tool]

Incident: 2026-01-01T17-28-20-262Z_228986

Drift Analysis:
- FIELD_REMOVED: 'total'
- FIELD_ADDED: 'amount'
- FIELD_REMOVED: 'currency'
- FIELD_ADDED: 'curr'

Assessment: Simple field renamings detected

Proposed Patch:
[
  {"op": "rename", "path": "amount", "target": "total"},
  {"op": "rename", "path": "curr", "target": "currency"}
]

Recommendation: Safe to approve - simple field renamings with no type changes
```

### 3. Approve Safe Patches

**User:** "Approve this incident"

**Claude:**
```
[Uses approve_patch tool]

✓ Incident 2026-01-01T17-28-20-262Z_228986 approved

Healed payload released to:
- /released/finance_integration/2026-01-01T17-28-20-262Z_healed.json
- Neo4j export: /neo4j/finance_integration/2026-01-01T17-28-20-262Z.json

Audit entry created:
- Approved by: agent-auto-approver
- Timestamp: 2026-02-08 00:45:00 UTC
```

### 4. Automated Batch Processing

**User:** "Review all finance_integration incidents and auto-approve simple field renamings"

**Claude:**
```
I'll analyze all incidents and auto-approve safe patches.

[Uses list_quarantined_incidents]
Found 2 incidents to review.

[Uses preview_incident for incident 1]
Incident 2026-01-01T17-28-20-262Z_228986:
- Simple field renamings only
- Safe to approve

[Uses approve_patch]
✓ Approved incident 1

[Uses preview_incident for incident 2]
Incident 2026-01-01T17-28-23-960Z_405123:
- TYPE_MISMATCH detected: total (number → string)
- Complex drift requires human review

Summary:
- Auto-approved: 1 incident
- Flagged for review: 1 incident (type mismatch)

I've created GitHub issue #123 for manual review of the complex drift.
```

---

## Common Incident Patterns

### Pattern 1: Simple Field Rename

**Drift:**
- FIELD_REMOVED: `username`
- FIELD_ADDED: `user_name`

**Decision:** Auto-approve
**Patch:** `{"op": "rename", "path": "username", "target": "user_name"}`

### Pattern 2: Type Mismatch

**Drift:**
- TYPE_MISMATCH: `total` (expected: number, received: string)

**Decision:** Human review required
**Action:**
1. Contact data producer
2. Verify if upstream schema changed
3. Update baseline or reject incident

### Pattern 3: New Optional Field

**Drift:**
- FIELD_ADDED: `email`

**Decision:** Depends on baseline policy
**Action:**
1. If field is optional → Approve
2. If field is required → Update baseline to include it

### Pattern 4: Multiple Complex Changes

**Drift:**
- FIELD_REMOVED: `total`
- FIELD_ADDED: `amount`
- TYPE_MISMATCH: `currency` (string → object)
- FIELD_ADDED: `metadata`

**Decision:** Human review required
**Action:**
1. Analyze business impact
2. Test patch in staging
3. Coordinate with data producer team

---

## Escalation Criteria

Escalate to human review when:

| Condition | Reason |
|-----------|--------|
| TYPE_MISMATCH detected | Type changes can break downstream processing |
| > 3 drift items | Complex multi-field changes need validation |
| Invariant violation + drift | Both structural and semantic issues |
| Unknown fields added | May contain sensitive data or breaking changes |
| Patch preview fails | Generated patch doesn't produce valid output |

---

## Troubleshooting

### Proposed patch is missing

**Solution:** Generate patch manually

```bash
# Use MCP ai-proposer or manual patch creation
# See patch-generation.md for details
```

### Patch preview fails

**Solution:** Review patch syntax

```bash
# Verify patch is valid JSON
cat proposed_patch.json | python3 -m json.tool

# Check for supported operations: rename, default, delete, retype
```

### Can't determine if patch is safe

**Solution:** Test in staging environment

```bash
# Apply patch to test payload
node scripts/test-patch.js \
  --patch quarantine/finance_integration/$INCIDENT_ID/proposed_patch.json \
  --payload quarantine/finance_integration/$INCIDENT_ID/payload.json
```

### Incident keeps recurring

**Solution:** Update baseline schema

```bash
# If same drift appears repeatedly, update baseline to match new schema
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d @new_baseline.json
```

---

## Related SOPs

- [agent-governance-automation.md](agent-governance-automation.md) - Automate approval workflows
- [patch-generation.md](patch-generation.md) - Generate and test patches
- [baseline-registration.md](baseline-registration.md) - Update integration baselines
- [mcp-server-setup.md](mcp-server-setup.md) - Configure MCP servers for agents

---

## Best Practices

1. **Review incidents daily** - Prevents backlog buildup
2. **Auto-approve only simple renamings** - Minimize risk
3. **Document escalation reasons** - Build institutional knowledge
4. **Track approval success rate** - Identify problematic integrations
5. **Update baselines proactively** - Reduce false positives

---

## Next Steps

1. Set up daily incident review schedule (cron or calendar reminder)
2. Configure agent automation: [agent-governance-automation.md](agent-governance-automation.md)
3. Monitor quarantine directory size: [health-monitoring.md](health-monitoring.md)

# Example: Automated Incident Governance

Practical example showing how an agent can automatically approve safe patches.

## Scenario
You have 50+ quarantined incidents for `user_integration`. Most are simple field renamings (`username` → `user_name`). You want to auto-approve these while flagging complex drift for human review.

## Step-by-Step Agent Workflow

### Step 1: List All Incidents
**Agent Action:**
```
Tool: list_quarantined_incidents
Input: { integration_name: "user_integration" }
```

**Response:**
```json
{
  "incidents": [
    {
      "incidentId": "2026-01-01T17-28-20-262Z_228986",
      "timestamp": "2026-01-01T17:28:20.262Z",
      "status": "QUARANTINED",
      "drift_report_ids": ["drift_0"],
      "quarantine_file": "/path/to/quarantine/..."
    },
    {
      "incidentId": "2026-01-01T17-28-23-960Z_405123",
      "timestamp": "2026-01-01T17:28:23.960Z",
      "status": "QUARANTINED",
      "drift_report_ids": ["drift_1", "drift_2"],
      "quarantine_file": "/path/to/quarantine/..."
    }
  ]
}
```

### Step 2: Preview Each Incident

**Agent Action (Incident 1):**
```
Tool: preview_incident
Input: {
  integration_name: "user_integration",
  incident_id: "2026-01-01T17-28-20-262Z_228986"
}
```

**Response:**
```json
{
  "incident": { ... },
  "diffItems": [
    { "path": "username", "changeType": "FIELD_REMOVED" },
    { "path": "user_name", "changeType": "FIELD_ADDED" }
  ],
  "driftReports": [ ... ],
  "aiProposedMapping": { "username": "user_name" },
  "patchCode": "[{\"op\":\"rename\",\"path\":\"username\",\"target\":\"user_name\"}]"
}
```

**Agent Analysis:**
- ✓ Only 2 drift items: FIELD_REMOVED + FIELD_ADDED
- ✓ No TYPE_MISMATCH
- ✓ Simple rename detected
- **Decision: Auto-approve**

### Step 3: Approve Safe Patch

**Agent Action:**
```
Tool: approve_patch
Input: {
  integration_name: "user_integration",
  incident_id: "2026-01-01T17-28-20-262Z_228986",
  approved_by: "agent-auto-approver"
}
```

**Response:**
```json
{
  "status": "approved",
  "healed_payload": { "user_name": "john_doe", ... },
  "neo4j_file": "/path/to/neo4j/...",
  "released_file": "/path/to/released/..."
}
```

**Agent Logs:**
```
✓ Approved incident 2026-01-01T17-28-20-262Z_228986
  Reason: Simple field rename (username → user_name)
  Approved by: agent-auto-approver
```

### Step 4: Flag Complex Drift

**Agent Action (Incident 2):**
```
Tool: preview_incident
Input: {
  integration_name: "user_integration",
  incident_id: "2026-01-01T17-28-23-960Z_405123"
}
```

**Response:**
```json
{
  "diffItems": [
    { "path": "total", "changeType": "TYPE_MISMATCH", "expectedType": "number", "receivedType": "string" },
    { "path": "email", "changeType": "FIELD_ADDED" }
  ]
}
```

**Agent Analysis:**
- ✗ TYPE_MISMATCH detected (number → string)
- ✗ Multiple changes (type change + new field)
- **Decision: Flag for human review**

**Agent Action:**
Create GitHub issue:
```
Title: "Complex drift detected: user_integration incident 2026-01-01T17-28-23-960Z"
Body:
- TYPE_MISMATCH: total (number → string)
- FIELD_ADDED: email
- Requires manual review before approval
```

## Complete Agent Conversation (Claude Desktop)

**User**: "Review and auto-approve safe patches for user_integration"

**Claude**: I'll analyze all quarantined incidents for user_integration and auto-approve simple renamings.

[Uses `list_quarantined_incidents`]
Found 2 incidents to review.

[Uses `preview_incident` for incident 1]
Analyzing incident `2026-01-01T17-28-20-262Z_228986`:
- FIELD_REMOVED: `username`
- FIELD_ADDED: `user_name`
Assessment: Simple field rename, safe to auto-approve.

[Uses `approve_patch`]
✓ Approved and released!
  Healed payload: `/released/user_integration/2026-01-01T17-28-20-262Z_healed.json`
  Neo4j export: `/neo4j/user_integration/2026-01-01T17-28-20-262Z.json`

[Uses `preview_incident` for incident 2]
Analyzing incident `2026-01-01T17-28-23-960Z_405123`:
- TYPE_MISMATCH: `total` (number → string)
- FIELD_ADDED: `email`
Assessment: Complex drift with type change. Requires human review.

I've created a GitHub issue for manual review: #123

**Summary**:
- Auto-approved: 1 incident (simple field rename)
- Flagged for review: 1 incident (type mismatch)

## Automation Script

For production use, you can automate this workflow:

```bash
#!/bin/bash
# auto-approve-safe-patches.sh

# Configure Claude with MCP servers
export CLAUDE_MCP_CONFIG="~/.config/Claude/claude_desktop_config.json"

# Run automated approval
claude --mcp irl-governance "Review and auto-approve safe patches for user_integration"
```

**Run as cron job:**
```cron
# Every hour: Auto-approve safe patches
0 * * * * /path/to/auto-approve-safe-patches.sh
```


# Example: Proactive Schema Validation

Practical example showing how to validate payloads in CI/CD before they reach production.

## Scenario
Your API receives payloads from external partners. Before deploying new integrations, you want to validate that:
1. No invariant violations (negative payments, missing required fields)
2. Schema matches expected baseline
3. If drift detected, generate and test patches automatically

## Step-by-Step Validation Pipeline

### Step 1: Compute Fingerprint with Invariants
**Agent Action:**
```
Tool: compute_fingerprint (irl-sentinel)
Input: {
  payload: { "user_name": "alice", "total": 150 },
  invariants: {
    "total": { "min": 0 }
  }
}
```

**Response:**
```json
{
  "fingerprint": "c8352fbb67ec6942a8b6e3f7d21e45a3",
  "normalized": {
    "type": "object",
    "properties": {
      "user_name": { "type": "string" },
      "total": { "type": "number" }
    }
  },
  "invariantViolations": []
}
```

**Agent Decision**: ✓ No violations, continue validation

### Step 2: Detect Drift Against Baseline

**Agent Action:**
```
Tool: detect_drift (irl-sentinel)
Input: {
  baseline_payload: { "username": "alice", "total": 150 },
  incoming_payload: { "user_name": "alice", "total": 150 }
}
```

**Response:**
```json
{
  "diffItems": [
    { "path": "username", "changeType": "FIELD_REMOVED" },
    { "path": "user_name", "changeType": "FIELD_ADDED" }
  ],
  "driftReports": [
    {
      "id": "drift_0",
      "impacted_path": "username",
      "severity": "INFO",
      "changeType": "FIELD_REMOVED"
    }
  ],
  "severity": "INFO"
}
```

**Agent Decision**: ⚠ Drift detected, generate patch

### Step 3: Generate Patch (Deterministic)

**Agent Action:**
```
Tool: generate_patch (irl-ai-proposer)
Input: {
  drift_reports: [ /* from detect_drift */ ],
  integration_name: "user_integration",
  use_ai: false
}
```

**Response:**
```json
{
  "patch_code": "[{\"op\":\"rename\",\"path\":\"username\",\"target\":\"user_name\"}]",
  "validation": { "valid": true }
}
```

### Step 4: Test Patch Preview

**Agent Action:**
```
Tool: apply_patch_preview (irl-ai-proposer)
Input: {
  payload: { "username": "alice", "total": 150 },
  patch_code: "[{\"op\":\"rename\",\"path\":\"username\",\"target\":\"user_name\"}]"
}
```

**Response:**
```json
{
  "healed_payload": { "user_name": "alice", "total": 150 },
  "errors": []
}
```

**Agent Decision**: ✓ Patch works correctly, deploy with confidence

## Catching Invariant Violations

### Example: Negative Payment Amount

**Agent Action:**
```
Tool: compute_fingerprint
Input: {
  payload: { "user_name": "bob", "total": -50 },
  invariants: {
    "total": { "min": 0 }
  }
}
```

**Response:**
```json
{
  "invariantViolations": [
    {
      "impacted_path": "total",
      "change_type": "INVARIANT_VIOLATION",
      "details": {
        "expected": "min: 0",
        "received": "-50"
      }
    }
  ]
}
```

**Agent Action:**
```
❌ BLOCK DEPLOYMENT
Reason: Invariant violation - negative payment amount detected
Creating incident report...
Notifying team via Slack: "Payment validation failed for partner X"
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Validate Schema with IRL

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup IRL MCP Servers
        run: |
          cd irl/mcp
          npm install

      - name: Validate Incoming Payload
        run: |
          node validate-schema.js \
            --payload ./test-payload.json \
            --integration user_integration \
            --baseline ./irl/registry/user_integration/baseline.json

      - name: Check Validation Result
        run: |
          if [ $? -eq 0 ]; then
            echo "✓ Schema validation passed"
          else
            echo "❌ Schema validation failed - blocking deployment"
            exit 1
          fi
```

### Validation Script (validate-schema.js)

```javascript
// Example validation script using MCP tools
import { exec } from 'child_process';
import fs from 'fs';

const payload = JSON.parse(fs.readFileSync(process.argv[2]));

// Step 1: Validate invariants
const fingerprintResult = await callMCPTool('irl-sentinel', 'compute_fingerprint', {
  payload,
  invariants: loadInvariants()
});

if (fingerprintResult.invariantViolations.length > 0) {
  console.error('❌ Invariant violations:', fingerprintResult.invariantViolations);
  process.exit(1);
}

// Step 2: Detect drift
const driftResult = await callMCPTool('irl-sentinel', 'detect_drift', {
  baseline_payload: loadBaseline(),
  incoming_payload: payload
});

if (driftResult.diffItems.length === 0) {
  console.log('✓ No drift detected, schema matches baseline');
  process.exit(0);
}

// Step 3: Generate and test patch
console.log('⚠ Drift detected, generating patch...');
const patchResult = await callMCPTool('irl-ai-proposer', 'generate_patch', {
  drift_reports: driftResult.driftReports,
  integration_name: 'user_integration',
  use_ai: false
});

const previewResult = await callMCPTool('irl-ai-proposer', 'apply_patch_preview', {
  payload,
  patch_code: patchResult.patch_code
});

if (previewResult.errors.length === 0) {
  console.log('✓ Patch generated and tested successfully - safe to deploy');
  process.exit(0);
} else {
  console.error('❌ Patch failed:', previewResult.errors);
  process.exit(1);
}
```

## Complete Agent Conversation (CI/CD Bot)

**CI Bot**: "Validate new payload for user_integration before deployment"

**Agent**: I'll validate the payload against baseline and invariants.

[Uses `compute_fingerprint`]
✓ Fingerprint computed: `c8352fbb67ec6942...`
✓ No invariant violations detected

[Uses `detect_drift`]
⚠ Drift detected:
- FIELD_REMOVED: `username`
- FIELD_ADDED: `user_name`

[Uses `generate_patch` (deterministic)]
✓ Patch generated: Simple field rename (`username` → `user_name`)

[Uses `apply_patch_preview`]
✓ Patch tested successfully
  Original: `{ "username": "alice", "total": 150 }`
  Healed: `{ "user_name": "alice", "total": 150 }`

**Validation Result: PASS ✓**
- Schema drift detected but automatically healed
- Patch ready for approval in quarantine
- Safe to deploy - no data loss risk

**Recommendation**: Approve patch after deployment to update baseline.


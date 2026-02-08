# SOP: Patch Generation

Generate and test patches to resolve schema drift.

## Overview

When schema drift is detected, IRL can generate patches using:
1. **Deterministic patch engine** - Safe JSON instructions for common patterns
2. **AI-powered proposer** - Claude-generated patches for complex drift

## Prerequisites

- **For deterministic:** Quarantined incident with drift report
- **For AI:** Anthropic API key and MCP servers configured

---

## Deterministic Patch Generation

### Supported Operations

| Operation | Purpose | Example |
|-----------|---------|---------|
| `rename` | Rename a field | `{"op": "rename", "path": "username", "target": "user_name"}` |
| `default` | Add default value for missing field | `{"op": "default", "path": "currency", "value": "USD"}` |
| `delete` | Remove unexpected field | `{"op": "delete", "path": "temp_field"}` |
| `retype` | Convert field type | `{"op": "retype", "path": "total", "targetType": "number"}` |

### Manual Patch Creation

```bash
# Create patch file
cat > manual-patch.json << 'EOF'
[
  {
    "op": "rename",
    "path": "amt",
    "target": "total"
  },
  {
    "op": "default",
    "path": "currency",
    "value": "USD"
  }
]
EOF
```

### Test the Patch

```bash
# Use ai-proposer MCP server to test
```

**User (in Claude Desktop):** "Test this patch on payload: {\"amt\": 100}"

**Claude:**
```
[Uses apply_patch_preview tool]

Patch instructions:
[
  {"op": "rename", "path": "amt", "target": "total"},
  {"op": "default", "path": "currency", "value": "USD"}
]

Input payload:
{"amt": 100}

Healed payload:
{"total": 100, "currency": "USD"}

✓ Patch applied successfully
```

---

## AI-Powered Patch Generation

### Use Case: Complex Drift

**Scenario:** Multiple field changes, unclear mapping

**User:** "Generate a patch for this drift report: FIELD_REMOVED: username, user_email; FIELD_ADDED: user_name, email"

**Claude:**
```
[Uses generate_patch tool with use_ai=true]

AI-generated patch:
[
  {"op": "rename", "path": "username", "target": "user_name"},
  {"op": "rename", "path": "user_email", "target": "email"}
]

Rationale: Detected semantic similarity between field names

[Uses apply_patch_preview to test]
✓ Patch validated successfully
```

### Workflow

1. Agent reads drift report
2. Calls `generate_patch(drift_reports, integration_name, use_ai=true)`
3. Tests patch with `apply_patch_preview`
4. If successful → quarantines with proposed patch
5. If fails → flags for human review

---

## Patch Safety Validation

### Validation Checklist

Before approving a patch:

- [ ] Patch preview succeeds
- [ ] Healed payload matches expected schema
- [ ] No data loss (critical fields preserved)
- [ ] Invariant rules still satisfied
- [ ] Patch is deterministic (same input → same output)

### Test Script

```bash
#!/bin/bash
# test-patch.sh

PAYLOAD='{"amt": 100, "curr": "USD"}'
PATCH='[{"op": "rename", "path": "amt", "target": "total"}, {"op": "rename", "path": "curr", "target": "currency"}]'

# Test with MCP ai-proposer
claude --mcp irl-ai-proposer \
  "Apply this patch to payload and verify: Patch: $PATCH, Payload: $PAYLOAD"
```

---

## Common Patterns

### Pattern 1: Simple Field Rename

**Drift:**
- FIELD_REMOVED: `username`
- FIELD_ADDED: `user_name`

**Patch:**
```json
[
  {"op": "rename", "path": "username", "target": "user_name"}
]
```

### Pattern 2: Missing Required Field

**Drift:**
- FIELD_REMOVED: `currency`

**Patch:**
```json
[
  {"op": "default", "path": "currency", "value": "USD"}
]
```

**Warning:** Only use `default` if default value is safe (e.g., non-financial critical fields).

### Pattern 3: Type Conversion

**Drift:**
- TYPE_MISMATCH: `total` (number → string)

**Patch:**
```json
[
  {"op": "retype", "path": "total", "targetType": "number"}
]
```

**Warning:** Type conversion can fail. Always test with representative data.

### Pattern 4: Multiple Renamings

**Drift:**
- FIELD_REMOVED: `username`, `user_email`
- FIELD_ADDED: `user_name`, `email`

**Patch:**
```json
[
  {"op": "rename", "path": "username", "target": "user_name"},
  {"op": "rename", "path": "user_email", "target": "email"}
]
```

---

## Troubleshooting

### Patch preview fails

**Solution:** Validate patch syntax

```bash
cat patch.json | python3 -m json.tool
```

Check for:
- Valid JSON
- Supported operations only
- Correct field paths

### Healed payload incorrect

**Solution:** Review drift analysis

```bash
# View drift report
cat quarantine/[integration]/[incident_id]/drift_report.json

# Ensure patch addresses ALL drift items
```

### AI-generated patch unsafe

**Solution:** Use deterministic patch instead

**User:** "Generate a deterministic patch (no AI) for field rename from 'amt' to 'total'"

**Claude:**
```
[Uses generate_patch with use_ai=false]

Deterministic patch:
[
  {"op": "rename", "path": "amt", "target": "total"}
]
```

---

## Related SOPs

- [incident-handling.md](incident-handling.md) - Approve/reject incidents
- [agent-governance-automation.md](agent-governance-automation.md) - Automate patch approval

---

## Best Practices

1. **Test before approval** - Always use `apply_patch_preview`
2. **Prefer deterministic** - AI patches for complex cases only
3. **Validate with production data** - Test patch on multiple sample payloads
4. **Document rationale** - Note why patch was generated
5. **Monitor success rate** - Track how often patches succeed

---

## Next Steps

1. Practice with simple renamings first
2. Test AI-generated patches in staging
3. Automate approval for validated patch patterns

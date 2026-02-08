# SOP: Baseline Registration

Register new integration baselines to enable schema validation.

## Overview

Before validating payloads, you must register a **baseline schema** for each integration. The baseline is a reference payload that defines:
- Expected field names and structure
- Field types
- Nesting depth
- Semantic invariants (optional)

## Prerequisites

- **Sidecar running:** IRL sidecar accessible at configured URL
- **Sample payload:** Representative valid payload for the integration
- **Invariant rules (optional):** JSON file defining semantic constraints

---

## Procedure

### 1. Prepare a Baseline Payload

Create a JSON file with a representative valid payload:

```bash
# Example: finance_integration baseline
cat > baseline-finance.json << 'EOF'
{
  "total": 100,
  "currency": "USD",
  "vendor": "Acme Corp",
  "items": []
}
EOF
```

**Guidelines:**
- Use **actual production values** (not placeholders)
- Include **all required fields**
- Use **correct types** (number, string, array, object)
- Include **nested structures** if applicable

### 2. Register the Baseline

```bash
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d @baseline-finance.json
```

**Expected Response:**
```json
{
  "status": "registered",
  "integration": "finance_integration",
  "fingerprint": "c8352fbb67ec69425f4c6b8e5fb8a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
  "timestamp": "2026-02-08T00:55:00.000Z"
}
```

### 3. Verify Registration

```bash
# Check registry directory
ls -la registry/finance_integration/

# View baseline file
cat registry/finance_integration/baseline.json
```

**Expected Output:**
```
-rw-r--r-- 1 user user 123 Feb 08 00:55 baseline.json
-rw-r--r-- 1 user user  89 Feb 08 00:55 fingerprint.json
```

### 4. Optional: Add Invariant Rules

Create invariant rules file:

```bash
cat > invariants-finance.json << 'EOF'
{
  "invariants": [
    {
      "path": "total",
      "rule": "min",
      "value": 0
    },
    {
      "path": "currency",
      "rule": "required"
    },
    {
      "path": "currency",
      "rule": "regex",
      "value": "^[A-Z]{3}$"
    }
  ]
}
EOF
```

**Supported rule types:**
- `min` / `max` - Numeric bounds
- `required` - Field must be present
- `type` - Field must be specific type
- `regex` - String must match pattern

**Register with invariants:**
```bash
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d "$(jq -s '{payload: .[0], invariants: .[1].invariants}' baseline-finance.json invariants-finance.json)"
```

---

## Expected Output

After registration:
- ✓ Baseline stored in `registry/[integration_name]/baseline.json`
- ✓ Fingerprint computed and stored
- ✓ Invariant rules stored (if provided)
- ✓ Integration ready for validation

---

## Common Use Cases

### Use Case 1: Webhook Integration

**Scenario:** Register Stripe webhook baseline

```bash
# Get sample webhook payload from Stripe
curl https://api.stripe.com/v1/events/evt_test_webhook \
  -u sk_test_...: > stripe-webhook-sample.json

# Register baseline
curl -X POST http://localhost:3000/register/stripe_webhook \
  -H "Content-Type: application/json" \
  -d @stripe-webhook-sample.json
```

### Use Case 2: ETL Pipeline

**Scenario:** Register database record baseline

```bash
# Export sample record from source database
psql -c "SELECT row_to_json(t) FROM (SELECT * FROM transactions LIMIT 1) t;" \
  > etl-transaction-baseline.json

# Register baseline
curl -X POST http://localhost:3000/register/etl_transaction \
  -H "Content-Type: application/json" \
  -d @etl-transaction-baseline.json
```

### Use Case 3: LLM Structured Output

**Scenario:** Register expected LLM output schema

```bash
# Define expected schema
cat > llm-output-baseline.json << 'EOF'
{
  "title": "Example Title",
  "summary": "Example summary text",
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.95
}
EOF

# Register with invariants
cat > llm-invariants.json << 'EOF'
{
  "invariants": [
    {"path": "title", "rule": "required"},
    {"path": "summary", "rule": "required"},
    {"path": "confidence", "rule": "min", "value": 0},
    {"path": "confidence", "rule": "max", "value": 1}
  ]
}
EOF

# Register both
curl -X POST http://localhost:3000/register/llm_structured_output \
  -H "Content-Type: application/json" \
  -d "$(jq -s '{payload: .[0], invariants: .[1].invariants}' llm-output-baseline.json llm-invariants.json)"
```

---

## Updating Baselines

### When to Update

Update baselines when:
- Upstream schema evolves (new fields added)
- Required fields change
- Data types change deliberately
- Recurring drift indicates schema mismatch

### How to Update

```bash
# Register updated baseline (overwrites previous)
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d @new-baseline.json
```

**Note:** Updating a baseline creates a new fingerprint. Previous quarantined incidents remain for audit purposes.

---

## Troubleshooting

### "Invalid JSON payload"

**Solution:** Validate JSON syntax

```bash
cat baseline.json | python3 -m json.tool
```

If syntax error, fix and retry.

### "Connection refused"

**Solution:** Ensure sidecar is running

```bash
curl http://localhost:3000/health

# If not running, start sidecar
node src/sidecar.js
```

### Baseline registered but validation fails

**Solution:** Verify baseline structure matches incoming payloads

```bash
# Compare baseline to actual payload
diff <(cat registry/finance_integration/baseline.json | jq -S .) \
     <(cat actual-payload.json | jq -S .)
```

### Invariants not enforced

**Solution:** Verify invariants were registered

```bash
cat registry/finance_integration/invariants.json
```

If missing, re-register with invariants.

---

## Best Practices

1. **Use production data** - Not fake/placeholder values
2. **Include all required fields** - Missing fields will cause false positives
3. **Test validation immediately** - Register → validate sample payload → verify it passes
4. **Version baselines** - Keep old baseline files for rollback
5. **Document schema changes** - Note why baseline was updated

---

## Related SOPs

- [api-usage.md](api-usage.md) - Use clients to validate payloads
- [incident-handling.md](incident-handling.md) - Handle schema drift
- [local-dev-setup.md](local-dev-setup.md) - Set up development environment

---

## Next Steps

1. Test validation with sample payload: [api-usage.md](api-usage.md)
2. Monitor for drift: [incident-handling.md](incident-handling.md)
3. Set up invariant rules for critical fields

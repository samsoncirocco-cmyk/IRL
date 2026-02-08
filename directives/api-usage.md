# SOP: API Usage

Use IRL Python and Java clients to validate payloads against the sidecar proxy.

## Overview

This procedure covers:
1. **Python Client** - Using `clients/python/irl.py` to validate payloads
2. **Java Client** - Using `clients/java/IrlClient.java` to validate payloads
3. **Direct HTTP API** - Raw HTTP requests for any language
4. **Common Patterns** - Integration scenarios and best practices

## Prerequisites

- **For Python:** Python 3.8+ installed
- **For Java:** JDK 11+ installed
- **Sidecar:** IRL sidecar running (or accessible at `http://localhost:3000`)
- **Integration registered:** Baseline schema registered for your integration

---

## Python Client Usage

### 1. Import the Client

```python
from clients.python.irl import Firewall, InvariantViolationError, IRLConnectionError
```

**Note:** The Python client has **zero dependencies** - uses only stdlib (`urllib`, `json`)

### 2. Create Firewall Instance

```python
# Default: connects to http://localhost:3000
firewall = Firewall()

# Custom sidecar URL
firewall = Firewall(sidecar_url="http://sidecar.example.com:3000")

# With API key (for multi-tenant deployments)
firewall = Firewall(
    sidecar_url="http://localhost:3000",
    api_key="your-api-key-here"
)
```

### 3. Validate Payloads

```python
# Example payload
payload = {
    "total": 100,
    "currency": "USD",
    "vendor": "Acme Corp"
}

try:
    # Verify against registered baseline
    firewall.verify(payload, integration_name="finance_integration")
    print("✅ Payload passed validation")
    
    # Continue with downstream processing
    process_payment(payload)
    
except InvariantViolationError as e:
    # Semantic rule violation (e.g., total < 0)
    print(f"❌ Invariant violation: {e}")
    print(f"Violations: {e.violations}")
    # Log and quarantine for review
    log_violation(payload, e.violations)
    
except IRLConnectionError as e:
    # Sidecar unreachable or returned error
    print(f"⚠️  Connection error: {e}")
    # Fallback or retry logic
    retry_with_backoff()
```

### 4. Complete Example Script

```python
#!/usr/bin/env python3
"""
Example: Validate financial transactions before processing
"""
from clients.python.irl import Firewall, InvariantViolationError, IRLConnectionError
import sys

def validate_and_process(transactions):
    firewall = Firewall("http://localhost:3000")
    
    for idx, txn in enumerate(transactions, 1):
        try:
            print(f"[{idx}/{len(transactions)}] Validating transaction {txn.get('id', 'unknown')}...")
            
            # Validate against finance_integration baseline
            firewall.verify(txn, "finance_integration")
            
            print(f"  ✅ Valid - Processing...")
            # process_transaction(txn)
            
        except InvariantViolationError as e:
            print(f"  ❌ BLOCKED - Invariant violation:")
            for violation in e.violations:
                print(f"     • {violation}")
            # Quarantined automatically by sidecar
            
        except IRLConnectionError as e:
            print(f"  ⚠️  WARNING - Sidecar error: {e}")
            # Implement retry or circuit breaker logic
            sys.exit(1)

if __name__ == "__main__":
    transactions = [
        {"id": "txn-001", "total": 100, "currency": "USD", "vendor": "Acme"},
        {"id": "txn-002", "total": -50, "currency": "USD", "vendor": "Evil Corp"},  # Violates total >= 0
        {"id": "txn-003", "total": 200, "currency": "EUR", "vendor": "Globex"}
    ]
    
    validate_and_process(transactions)
```

**Expected Output:**
```
[1/3] Validating transaction txn-001...
  ✅ Valid - Processing...
[2/3] Validating transaction txn-002...
  ❌ BLOCKED - Invariant violation:
     • Field 'total' failed rule 'min' (value: -50, expected: >= 0)
[3/3] Validating transaction txn-003...
  ✅ Valid - Processing...
```

---

## Java Client Usage

### 1. Import the Client

```java
import clients.java.IrlClient;
```

**Note:** Java client has **zero dependencies** - uses `java.net.http` (Java 11+)

### 2. Verify Payloads

```java
import clients.java.IrlClient;

public class PaymentValidator {
    public static void main(String[] args) {
        String sidecarUrl = "http://localhost:3000";
        
        // JSON payload as string
        String payload = "{\"total\": 100, \"currency\": \"USD\", \"vendor\": \"Acme Corp\"}";
        
        try {
            // Verify against finance_integration baseline
            IrlClient.verify(payload, "finance_integration", sidecarUrl);
            System.out.println("✅ Payload passed validation");
            
            // Continue with downstream processing
            processPayment(payload);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("INVARIANT_VIOLATION")) {
                System.err.println("❌ Invariant violation: " + e.getMessage());
                // Log and quarantine for review
                logViolation(payload, e.getMessage());
            } else {
                System.err.println("⚠️  Sidecar error: " + e.getMessage());
                // Retry or circuit breaker logic
                System.exit(1);
            }
        }
    }
}
```

### 3. Compile and Run

```bash
# Compile (from repository root)
javac clients/java/IrlClient.java

# Run your application
java -cp . PaymentValidator
```

**Expected Output:**
```
✅ Payload passed validation
```

---

## Direct HTTP API

### Register a Baseline

```bash
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d '{
    "total": 100,
    "currency": "USD",
    "vendor": "Acme Corp"
  }'
```

**Expected Response:**
```json
{
  "status": "registered",
  "integration": "finance_integration",
  "fingerprint": "c8352fbb67ec6942..."
}
```

### Validate a Payload

```bash
curl -X POST http://localhost:3000/validate/finance_integration \
  -H "Content-Type: application/json" \
  -d '{
    "total": 250,
    "currency": "EUR",
    "vendor": "Globex"
  }'
```

**Expected Response (Valid):**
```json
{
  "status": "PASS",
  "message": "Payload validated and released"
}
```

**Expected Response (Invariant Violation):**
```json
{
  "status": "INVARIANT_VIOLATION",
  "message": "Payload failed semantic validation",
  "violations": [
    {
      "path": "total",
      "rule": "min",
      "value": -50,
      "expected": ">= 0"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Payload valid and released
- `422 Unprocessable Entity` - Invariant violation or schema drift
- `502 Bad Gateway` - Downstream system unreachable

---

## Common Integration Patterns

### Pattern 1: Webhook Handler

```python
from flask import Flask, request, jsonify
from clients.python.irl import Firewall, InvariantViolationError

app = Flask(__name__)
firewall = Firewall("http://localhost:3000")

@app.route("/webhook/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.json
    
    try:
        # Validate against stripe_webhook baseline
        firewall.verify(payload, "stripe_webhook")
        
        # Process webhook
        process_stripe_event(payload)
        
        return jsonify({"status": "ok"}), 200
        
    except InvariantViolationError as e:
        # Sidecar quarantined the payload - return success to Stripe
        # (to prevent retries), but don't process
        log_quarantine(payload, e.violations)
        return jsonify({"status": "quarantined"}), 200
```

### Pattern 2: ETL Pipeline

```python
def etl_pipeline(source_db, target_db):
    firewall = Firewall("http://localhost:3000")
    
    # Extract
    records = source_db.query("SELECT * FROM transactions")
    
    # Transform + Validate
    for record in records:
        transformed = transform(record)
        
        try:
            firewall.verify(transformed, "etl_transaction")
            # Load only validated records
            target_db.insert(transformed)
        except InvariantViolationError:
            # Skip invalid records (quarantined by sidecar)
            continue
```

### Pattern 3: LLM Output Validation

```python
from clients.python.irl import Firewall, InvariantViolationError
import anthropic

client = anthropic.Anthropic()
firewall = Firewall("http://localhost:3000")

def generate_structured_output(prompt):
    # Get LLM response
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Parse JSON output
    llm_output = json.loads(response.content[0].text)
    
    # Validate structure before using
    try:
        firewall.verify(llm_output, "llm_structured_output")
        return llm_output
    except InvariantViolationError as e:
        # LLM output violated schema - retry with corrected prompt
        print(f"LLM output invalid: {e.violations}")
        return retry_with_better_prompt(prompt, e.violations)
```

---

## Best Practices

### 1. Register Baselines Early
```python
# Register baseline during app initialization, not per-request
firewall = Firewall("http://localhost:3000")
baseline = load_baseline_from_config("finance_integration")
# POST to /register/finance_integration once at startup
```

### 2. Handle Connection Errors Gracefully
```python
try:
    firewall.verify(payload, "integration_name")
except IRLConnectionError:
    # Implement circuit breaker or fallback
    if circuit_breaker.is_open():
        bypass_validation()  # Temporary bypass
    else:
        retry_with_exponential_backoff()
```

### 3. Use Integration-Specific Names
```python
# Good: Specific integration names
firewall.verify(stripe_webhook, "stripe_webhook")
firewall.verify(salesforce_lead, "salesforce_lead_sync")

# Bad: Generic names that don't scale
firewall.verify(payload, "generic_webhook")
```

### 4. Log Violations for Analysis
```python
except InvariantViolationError as e:
    logger.warning(
        "IRL quarantine",
        extra={
            "integration": "finance_integration",
            "violations": e.violations,
            "payload_hash": hashlib.sha256(json.dumps(payload).encode()).hexdigest()
        }
    )
```

---

## Troubleshooting

### "Connection refused" error

**Solution:** Sidecar is not running

```bash
# Check if sidecar is running
curl http://localhost:3000/health

# If not, start sidecar
node src/sidecar.js

# Or check URL is correct
firewall = Firewall(sidecar_url="http://correct-host:3000")
```

### "Integration not found"

**Solution:** Baseline not registered

```bash
# Register baseline first
curl -X POST http://localhost:3000/register/your_integration \
  -H "Content-Type: application/json" \
  -d '{"example": "payload"}'
```

### "API key required"

**Solution:** Multi-tenant sidecar requires API key

```python
firewall = Firewall(
    sidecar_url="http://localhost:3000",
    api_key="your-api-key"
)
```

### Python: "ImportError: No module named irl"

**Solution:** Run from repository root or add to PYTHONPATH

```bash
# From repository root
python3 -c "from clients.python.irl import Firewall"

# Or add to PYTHONPATH
export PYTHONPATH=/path/to/irl:$PYTHONPATH
```

### Java: "class file has wrong version"

**Solution:** Client requires Java 11+ for `java.net.http`

```bash
# Check Java version
java -version  # Should be 11 or higher

# Update Java if needed
sudo apt install openjdk-11-jdk
```

---

## Related SOPs

- [baseline-registration.md](baseline-registration.md) - Register integration baselines
- [incident-handling.md](incident-handling.md) - Review quarantined payloads
- [local-dev-setup.md](local-dev-setup.md) - Set up development environment

---

## Next Steps

1. Register your first baseline: [baseline-registration.md](baseline-registration.md)
2. Test validation with sample payloads
3. Integrate into your application using patterns above
4. Set up incident handling workflow: [incident-handling.md](incident-handling.md)

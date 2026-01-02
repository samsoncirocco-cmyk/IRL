# IRL Python SDK

A thin, zero-dependency wrapper for the Integration Resilience Layer (IRL).

## Installation

Copy `irl.py` into your project. Requires Python 3.10+ and `requests`.

## Quick Start

### Authentication

The IRL Sidecar requires an `X-IRL-API-KEY`. This key is used to identify your tenant and enforce scope-based access controls.

```python
from irl import Firewall, InvariantViolationError

# Initialize the firewall with the Sidecar URL and your API Key
# Note: Ensure YOUR_API_KEY has 'write' scope for /verify calls
firewall = Firewall("http://localhost:3000", api_key="tenant_a_key")

try:
    payload = { "user_id": "123", "total": 100.0 }
    
    # Verify data against 'my_integration' baseline
    firewall.verify(payload, "my_integration")
    print("Verification passed!")
    
except InvariantViolationError as e:
    print(f"Data Quarantined: {e}")
except Exception as e:
    print(f"Connection Error: {e}")
```

## Migration Guide

If you are upgrading from a pre-authenticated version of IRL:
1. Update your `Firewall` initialization to include the `api_key`.
2. Ensure your Sidecar is running with `config/tenants.json` correctly configured.

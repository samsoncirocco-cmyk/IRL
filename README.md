# IRL: Integration Resilience Layer

IRL acts as an AI Output Firewall, sitting between data producers (LLMs) and your Systems of Record. It prevents "confidently wrong" AI data from corrupting your database by enforcing structural fingerprints and semantic invariants.

## Universal Governance

IRL provides a **Universal Connector Suite** to allow any downstream service to verify data against the centralized Sidecar. By delegating validation to the Sidecar, your client code remains a "Thin Wrapper" while benefiting from deep invariant checking.

### Client Comparison: Blocking Negative Totals

Both clients reject the same invalid payload (`{ "total": -10 }`) by raising a native exception when the Sidecar returns `422 Unprocessable Entity`.

| Feature | Python (Data Science) | Java (Enterprise / Neo4j) |
| :--- | :--- | :--- |
| **Usage** | Native `try/except` | Native `try/catch` |
| **Networking** | Standard `urllib` (Zero-Dep) | `java.net.http` (Since Java 11) |
| **Logic Location** | Node.js Sidecar | Node.js Sidecar |

#### Python Example
```python
from irl import Firewall, InvariantViolationError

firewall = Firewall("http://localhost:3000")

try:
    # ❌ This payload will be blocked by the Sidecar
    firewall.verify({ "total": -10 }, "finance_integration")
except InvariantViolationError as e:
    print(f"Shields Up! Blocked: {e}")
```

#### Java Example
```java
import clients.java.IrlClient;

try {
    // ❌ This payload will be blocked by the Sidecar
    IrlClient.verify("{\"total\": -10}", "finance_integration", "http://localhost:3000");
} catch (RuntimeException e) {
    if (e.getMessage().contains("Invariant Violation")) {
        System.out.println("Shields Up! Blocked: " + e.getMessage());
    }
}
```

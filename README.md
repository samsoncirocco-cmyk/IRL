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

## Architecture Validation

IRL includes an **autonomous architecture validation agent** that performs regular design reviews to ensure the codebase remains aligned with the pitched architecture.

### Features

- **Automated Reviews**: Runs weekly via GitHub Actions or cron
- **Principal Engineer Perspective**: Evaluates technical alignment, gaps, and risks
- **Enterprise Readiness**: Tests against Fortune 500 buyer objections
- **Compliance Checks**: Validates security and privacy claims
- **Automated Reporting**: Generates detailed markdown reports with verdicts

### Quick Start

**Manual Run:**
```bash
export ANTHROPIC_API_KEY='your_key_here'
node agents/architecture-validator.js
```

**GitHub Actions:**
- Runs automatically weekly (Mondays 9 AM UTC)
- Manual trigger via Actions tab
- Auto-generates issues for critical findings

**Cron Job:**
```bash
# Add to crontab for weekly validation
0 9 * * 1 /path/to/code_irl/agents/cron-scheduler.sh
```

### Documentation

- [Agent Overview](agents/README.md) - How the agent works
- [Deployment Guide](agents/DEPLOYMENT.md) - Setup instructions
- [Latest Report](agents/reports/architecture-validation-latest.md) - Most recent validation

---

For more information, see the [Master Plan](IRL_MASTER_PLAN.md) and [Contributing Guidelines](CONTRIBUTING.md).

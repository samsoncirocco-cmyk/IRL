# IRL: Integration Resilience Layer

IRL is a **Deterministic Schema Governance** solution that sits between data producers and your Systems of Record. It prevents "confidently wrong" data and unexpected schema drift from corrupting your database by enforcing structural fingerprints and semantic invariants.

- **Structural Fingerprinting**: Detects schema changes at the field and type level.
- **Zero-Knowledge Privacy**: Strips PII before storage, keeping your audit logs secure.
- **Deterministic Healing**: Uses safe JSON mapping to resolve drift without custom code.

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

## Agent-Driven Governance (MCP Servers)

IRL provides a suite of **MCP (Model Context Protocol) Servers** for agent-driven governance and monitoring. This enables Claude Desktop and custom agents to autonomously manage schema drift incidents, validate payloads, and monitor system health.

- **`irl-governance`**: Manage incident workflows (list, preview, approve, reject).
- **`irl-sentinel`**: Proactive schema validation and health monitoring.
- **`irl-ai-proposer`**: Patch generation (deterministic or AI-powered) and safe preview execution.

### Features

- **Agent Automation**: Agents can list, preview, approve, or reject incidents programmatically
- **Zero Setup**: Works immediately with Claude Desktop - no UI needed
- **Resource Access**: URI-based access to quarantine, released, and Neo4j exports
- **Audit Trail**: All agent actions logged with `approved_by` attribution

### Quick Start

**1. Install MCP Server:**
```bash
cd irl/mcp
npm install
```

**2. Configure Claude Desktop:**

Add to `~/.config/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "irl-governance": {
      "command": "node",
      "args": ["/Applications/Samson Stuff/code_irl/irl/mcp/governance-server.js"]
    },
    "irl-sentinel": {
      "command": "node",
      "args": ["/Applications/Samson Stuff/code_irl/irl/mcp/sentinel-server.js"]
    },
    "irl-ai-proposer": {
      "command": "node",
      "args": ["/Applications/Samson Stuff/code_irl/irl/mcp/ai-proposer-server.js"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

**3. Restart Claude Desktop and test:**
```
Agent: List all quarantined incidents for user_integration
Agent: Preview incident 2026-01-01T17-28-20-262Z_0
Agent: Approve patch with approved_by='agent-auto-approver'
```

### Available Tools

#### Governance Tools (`irl-governance`)
- `list_quarantined_incidents` - List all incidents for an integration
- `preview_incident` - View drift reports and AI-proposed patches
- `approve_patch` - Approve and release healed payloads
- `reject_incident` - Reject and archive unsafe patches

#### Sentinel Tools (`irl-sentinel`)
- `compute_fingerprint` - Structural fingerprinting with optional invariants
- `detect_drift` - Detect drift between baseline and incoming payloads
- `validate_invariants` - Validate payload against integration invariants
- `strip_pii` - Zero-knowledge PII stripping

#### AI Proposer Tools (`irl-ai-proposer`)
- `generate_patch` - Generate patch from drift reports (deterministic or AI)
- `validate_patch` - Validate patch syntax
- `apply_patch_preview` - Safely preview patch execution

### Documentation

- [MCP Server README](irl/mcp/README.md) - Full tool reference and examples
- [Agent Workflows](docs/MCP_WORKFLOWS.md) - Common automation patterns
- [Governance Example](examples/agent-governance.md) - Automated approval
- [Validation Example](examples/agent-validation.md) - CI/CD integration
- [Validation Plan](docs/VALIDATION_PLAN.md) - 90-day plan to validate strategic claims
- [Proof Points](docs/PROOF_POINTS.md) - Evidence-based proof points for fundraising

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

<p align="center">
  <h1 align="center">🛡️ IRL — Integration Resilience Layer</h1>
  <p align="center">
    <strong>Deterministic Schema Governance for Mission-Critical Integrations</strong>
  </p>
  <p align="center">
    Stop silent data corruption before it hits production.<br/>
    Language-agnostic · Agent-native · Zero-trust by default
  </p>
</p>

---

## The Problem

Every integration is a liability. SaaS webhooks change schemas without notice. Partner APIs drift silently. LLM outputs are structurally unpredictable. By the time you discover corrupted data in production, the damage is done — broken reports, angry customers, expensive rollbacks.

**IRL eliminates this entire class of failure.**

It sits as a sidecar proxy between data producers (webhooks, APIs, LLMs) and your systems of record (databases, ERPs, Neo4j), enforcing structural fingerprints and semantic invariants on every payload — before it touches production.

## Key Capabilities

| Capability | What It Does |
|:---|:---|
| **Structural Fingerprinting** | Detects schema changes at the field and type level — catches drift the moment it appears |
| **Semantic Invariants** | Enforces business rules (`total >= 0`, required fields, regex patterns) as governance-as-code |
| **Quarantine & Heal** | Broken payloads are quarantined, not dropped — deterministic healing resolves drift without custom code |
| **Zero-Knowledge Privacy** | PII is stripped and stored as SHA-256 checksums — audit logs never contain raw sensitive data |
| **Agent-Native Governance** | MCP servers enable Claude Desktop and custom agents to autonomously triage schema drift incidents |
| **Universal Connectors** | Python, Java, and any HTTP client can validate through the sidecar — your app code stays thin |

## Quick Start

### 1. Run the Sidecar

```bash
git clone https://github.com/your-org/irl.git
cd irl
npm install
node src/sidecar.js
# → Sidecar listening on http://localhost:3000
```

### 2. Register a Baseline

```bash
curl -X POST http://localhost:3000/register/finance_integration \
  -H "Content-Type: application/json" \
  -d '{"total": 100, "currency": "USD", "vendor": "Acme Corp"}'
```

### 3. Validate Incoming Payloads

```bash
# ✅ This passes — matches the baseline schema
curl -X POST http://localhost:3000/validate/finance_integration \
  -H "Content-Type: application/json" \
  -d '{"total": 250, "currency": "EUR", "vendor": "Globex"}'

# ❌ This is quarantined — schema drift detected
curl -X POST http://localhost:3000/validate/finance_integration \
  -H "Content-Type: application/json" \
  -d '{"amount": -10, "curr": "USD"}'
```

### 4. Verify from Any Language

**Python:**
```python
from irl import Firewall, InvariantViolationError

firewall = Firewall("http://localhost:3000")

try:
    firewall.verify({"total": -10}, "finance_integration")
except InvariantViolationError as e:
    print(f"Blocked: {e}")
```

**Java:**
```java
import clients.java.IrlClient;

try {
    IrlClient.verify("{\"total\": -10}", "finance_integration", "http://localhost:3000");
} catch (RuntimeException e) {
    System.out.println("Blocked: " + e.getMessage());
}
```

Both clients are zero-dependency thin wrappers — all validation logic lives in the sidecar.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Data Producers                            │
│          SaaS Webhooks · Partner APIs · LLM Outputs              │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTP/JSON
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    IRL Sidecar Proxy                              │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐    │
│  │ Fingerprint  │ │  Invariant   │ │   Zero-Knowledge       │    │
│  │   Engine     │ │  Enforcer    │ │   PII Stripper         │    │
│  └──────┬──────┘ └──────┬───────┘ └────────┬───────────────┘    │
│         │               │                   │                    │
│  ┌──────▼───────────────▼───────────────────▼───────────────┐    │
│  │              Quarantine / Heal Pipeline                    │    │
│  │    drift detected → quarantine → patch → heal → release   │    │
│  └──────────────────────┬───────────────────────────────────┘    │
└──────────────────────────┼───────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────┐ ┌────────┐ ┌──────────┐
     │  Systems of   │ │ Neo4j  │ │  Audit   │
     │    Record     │ │ Graph  │ │   Logs   │
     └──────────────┘ └────────┘ └──────────┘
```

For a detailed breakdown of the tech stack, data flows, and component design, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Agent-Driven Governance (MCP)

IRL provides three **MCP (Model Context Protocol) servers** that let Claude Desktop and custom agents autonomously manage governance workflows:

| Server | Tools | Purpose |
|:---|:---|:---|
| **irl-governance** | `list_quarantined_incidents`, `preview_incident`, `approve_patch`, `reject_incident` | Incident lifecycle management |
| **irl-sentinel** | `compute_fingerprint`, `detect_drift`, `validate_invariants`, `strip_pii` | Proactive schema validation |
| **irl-ai-proposer** | `generate_patch`, `validate_patch`, `apply_patch_preview` | Deterministic & AI-powered patch generation |

**Why agents?** Agents review 50 incidents in 30 seconds vs. 60 minutes manually. In testing, 87% of incidents were auto-approved as safe patterns, freeing engineers to focus on the 13% that actually need human judgment.

```bash
# Install and configure
cd irl/mcp && npm install
# Add servers to ~/.config/Claude/claude_desktop_config.json
# See docs/MCP_WORKFLOWS.md for complete setup
```

## Feature Highlights

- **Governance as Code** — Define invariants in JSON, enforce everywhere, no app code changes
- **Deterministic Healing** — Safe JSON-instruction-based patching (no `eval`, no `vm.Script`)
- **Polyglot by Design** — Python, Java, or any HTTP client; the sidecar is the single source of truth
- **Cloud-Native Ready** — TLS, health probes (`/health`, `/ready`), rate limiting, graceful shutdown
- **Enterprise Auth** — API key middleware with tenant isolation
- **Observability** — P95 latency tracking, structured audit logging, financial risk metrics
- **Architecture Validation** — Autonomous agent runs weekly design reviews against enterprise buyer objections

## Documentation

| Document | Description |
|:---|:---|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Tech stack, component design, data flows |
| **[IRL_MASTER_PLAN.md](IRL_MASTER_PLAN.md)** | Roadmap, progress tracker, strategic decisions |
| **[COMPETITIVE_LANDSCAPE.md](COMPETITIVE_LANDSCAPE.md)** | Market positioning and competitor analysis |
| **[PRICING_STRATEGY.md](PRICING_STRATEGY.md)** | Three-tier pricing model (Free → Scale → Enterprise) |
| **[PERSONAS.md](PERSONAS.md)** | Ideal customer profiles — The Overwhelmed SRE & The AI Engineer |
| **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** | Next steps for product, marketing, and community |
| **[docs/](docs/README.md)** | Full documentation index |
| **[features/](features/)** | Feature proposals and specs |
| **[marketing/](marketing/)** | Launch plan, copy examples, GTM materials |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute, patch review protocol |
| **[CHANGELOG.md](CHANGELOG.md)** | Release history |

## Project Status

IRL is in **active development** — the core sidecar, fingerprinting engine, invariant enforcer, quarantine pipeline, MCP servers, and multi-language clients are functional. See the [Master Plan](IRL_MASTER_PLAN.md) for the full roadmap.

**Current phase:** Production stability hardening (TLS, health probes, rate limiting, graceful shutdown).

## License

See [LICENSE](LICENSE) for details.

---

<p align="center">
  <em>IRL: Because your data deserves a seatbelt, not a prayer.</em>
</p>

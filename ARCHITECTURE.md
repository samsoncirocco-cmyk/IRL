# IRL Architecture

This document describes the technical architecture of the Integration Resilience Layer — how the components connect, what each layer does, and the design principles behind the system.

## Design Philosophy

IRL follows four non-negotiable principles:

1. **Language-Agnostic** — The sidecar is the only runtime. Clients are thin wrappers over HTTP.
2. **Deterministic** — All fingerprints are key-sorted. All healing uses safe JSON instructions. No `eval`, no `vm.Script`.
3. **Zero-Trust** — Raw PII never reaches audit logs. Only structural diffs are sent to LLMs.
4. **Non-Destructive** — Quarantined payloads are never deleted. Every decision is forensically auditable.

---

## System Overview

```
                     ┌─────────────────────────────┐
                     │       Data Producers         │
                     │  Webhooks · APIs · LLMs      │
                     └─────────────┬───────────────┘
                                   │ HTTP/JSON
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       IRL Sidecar Proxy                         │
│                       (Node.js · HTTP)                          │
│                                                                 │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐             │
│  │ Auth      │──▶│ Fingerprint│──▶│  Invariant   │             │
│  │ Middleware │   │ Engine     │   │  Enforcer    │             │
│  └───────────┘   └────────────┘   └──────┬───────┘             │
│                                          │                      │
│                              ┌───────────┴───────────┐          │
│                              │                       │          │
│                         PASS ▼                  FAIL ▼          │
│                    ┌──────────────┐       ┌──────────────┐      │
│                    │   Release    │       │  Quarantine  │      │
│                    │   Pipeline   │       │  Pipeline    │      │
│                    └──────┬───────┘       └──────┬───────┘      │
│                           │                      │              │
│                           │               ┌──────▼───────┐      │
│                           │               │  Heal/Patch  │      │
│                           │               │  Engine      │      │
│                           │               └──────┬───────┘      │
│                           │                      │              │
│                    ┌──────▼──────────────────────▼───────┐      │
│                    │         PII Stripper                 │      │
│                    │    (SHA-256 checksums only)          │      │
│                    └──────┬──────────────────────┬───────┘      │
│                           │                      │              │
└───────────────────────────┼──────────────────────┼──────────────┘
                            │                      │
               ┌────────────┼──────────┬───────────┘
               ▼            ▼          ▼
        ┌───────────┐ ┌─────────┐ ┌──────────┐
        │ Systems   │ │  Neo4j  │ │  Audit   │
        │ of Record │ │  Graph  │ │  Logs    │
        │ (DB/ERP)  │ │  Store  │ │  (JSON)  │
        └───────────┘ └─────────┘ └──────────┘
```

---

## Core Components

### 1. Sidecar Proxy (`src/sidecar.js`)

The central HTTP server that intercepts all payloads. Every integration request flows through here.

- **Runtime:** Node.js (single-threaded, event-loop — chosen for JSON processing speed and low overhead)
- **Protocol:** HTTP/JSON (with TLS support for production)
- **Endpoints:**
  - `POST /register/:integration` — Register a baseline schema
  - `POST /validate/:integration` — Validate an incoming payload against the baseline
  - `GET /health` — Kubernetes liveness probe
  - `GET /ready` — Kubernetes readiness probe

**Why a sidecar?** The sidecar pattern keeps governance out of application code. Teams don't need to learn a new SDK or change their language — they just point HTTP traffic through IRL.

### 2. Fingerprint Engine (`src/utils/crypto.js`)

Computes structural fingerprints of payloads — a deterministic hash of the field names, types, and nesting structure (not values).

- **Algorithm:** Key-sorted recursive traversal → SHA-256 hash
- **What it captures:** Field names, types, nesting depth, array element types
- **What it ignores:** Actual data values (zero-knowledge by design)

When a new payload arrives, its fingerprint is compared against the registered baseline. Any divergence is flagged as **schema drift**.

### 3. Invariant Enforcer

Evaluates semantic rules defined in `invariants.json` against incoming payloads.

**Supported rule types:**
- `min` / `max` — Numeric bounds (e.g., `total >= 0`)
- `required` — Field must be present
- `type` — Field must be a specific type
- `regex` — String must match a pattern
- `timeout` — Request timeout enforcement (see [features/timeout-invariant.md](features/timeout-invariant.md))

**Example `invariants.json`:**
```json
{
  "invariants": [
    { "path": "total", "rule": "min", "value": 0 },
    { "path": "currency", "rule": "required" },
    { "path": "email", "rule": "regex", "value": "^.+@.+\\..+$" }
  ]
}
```

Invariants are checked after fingerprinting. A payload can match the structural fingerprint but still fail invariant checks (e.g., correct schema, but `total = -10`).

### 4. Quarantine Pipeline

Payloads that fail fingerprinting or invariant checks are quarantined — stored on disk with full metadata for later review.

**Storage structure:**
```
quarantine/
└── finance_integration/
    ├── 2026-01-15T10-30-00-000Z_0/
    │   ├── payload.json        # Original payload (PII-stripped)
    │   ├── drift_report.json   # What changed vs. baseline
    │   └── proposed_patch.json # Auto-generated healing instructions
    └── ...
```

Quarantined payloads are **never deleted** — they form a forensic audit trail.

### 5. Heal/Patch Engine (`src/safeMapper.js`)

Generates and applies deterministic patches to resolve schema drift.

- **Patch format:** JSON instructions (rename, retype, default, delete)
- **Execution model:** `safeMapper.applyInstructions()` — a restricted instruction interpreter
- **No dynamic code execution** — patches are data, not code

**Example patch:**
```json
[
  { "op": "rename", "from": "amt", "to": "total" },
  { "op": "default", "path": "currency", "value": "USD" }
]
```

For complex drift that can't be resolved deterministically, the AI Proposer (MCP server) can generate patches using Claude, but they're still validated through the safe instruction engine.

### 6. PII Stripper (`src/utils/crypto.js`)

Before any payload is stored (quarantine, audit log, or release), PII is stripped and replaced with SHA-256 checksums.

- **Detection:** Pattern-based (email, phone, SSN, names in known fields)
- **Replacement:** `sha256(value)` — allows matching without exposing raw data
- **Guarantee:** Audit logs and quarantine files never contain raw PII

### 7. Auth Middleware (`src/middleware/auth.js`)

API key-based authentication with tenant isolation.

- **Per-tenant keys** — each tenant has a unique API key
- **Rate limiting** — per-tenant request throttling to prevent baseline poisoning
- **Scope:** Guards all sidecar endpoints

---

## Client SDKs

Clients are intentionally **thin wrappers** — they format HTTP requests and parse responses. All logic lives in the sidecar.

| Client | Location | Runtime | Dependencies |
|:---|:---|:---|:---|
| Python | `clients/python/irl.py` | Python 3.x | Zero (uses `urllib`) |
| Java | `clients/java/IrlClient.java` | Java 11+ | Zero (uses `java.net.http`) |

**Adding a new language client** requires only: HTTP POST to sidecar, parse JSON response, throw exception on 422.

---

## MCP Servers (Agent Interface)

Three MCP servers expose IRL's capabilities to AI agents via the Model Context Protocol.

```
┌───────────────────────┐     ┌──────────────────────────┐
│   Claude Desktop /    │     │   IRL MCP Servers        │
│   Custom Agents       │────▶│                          │
│                       │ MCP │  ┌─ governance-server    │
└───────────────────────┘     │  ├─ sentinel-server      │
                              │  └─ ai-proposer-server   │
                              └─────────┬────────────────┘
                                        │ calls
                                        ▼
                              ┌──────────────────────────┐
                              │   IRL Core Libraries     │
                              │   (same code as sidecar) │
                              └──────────────────────────┘
```

| Server | File | Tools | Purpose |
|:---|:---|:---|:---|
| **irl-governance** | `irl/mcp/governance-server.js` | 4 tools, 3 resources | Incident lifecycle (list → preview → approve/reject) |
| **irl-sentinel** | `irl/mcp/sentinel-server.js` | 4 tools, 3 resources | Proactive validation (fingerprint, drift, invariants, PII strip) |
| **irl-ai-proposer** | `irl/mcp/ai-proposer-server.js` | 3 tools, 2 resources | Patch generation (deterministic or AI-assisted) |

MCP servers reuse the same core libraries as the sidecar — they're a different interface to the same engine.

---

## Architecture Validator (`agents/architecture-validator.js`)

An autonomous agent that runs weekly design reviews to check whether the codebase still matches the pitched architecture.

- **Perspective:** Principal Engineer evaluating for F500 enterprise readiness
- **Checks:** Technical alignment, compliance claims, security boundaries, gap analysis
- **Output:** Markdown reports with verdicts (`PASS` / `WARNING` / `CRITICAL`)
- **Automation:** GitHub Actions (weekly) or cron

---

## Website (`website/`)

Marketing and product website built with Vite.

| Page | Purpose |
|:---|:---|
| `index.html` | Landing page, value proposition |
| `features.html` | Feature deep-dive |
| `pricing.html` | Three-tier pricing |
| `dashboard.html` | Product dashboard preview |
| `blog.html` | Blog index |
| `community.html` | Community hub |

**Stack:** Vite + vanilla HTML/CSS/JS (no framework — fast, simple, easy to deploy)

---

## Data Flow: End-to-End

Here's what happens when a webhook payload arrives:

```
1. RECEIVE    Webhook sends POST to sidecar /validate/:integration
2. AUTH       API key validated, tenant identified
3. STRIP      PII removed from payload (replaced with SHA-256)
4. FINGERPRINT  Structural hash computed, compared to baseline
5. INVARIANTS   Semantic rules evaluated (min, max, required, etc.)
6. DECIDE
   ├── PASS   → Payload released to downstream systems of record
   └── FAIL   → Payload quarantined with drift report + proposed patch
7. LOG        Audit entry written (PII-free, timestamped, attributed)
8. HEAL       (If quarantined) Patch can be auto-approved by agent or reviewed by human
9. RELEASE    Healed payload released to downstream + Neo4j graph export
```

---

## Deployment Model

IRL is designed to run as a **sidecar** — one instance per service or shared across an environment.

**Local development:**
```bash
node src/sidecar.js  # Runs on localhost:3000
```

**Kubernetes:**
```yaml
# Sidecar container in your pod
- name: irl-sidecar
  image: irl:latest
  ports:
    - containerPort: 3000
  livenessProbe:
    httpGet:
      path: /health
      port: 3000
  readinessProbe:
    httpGet:
      path: /ready
      port: 3000
```

**Cloud-native features:**
- TLS/HTTPS support
- Health probes (`/health`, `/ready`)
- Graceful shutdown on `SIGTERM`
- Per-tenant rate limiting

---

## Directory Structure

```
IRL/
├── src/                     # Core sidecar source
│   ├── sidecar.js           # Main HTTP server
│   ├── safeMapper.js        # Deterministic patch engine
│   ├── utils/
│   │   └── crypto.js        # Fingerprinting + PII stripping
│   └── middleware/
│       └── auth.js          # API key + tenant isolation
│
├── irl/mcp/                 # MCP servers for agent governance
│   ├── governance-server.js
│   ├── sentinel-server.js
│   └── ai-proposer-server.js
│
├── clients/                 # Language SDKs (thin wrappers)
│   ├── python/irl.py
│   └── java/IrlClient.java
│
├── agents/                  # Architecture validation agent
│   ├── architecture-validator.js
│   └── reports/
│
├── registry/                # Baseline schemas + invariant rules
├── quarantine/              # Quarantined payloads (never deleted)
├── released/                # Healed and released payloads
├── patches/                 # Experimental patch files
│
├── website/                 # Vite marketing site
├── blog/                    # Blog post source (markdown)
├── marketing/               # GTM materials
├── features/                # Feature proposals
├── docs/                    # Extended documentation
├── examples/                # Agent workflow examples
├── scripts/                 # Utility scripts (golden_path, metrics)
│
├── README.md                # Product overview & quick start
├── ARCHITECTURE.md          # This file
├── IRL_MASTER_PLAN.md       # Roadmap & progress tracker
├── COMPETITIVE_LANDSCAPE.md # Market analysis
├── PRICING_STRATEGY.md      # Pricing model
├── PERSONAS.md              # Ideal customer profiles
├── RECOMMENDATIONS.md       # Strategic next steps
├── CONTRIBUTING.md          # Contribution guidelines
└── CHANGELOG.md             # Release history
```

---

## Security Model

| Layer | Mechanism |
|:---|:---|
| **Transport** | TLS/HTTPS (configurable) |
| **Authentication** | Per-tenant API keys |
| **Authorization** | Tenant isolation — each tenant sees only their integrations |
| **Privacy** | PII stripped before storage (SHA-256 checksums only) |
| **Execution Safety** | No `eval()`, no `vm.Script` — only JSON instruction engine |
| **Rate Limiting** | Per-tenant throttling to prevent baseline poisoning |
| **Audit** | Every action logged with timestamp, actor, and decision |

---

## Technology Choices

| Choice | Rationale |
|:---|:---|
| **Node.js** | Native JSON processing, event-loop efficiency for proxy workloads, npm ecosystem for MCP SDK |
| **HTTP/JSON** | Universal protocol — any language can integrate with zero dependencies |
| **SHA-256** | Deterministic, collision-resistant, standard — no exotic crypto |
| **JSON Instructions** | Patches as data (not code) — auditable, safe, deterministic |
| **MCP** | Anthropic's Model Context Protocol — emerging standard for agent tooling |
| **Vite** | Fast dev server, zero-config builds for the marketing site |
| **No ORM / No Framework** | Minimal dependencies = smaller attack surface, fewer upgrade headaches |

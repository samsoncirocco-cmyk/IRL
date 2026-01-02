# IRL Changelog

All notable changes to the Integration Resilience Layer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **MCP Server Suite**: Agent-native governance platform
  - `irl-governance` server (4 tools): Incident management workflows
  - `irl-sentinel` server (4 tools): Schema validation and health monitoring
  - `irl-ai-proposer` server (3 tools): Patch generation and safe preview
  - 8 resource URI patterns for quarantine, released, Neo4j, registry access
- Agent workflow documentation (`docs/MCP_WORKFLOWS.md`)
- Validation plan and proof points (`docs/VALIDATION_PLAN.md`, `docs/PROOF_POINTS.md`)
- Example agent workflows (`examples/agent-governance.md`, `examples/agent-validation.md`)
- Metrics analyzer script (`scripts/analyze-agent-metrics.js`)
- Registry documentation with schema definitions and governance workflow
- CHANGELOG.md for tracking project milestones

### Changed
- Strategic pivot: Replaced Governance UI plan with MCP server implementation
- Updated IRL_MASTER_PLAN.md with MCP completion status and strategic benefits
- Enhanced README.md with MCP server documentation and agent workflows
- Updated CLAUDE.md to reflect Python SDK modernization (requests, Python 3.10+)

## [0.3.0] - 2025-12-31

### Added
- **Universal Connector Suite**: Multi-language SDK architecture
- Python SDK (`clients/python/irl.py`) with zero-dependency `urllib` implementation
- Java SDK (`clients/java/IrlClient.java`) using native `java.net.http` (Java 11+)
- Git worktree architecture for isolated SDK development
- Registry symlinks in both SDK worktrees for centralized invariant management
- Team Topology documentation (MISSION_CONTROL.md, CLAUDE.md, GEMINI.md)
- CONTRIBUTING.md with AI patch review protocol

### Changed
- README.md updated with Universal Governance section and client comparison table
- Repository structure reorganized for multi-agent collaboration

## [0.2.0] - 2025-12-31

### Added
- **Universal Sidecar** (Step 7): Express-based HTTP proxy on port 3000
- Status gate returning 200 OK for healthy data, 422 for violations
- Integration routing via `/:integrationName` URL parameters
- Semantic invariant enforcement with `invariants.json` support
- Neo4j Release Bridge for graph database integration
- Virtual Patching system (AI Proposer + Patch Manager)

### Changed
- Governance CLI enhanced with Neo4j export functionality
- Sidecar now loads and applies runtime patches before validation

## [0.1.0] - 2025-12-30

### Added
- **Phase 1: Observability Foundation**
  - Sentinel module (`src/sentinel.js`) for deterministic structural fingerprinting
  - Drift Factory (`src/driftReport.js`) with INFO/WARN/BLOCK severity grading
  - NDJSON audit logging for corruption-resistant event tracking
- **Phase 2: Multi-Tenant Registry**
  - Registry scoping with `registry/[integration]/baseline.json` structure
  - Manifest tracking (`registry/manifest.json`) for last_healthy_sync timestamps
  - Governance CLI (`src/governance.js`) for Review & Release workflow
- Initial project structure and documentation (WARP.md, IRL_MASTER_PLAN.md)

### Technical Details
- Node.js runtime with Express framework
- SHA-256 fingerprinting for structural validation
- JSON pointer-style path tracking for drift reports
- Quarantine directory for invalid payloads

## Project Milestones

### ✅ Completed
- [x] Sentinel: Deterministic fingerprinting engine
- [x] Drift Detection: Structural and semantic validation
- [x] Multi-Tenant Registry: Baseline and invariant management
- [x] Universal Sidecar: HTTP verification proxy
- [x] Multi-Language SDKs: Python and Java clients
- [x] Worktree Architecture: Isolated SDK development
- [x] Virtual Patching: AI-assisted remediation
- [x] MCP Server Suite: Agent-native governance platform (3 servers, 11 tools)

### 🚀 In Progress
- [ ] MCP server validation: 90-day plan to validate agent automation claims
- [ ] Integration test suite with automated CI/CD
- [ ] Impact Dashboard (Step 9): Financial risk metrics
- [ ] Agentic Negotiation (Step 12): Auto-draft API provider emails

### 📋 Planned
- [ ] C# SDK for .NET/Azure enterprise customers
- [ ] Stress testing for AI Proposer under high drift scenarios
- [ ] Docker containerization and Kubernetes manifests
- [ ] Terraform/CloudFormation deployment templates
- [ ] Real-time drift analytics dashboard

---

## Version History Summary

| Version | Date | Key Feature |
|:--------|:-----|:------------|
| 0.3.0 | 2025-12-31 | Universal Connector Suite (Python/Java SDKs) |
| 0.2.0 | 2025-12-31 | Universal Sidecar + Semantic Invariants |
| 0.1.0 | 2025-12-30 | Observability Foundation + Registry |

---

**Note:** This changelog was initialized on 2025-12-31 as part of the repository audit and hygiene initiative. Historical dates are approximate based on git commit history.

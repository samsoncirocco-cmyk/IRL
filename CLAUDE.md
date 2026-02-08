# Mission Control: Team Topology & Protocols

## Active Agents & Worktrees
- **Architect (Mission Control)**: `~/code/irl` (This Repository) - Central Source of Truth.
- **Python Agent (Data Science)**: `../irl-python-sdk` - Consumes `clients/python/` (Modernized with `requests`, Python 3.10+).
- **Java Agent (Enterprise)**: `../irl-java-sdk` - Consumes `clients/java/`.

## Workflow Protocols
1. **Source of Truth**: `registry/` contains all semantic invariants.
2. **Review Process**: All code changes to `src/` must be verified via `walkthrough.md`.
3. **Branching**:
    - `main`: Stable production code.
    - `feature/python-sdk`: Python client development.
    - `feature/java-sdk`: Java client development.

## Commands
- Start Sidecar: `node src/sidecar.js`
- Lint: `npm run lint`
- Test: `npm test`

---

## 3-Layer Architecture Framework

IRL follows a **3-layer agent architecture** that separates strategy from execution:

### Layer 1: CLAUDE.md (Strategy & Context)
**Purpose:** High-level coordination, team topology, and agent protocols.
- **Location:** `/CLAUDE.md` (this file)
- **Audience:** AI agents, architects, project leads
- **Content:** Mission control, active agents, workflow protocols, commands
- **Updated:** When team structure, protocols, or high-level strategy changes

### Layer 2: directives/ (Standard Operating Procedures)
**Purpose:** Explicit, step-by-step instructions for every workflow.
- **Location:** `/directives/`
- **Audience:** Agents executing tasks, engineers onboarding, automation scripts
- **Content:** SOPs for local dev setup, deployment, API usage, MCP server configuration, incident handling
- **Format:** Markdown with clear numbered steps, copy-paste commands, expected outputs
- **Updated:** When procedures change or new workflows are added

### Layer 3: execution/ (Execution Manifest)
**Purpose:** Real-time execution tracking, state, and results.
- **Location:** `/execution/`
- **Audience:** Automation systems, monitoring dashboards, audit logs
- **Content:** Execution logs, state snapshots, runtime manifests, workflow results
- **Format:** JSON, timestamped logs, structured data
- **Updated:** Continuously during execution

### Navigation Rules
- **Agents START at CLAUDE.md** → understand context and team topology
- **Agents READ directives/** → find the SOP for their task
- **Agents WRITE to execution/** → log results and state changes
- **Humans review execution/** → verify agent work, audit decisions

### Example Flow
```
User: "Deploy IRL to production"
  ↓
Agent reads CLAUDE.md → identifies deployment workflow
  ↓
Agent reads directives/deploy.md → follows SOP step-by-step
  ↓
Agent writes to execution/deploy-2026-02-08.log → logs each step
  ↓
Agent updates execution/README.md → marks deployment complete
```

See `directives/README.md` for complete SOP index and `execution/README.md` for execution manifest.

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

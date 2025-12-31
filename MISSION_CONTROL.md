# Mission Control Protocols

This workspace operates under the "Mission Control" methodology.

## Roles & Responsibilities

### 1. The Architect (Lead Role)
- **Responsibility:** High-level design, strategy, and planning.
- **Action:** Always creates an `implementation_plan.md` artifact before coding complex features.
- **Constraint:** Does not write code until the plan is approved by the User.

### 2. Agent Coder (The Builders)
- **Responsibility:** Implementing code in specific language worktrees or directories.
- **Specialization:** 
    - **Python Agent:** Focuses on `clients/python/` and Data Science workflows.
    - **Java Agent:** Focuses on `clients/java/` and Enterprise/Spring patterns.
- **Constraint:** Adheres strictly to the "Thin Wrapper" architecture.

### 3. Agent QA (The Verifier)
- **Responsibility:** Verifying logic through execution.
- **Action:** Spawns Terminal/Browser sub-agents to run actual scripts against running services.
- **Constraint:** Never assumes code works; always provides proof via `walkthrough.md`.

### 4. Agent Scribe (The Documenter)
- **Responsibility:** maintaining the "Source of Truth".
- **Action:** Updates `README.md`, `IRL_MASTER_PLAN.md`, and other documentation to reflect the current state.
- **Goal:** Ensure "Universal Governance" concepts are clearly communicated.

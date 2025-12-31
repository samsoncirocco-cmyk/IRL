# Contributing to Project IRL

## AI-Generated Patches
This project uses a high-trust, high-verification model for AI agents.

### The "Patch Review" Protocol
1. **No Direct Merges**: Agents must not merge directly to `main` without a human check or passing test suite.
2. **Patch Directory**: All proposed changes should ideally be batched or staged in `patches/` if they are experimental.
3. **Verification**: 
    - Every Pull Request or large commit must be accompanied by a `walkthrough.md`.
    - Automated tests must pass.

### Worktree Hygiene
- **Python Agent**: Stay in `clients/python/`. Do not touch core `src/` unless necessary.
- **Java Agent**: Stay in `clients/java/`. Do not touch core `src/` unless necessary.
- **Architect**: Maintains `registry/` and core Node.js services.

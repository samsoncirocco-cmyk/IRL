# Directives: Standard Operating Procedures

Complete SOP index for all IRL workflows.

## Purpose

This directory contains **step-by-step instructions** for every workflow in the IRL system. Each SOP is designed to be executable by agents or humans without requiring external context.

## Available SOPs

| SOP | Purpose | Audience |
|-----|---------|----------|
| [local-dev-setup.md](local-dev-setup.md) | Set up local development environment | Developers, agents |
| [deploy.md](deploy.md) | Deploy IRL to GitHub Actions, cron, or manual | DevOps, agents |
| [api-usage.md](api-usage.md) | Use Python/Java clients to validate payloads | Integration engineers |
| [mcp-server-setup.md](mcp-server-setup.md) | Configure MCP servers for Claude Desktop | AI engineers, agents |
| [incident-handling.md](incident-handling.md) | Review and approve/reject quarantined incidents | SREs, agents |
| [architecture-validation.md](architecture-validation.md) | Run architecture validation agent | Tech leads, agents |
| [agent-governance-automation.md](agent-governance-automation.md) | Automate incident approval workflows | Automation engineers |
| [baseline-registration.md](baseline-registration.md) | Register new integration baselines | Integration engineers |
| [patch-generation.md](patch-generation.md) | Generate and test patches for drift | SREs, agents |
| [health-monitoring.md](health-monitoring.md) | Monitor system health and quarantine status | SREs, agents |

## SOP Format

Each SOP follows this structure:

1. **Overview** - What this workflow accomplishes
2. **Prerequisites** - Required tools, access, environment variables
3. **Procedure** - Numbered steps with copy-paste commands
4. **Expected Output** - What success looks like
5. **Troubleshooting** - Common issues and fixes
6. **Related SOPs** - Links to dependent or follow-up workflows

## When to Update

Update SOPs when:
- Procedures change (new commands, endpoints, or tools)
- New workflows are added
- Troubleshooting steps are discovered
- Agent feedback indicates unclear instructions

## Agent Instructions

When executing a workflow:
1. Read the relevant SOP **completely** before starting
2. Follow steps **in order** without skipping
3. Log each step to `execution/[workflow]-[timestamp].log`
4. If a step fails, consult **Troubleshooting** section
5. Update `execution/README.md` with completion status

## Human Instructions

When creating or updating SOPs:
- Use **numbered steps** for sequential procedures
- Include **copy-paste commands** with no placeholders (use environment variables)
- Show **expected output** for verification
- Add **troubleshooting** for known failure modes
- Keep **prerequisites** explicit and minimal

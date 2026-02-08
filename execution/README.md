# Execution Manifest

Real-time execution tracking, state, and results for IRL workflows.

## Purpose

The `execution/` directory serves as the **runtime state layer** of the 3-layer architecture:

- **Layer 1 (CLAUDE.md):** Strategy and team protocols
- **Layer 2 (directives/):** Standard operating procedures
- **Layer 3 (execution/):** THIS LAYER - Real-time execution logs and state

## What Goes Here

| Type | Purpose | Example |
|------|---------|---------|
| **Execution logs** | Step-by-step workflow execution records | `deploy-2026-02-08-001.log` |
| **State snapshots** | Current system state at checkpoints | `quarantine-state-2026-02-08.json` |
| **Workflow results** | Outcomes of automated processes | `incident-approval-results-2026-02-08.json` |
| **Audit trails** | Agent decisions and actions | `agent-approvals-2026-02-08.log` |
| **Runtime manifests** | Active processes and their status | `active-workflows.json` |

## Directory Structure

```
execution/
├── README.md                          # This file
├── logs/                              # Execution logs
│   ├── deploy-2026-02-08-001.log      # Deployment execution log
│   ├── incident-batch-2026-02-08.log  # Batch incident processing
│   └── health-check-2026-02-08.log    # Health monitoring log
├── state/                             # State snapshots
│   ├── quarantine-state.json          # Current quarantine status
│   ├── baseline-registry.json         # Registered baselines
│   └── approval-metrics.json          # Approval success rates
├── results/                           # Workflow results
│   ├── incident-approvals-2026-02-08.json
│   └── architecture-validation-summary.json
└── active/                            # Active workflow tracking
    └── workflows.json                 # Currently running processes
```

## Usage Patterns

### For Agents

**When executing a workflow:**

1. **Read directives/[workflow].md** - Get step-by-step instructions
2. **Create log file** - `execution/logs/[workflow]-[timestamp].log`
3. **Log each step** - Timestamp, action, result
4. **Update state** - Write snapshots to `execution/state/`
5. **Save results** - Final outcome to `execution/results/`
6. **Update this manifest** - Mark workflow complete below

**Example:**
```bash
# Start workflow
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting incident approval workflow" \
  >> execution/logs/incident-batch-2026-02-08.log

# Log each step
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Listed 12 quarantined incidents" \
  >> execution/logs/incident-batch-2026-02-08.log

# Save results
cat > execution/results/incident-approvals-2026-02-08.json << EOF
{
  "timestamp": "2026-02-08T00:47:00Z",
  "approved": 8,
  "rejected": 2,
  "flagged": 2
}
EOF

# Update manifest (see below)
```

### For Humans

**Review execution history:**

```bash
# View recent logs
ls -lt execution/logs/ | head -10

# Check current state
cat execution/state/quarantine-state.json

# Review workflow results
cat execution/results/incident-approvals-2026-02-08.json
```

**Audit agent actions:**

```bash
# Find all agent approvals
grep "agent-auto-approver" execution/logs/*.log

# Check approval success rate
jq '.approved / (.approved + .rejected + .flagged)' \
  execution/results/incident-approvals-2026-02-08.json
```

---

## Active Workflows

Track currently running workflows here (manually or via automation):

| Workflow | Started | Status | Log File | Agent/User |
|----------|---------|--------|----------|------------|
| _(none)_ | - | - | - | - |

**Format:**
```
| incident-approval | 2026-02-08T00:45:00Z | Running | logs/incident-batch-2026-02-08.log | agent-auto-approver |
```

**Update when:**
- Workflow starts → Add row with "Running" status
- Workflow completes → Update status to "✓ Complete" or "✗ Failed"
- Workflow errors → Update status to "⚠️ Error" with note

---

## Completed Workflows

| Workflow | Completed | Status | Results | Agent/User |
|----------|-----------|--------|---------|------------|
| _(none yet)_ | - | - | - | - |

**Example entries:**
```
| deploy | 2026-02-08T00:30:00Z | ✓ Complete | results/deploy-2026-02-08.json | human:samson |
| incident-approval | 2026-02-08T00:47:00Z | ✓ Complete | 8 approved, 2 flagged | agent-auto-approver |
| architecture-validation | 2026-02-08T00:50:00Z | ⚠️ Overstated | results/arch-validation-2026-02-08.md | agent-validator |
```

---

## State Snapshots

### Current System State

**Last Updated:** _(timestamp will be written by automation)_

#### Quarantine Status
- **Total incidents:** _(count)_
- **Oldest incident:** _(timestamp)_
- **Top integration:** _(integration name)_ (_(count)_ incidents)

#### Baseline Registry
- **Registered integrations:** _(count)_
- **Last baseline update:** _(integration name)_ at _(timestamp)_

#### Auto-Approval Metrics
- **24h approval rate:** _(%%)_
- **Success rate:** _(%%)_

**Automation:** These snapshots should be updated by:
- Daily health monitoring script
- After batch incident processing
- After baseline registration

---

## Troubleshooting

### "execution/ directory not found"

**Solution:** Create directory structure

```bash
cd /path/to/irl
mkdir -p execution/{logs,state,results,active}
```

### Log files too large

**Solution:** Implement log rotation

```bash
# Add to logrotate
cat > /etc/logrotate.d/irl-execution << EOF
/path/to/irl/execution/logs/*.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

### Can't parse state snapshots

**Solution:** Validate JSON format

```bash
cat execution/state/quarantine-state.json | python3 -m json.tool
```

---

## Maintenance

### Weekly Cleanup

```bash
# Archive old logs (> 30 days)
find execution/logs/ -name "*.log" -mtime +30 -exec gzip {} \;

# Move to archive directory
mkdir -p execution/archive/$(date +%Y-%m)
mv execution/logs/*.gz execution/archive/$(date +%Y-%m)/

# Clean old results (> 90 days)
find execution/results/ -name "*.json" -mtime +90 -delete
```

### Backup

```bash
# Backup execution state (daily)
tar -czf execution-backup-$(date +%Y-%m-%d).tar.gz execution/
```

---

## Best Practices

1. **Log everything** - If an agent does it, it should be logged
2. **Timestamp everything** - Use ISO 8601 UTC format
3. **Structure data** - JSON for state/results, text for logs
4. **Update manifest** - Keep Active/Completed Workflows current
5. **Archive regularly** - Prevent directory bloat
6. **No secrets** - Never log API keys or credentials

---

## Integration with Directives

Each SOP in `directives/` should specify:
- Where to log execution (filename pattern)
- What state to update (which JSON file)
- When to update this manifest (workflow start/complete)

**Example (from directives/incident-handling.md):**

> **Execution Logging:**
> - Create log: `execution/logs/incident-[integration]-[timestamp].log`
> - Update state: `execution/state/quarantine-state.json`
> - Mark complete: Add row to `execution/README.md` Completed Workflows table

---

## Related Documentation

- [../CLAUDE.md](../CLAUDE.md) - Layer 1: Strategy and team protocols
- [../directives/README.md](../directives/README.md) - Layer 2: Standard operating procedures
- [../docs/README.md](../docs/README.md) - Project documentation index

---

## Template: Execution Log Entry

Use this format for manual or automated log entries:

```
[TIMESTAMP] [LEVEL] [WORKFLOW] [STEP] Message
```

**Example:**
```
[2026-02-08T00:47:25Z] [INFO] [incident-approval] [list] Listed 12 quarantined incidents for finance_integration
[2026-02-08T00:47:26Z] [INFO] [incident-approval] [preview] Analyzing incident 2026-01-01T17-28-20-262Z_228986
[2026-02-08T00:47:27Z] [INFO] [incident-approval] [approve] ✓ Approved incident (simple field rename)
[2026-02-08T00:47:28Z] [WARN] [incident-approval] [flag] ⚠️ Flagged incident for review (TYPE_MISMATCH)
[2026-02-08T00:47:30Z] [INFO] [incident-approval] [complete] Summary: 8 approved, 2 flagged, 2 rejected
```

---

## Future Enhancements

- [ ] Automated state snapshot generation
- [ ] Real-time workflow dashboard
- [ ] Execution metrics API
- [ ] Integration with monitoring systems (Grafana, Datadog)
- [ ] Workflow dependency tracking
- [ ] Parallel workflow management

---

**Last Updated:** 2026-02-08 (initialization)
**Maintained By:** Agents following directives/ SOPs

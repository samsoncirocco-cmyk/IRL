# SOP: Health Monitoring

Monitor IRL system health and quarantine status.

## Overview

Monitor these key health indicators:
1. **Sidecar availability** - Is the proxy responsive?
2. **Quarantine size** - Are incidents piling up?
3. **Auto-approval rate** - Are agents approving safely?
4. **Baseline sync** - Are registries up-to-date?
5. **Error rates** - Are validation failures increasing?

## Prerequisites

- **IRL deployed:** Sidecar running or accessible
- **Monitoring access:** Read access to logs and quarantine directories

---

## Health Checks

### 1. Sidecar Health

```bash
# Check sidecar is running
curl -f http://localhost:3000/health

# Expected response
# {"status": "ok", "uptime": 12345}
```

**Response codes:**
- `200 OK` - Sidecar healthy
- Connection refused - Sidecar down
- `500 Internal Server Error` - Sidecar degraded

**Alert if:** Sidecar down for > 1 minute

### 2. Quarantine Size

```bash
# Count quarantined incidents
find quarantine/ -name "payload.json" | wc -l

# Count per integration
for dir in quarantine/*/; do
  echo "$(basename $dir): $(find $dir -name payload.json | wc -l)"
done
```

**Expected output:**
```
finance_integration: 3
user_integration: 1
stripe_webhook: 0
```

**Alert if:** Quarantine size > 100 incidents total or > 50 per integration

### 3. Auto-Approval Success Rate

```bash
# Count approved vs total incidents (last 24h)
APPROVED=$(find quarantine/ -type d -name "*-APPROVED" -mtime -1 | wc -l)
TOTAL=$(find quarantine/ -type d -mtime -1 | wc -l)

echo "Auto-approval rate: $(($APPROVED * 100 / $TOTAL))%"
```

**Expected:** 70-90% auto-approval rate

**Alert if:** Rate drops below 50% (indicates drift patterns changing)

### 4. Baseline Freshness

```bash
# Check when baselines were last updated
for baseline in registry/*/baseline.json; do
  INTEGRATION=$(dirname $baseline | xargs basename)
  AGE=$(stat -f "%Sm" -t "%Y-%m-%d" $baseline)
  echo "$INTEGRATION: Last updated $AGE"
done
```

**Alert if:** Baseline not updated in > 30 days and drift incidents exist

### 5. Error Rate Monitoring

```bash
# Count validation errors (from sidecar logs)
grep "INVARIANT_VIOLATION\|DRIFT_DETECTED" /var/log/irl-sidecar.log | wc -l

# Error rate over last hour
grep "INVARIANT_VIOLATION" /var/log/irl-sidecar.log | \
  grep "$(date -u -v-1H +%Y-%m-%dT%H)" | wc -l
```

**Alert if:** Error rate > 10% of total requests

---

## Monitoring Dashboard

### Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Sidecar uptime | 99.9% | < 99% |
| Quarantine size | < 50 incidents | > 100 |
| Auto-approval rate | 70-90% | < 50% |
| Avg patch age | < 24h | > 48h |
| Validation error rate | < 5% | > 10% |
| Baseline age | < 30 days | > 60 days |

### Daily Health Report Script

```bash
#!/bin/bash
# daily-health-report.sh

echo "IRL Health Report - $(date +%Y-%m-%d)"
echo "========================================="

# Sidecar health
if curl -f http://localhost:3000/health &>/dev/null; then
  echo "✓ Sidecar: Healthy"
else
  echo "✗ Sidecar: DOWN"
fi

# Quarantine size
TOTAL=$(find quarantine/ -name "payload.json" | wc -l)
echo "Quarantine size: $TOTAL incidents"
if [ $TOTAL -gt 100 ]; then
  echo "  ⚠️  WARNING: High quarantine volume"
fi

# Recent activity
APPROVED_24H=$(find quarantine/ -type d -name "*-APPROVED" -mtime -1 | wc -l)
REJECTED_24H=$(find quarantine/ -type d -name "*-REJECTED" -mtime -1 | wc -l)
echo "Last 24h: $APPROVED_24H approved, $REJECTED_24H rejected"

# Top integrations by incident count
echo ""
echo "Top integrations by incident count:"
for dir in quarantine/*/; do
  COUNT=$(find $dir -name payload.json | wc -l)
  if [ $COUNT -gt 0 ]; then
    echo "  $(basename $dir): $COUNT"
  fi
done | sort -t: -k2 -nr | head -5
```

**Add to crontab:**
```bash
# Daily report at 9 AM
0 9 * * * /path/to/daily-health-report.sh | mail -s "IRL Daily Health" team@example.com
```

---

## Alerting

### Slack Alerts

```bash
#!/bin/bash
# alert-quarantine-size.sh

THRESHOLD=100
COUNT=$(find quarantine/ -name "payload.json" | wc -l)

if [ $COUNT -gt $THRESHOLD ]; then
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"⚠️ IRL Alert: Quarantine size ($COUNT) exceeds threshold ($THRESHOLD)\",
      \"blocks\": [{
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"*IRL Quarantine Alert*\n\nCurrent size: *$COUNT incidents*\nThreshold: $THRESHOLD\n\nAction: Review and approve pending incidents\"
        }
      }]
    }"
fi
```

**Add to crontab:**
```bash
# Check every hour
0 * * * * /path/to/alert-quarantine-size.sh
```

### PagerDuty Integration

```bash
# trigger-pagerduty.sh

if ! curl -f http://localhost:3000/health &>/dev/null; then
  curl -X POST https://events.pagerduty.com/v2/enqueue \
    -H 'Content-Type: application/json' \
    -d "{
      \"routing_key\": \"$PAGERDUTY_KEY\",
      \"event_action\": \"trigger\",
      \"payload\": {
        \"summary\": \"IRL Sidecar is down\",
        \"severity\": \"critical\",
        \"source\": \"irl-health-monitor\"
      }
    }"
fi
```

---

## Common Issues

### Issue 1: Sidecar Down

**Symptoms:**
- `/health` endpoint returns connection refused
- Validation requests fail

**Investigation:**
```bash
# Check if process is running
ps aux | grep sidecar

# Check logs
tail -100 /var/log/irl-sidecar.log

# Check port binding
lsof -i :3000
```

**Resolution:**
```bash
# Restart sidecar
node src/sidecar.js &
```

### Issue 2: Quarantine Backlog

**Symptoms:**
- Quarantine size > 100 incidents
- Old incidents not being reviewed

**Investigation:**
```bash
# Find oldest incidents
find quarantine/ -name "payload.json" -type f -printf '%T+ %p\n' | sort | head -10

# Check if auto-approval is running
ps aux | grep auto-approve
```

**Resolution:**
1. Review [incident-handling.md](incident-handling.md)
2. Batch approve safe incidents
3. Investigate recurring drift patterns
4. Update baselines if needed

### Issue 3: High Error Rate

**Symptoms:**
- > 10% of requests fail validation
- Sudden spike in quarantined incidents

**Investigation:**
```bash
# Check recent errors
grep "INVARIANT_VIOLATION" /var/log/irl-sidecar.log | tail -20

# Identify affected integrations
grep "INVARIANT_VIOLATION" /var/log/irl-sidecar.log | \
  awk '{print $5}' | sort | uniq -c | sort -nr
```

**Resolution:**
1. Contact data producer team
2. Verify if upstream schema changed
3. Update baseline if intentional change
4. Add invariant rules if new violation pattern

---

## Troubleshooting

### "Permission denied" when reading quarantine

**Solution:** Check file permissions

```bash
ls -la quarantine/
chmod -R u+r quarantine/
```

### Health check returns 500

**Solution:** Check sidecar logs for errors

```bash
tail -100 /var/log/irl-sidecar.log
```

### Metrics scripts fail

**Solution:** Verify paths and permissions

```bash
# Test find command
find quarantine/ -name "payload.json"

# Check log file exists
ls -la /var/log/irl-sidecar.log
```

---

## Related SOPs

- [incident-handling.md](incident-handling.md) - Review quarantined incidents
- [deploy.md](deploy.md) - Deploy and manage sidecar
- [agent-governance-automation.md](agent-governance-automation.md) - Automate incident workflows

---

## Best Practices

1. **Monitor proactively** - Don't wait for incidents to pile up
2. **Set alert thresholds** - Balance noise vs. signal
3. **Review metrics weekly** - Identify trends early
4. **Automate common responses** - E.g., restart sidecar on failure
5. **Document incidents** - Build runbook for recurring issues

---

## Next Steps

1. Set up daily health report cron job
2. Configure Slack alerts for critical thresholds
3. Create monitoring dashboard (Grafana, Datadog, etc.)
4. Review metrics weekly and adjust thresholds

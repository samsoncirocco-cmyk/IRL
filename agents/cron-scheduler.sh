#!/bin/bash

###############################################################################
# IRL Architecture Validation - Cron Scheduler
#
# This script is designed to be run via cron for regular architecture
# validation on servers or local development machines.
#
# Usage:
#   1. Make executable: chmod +x agents/cron-scheduler.sh
#   2. Add to crontab: crontab -e
#   3. Add line: 0 9 * * 1 /path/to/code_irl/agents/cron-scheduler.sh
#      (Runs every Monday at 9 AM)
#
# Environment Variables Required:
#   ANTHROPIC_API_KEY - Your Anthropic API key
#
# Optional Environment Variables:
#   IRL_VALIDATION_EMAIL - Email address to send reports to
#   IRL_VALIDATION_SLACK_WEBHOOK - Slack webhook URL for notifications
###############################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/reports/cron-validation.log"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Check for required environment variables
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    log "ERROR: ANTHROPIC_API_KEY environment variable not set"
    log "Please set it in your crontab or shell profile"
    exit 1
fi

log "════════════════════════════════════════════════════════════"
log "Starting IRL Architecture Validation"
log "════════════════════════════════════════════════════════════"

# Change to project root
cd "$PROJECT_ROOT"

# Ensure we have the latest code (if in a git repo)
if [ -d .git ]; then
    log "Checking for code updates..."
    git fetch origin main --quiet || log "Warning: Could not fetch updates"

    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        log "Code updates detected. Pulling latest changes..."
        git pull origin main --quiet || log "Warning: Could not pull updates"
    else
        log "Code is up to date"
    fi
fi

# Run the validation agent
log "Running architecture validation agent..."

if node "$SCRIPT_DIR/architecture-validator.js" >> "$LOG_FILE" 2>&1; then
    EXIT_CODE=0
    VERDICT="SUCCESS"
    log "✅ Validation completed successfully"
else
    EXIT_CODE=$?
    VERDICT="FAILED"
    log "⚠️  Validation completed with issues (exit code: $EXIT_CODE)"
fi

# Find the latest report
LATEST_REPORT=$(ls -t "$SCRIPT_DIR/reports/architecture-validation-"*.md 2>/dev/null | head -1 || echo "")

if [ -n "$LATEST_REPORT" ]; then
    log "Report saved: $LATEST_REPORT"

    # Extract verdict from report
    if grep -q "✅ Pitch is credible" "$LATEST_REPORT"; then
        REPORT_VERDICT="✅ CREDIBLE"
    elif grep -q "⚠️ Pitch is directionally right" "$LATEST_REPORT"; then
        REPORT_VERDICT="⚠️ OVERSTATED"
    elif grep -q "❌ Pitch is misaligned" "$LATEST_REPORT"; then
        REPORT_VERDICT="❌ MISALIGNED"
    else
        REPORT_VERDICT="❓ UNKNOWN"
    fi

    log "Verdict: $REPORT_VERDICT"
else
    log "Warning: No report file found"
    REPORT_VERDICT="❓ NO REPORT"
fi

# Email notification (if configured)
if [ -n "${IRL_VALIDATION_EMAIL:-}" ] && [ -n "$LATEST_REPORT" ]; then
    log "Sending email notification to $IRL_VALIDATION_EMAIL..."

    SUBJECT="IRL Architecture Validation - $REPORT_VERDICT"

    # Try to send email using mail command
    if command -v mail &> /dev/null; then
        {
            echo "IRL Architecture Validation Report"
            echo "Generated: $(date)"
            echo "Verdict: $REPORT_VERDICT"
            echo ""
            echo "Full report attached or see: $LATEST_REPORT"
            echo ""
            head -50 "$LATEST_REPORT"
        } | mail -s "$SUBJECT" "$IRL_VALIDATION_EMAIL" || log "Warning: Failed to send email"
    else
        log "Warning: 'mail' command not found. Skipping email notification."
    fi
fi

# Slack notification (if configured)
if [ -n "${IRL_VALIDATION_SLACK_WEBHOOK:-}" ]; then
    log "Sending Slack notification..."

    # Extract executive summary from report
    SUMMARY=""
    if [ -n "$LATEST_REPORT" ]; then
        SUMMARY=$(grep -A 10 "Executive Summary" "$LATEST_REPORT" | head -15 | tail -10 || echo "")
    fi

    SLACK_PAYLOAD=$(cat <<EOF
{
  "text": "IRL Architecture Validation Report",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🛡️ IRL Architecture Validation"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Verdict:*\n$REPORT_VERDICT"
        },
        {
          "type": "mrkdwn",
          "text": "*Generated:*\n$(date +'%Y-%m-%d %H:%M:%S')"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Executive Summary:*\n\`\`\`$SUMMARY\`\`\`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Full report: \`$LATEST_REPORT\`"
        }
      ]
    }
  ]
}
EOF
)

    if curl -X POST -H 'Content-type: application/json' \
        --data "$SLACK_PAYLOAD" \
        "$IRL_VALIDATION_SLACK_WEBHOOK" &> /dev/null; then
        log "Slack notification sent"
    else
        log "Warning: Failed to send Slack notification"
    fi
fi

# Commit report to git (if in a git repo and changes exist)
if [ -d .git ]; then
    log "Committing report to git..."

    git add "$SCRIPT_DIR/reports/" || true

    if git diff --staged --quiet; then
        log "No new reports to commit"
    else
        git commit -m "chore: add architecture validation report [$TIMESTAMP] - $REPORT_VERDICT" || log "Warning: Failed to commit report"

        # Optionally push to remote
        if [ "${IRL_VALIDATION_AUTO_PUSH:-false}" = "true" ]; then
            log "Pushing report to remote..."
            git push origin main || log "Warning: Failed to push to remote"
        fi
    fi
fi

log "════════════════════════════════════════════════════════════"
log "Validation complete"
log "════════════════════════════════════════════════════════════"

exit $EXIT_CODE

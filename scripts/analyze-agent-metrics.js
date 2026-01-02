#!/usr/bin/env node

/**
 * Agent Metrics Analyzer
 * 
 * Analyzes audit_log.json to measure:
 * - Time per operation (list, preview, approve)
 * - Agent vs human comparison
 * - Approval rate by pattern type
 * - Weekly summary reports
 */

const fs = require('fs');
const path = require('path');

const AUDIT_LOG_PATH = path.join(__dirname, '..', 'irl', 'audit_log.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'metrics');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function readAuditLog() {
  if (!fs.existsSync(AUDIT_LOG_PATH)) {
    console.error(`Audit log not found: ${AUDIT_LOG_PATH}`);
    return [];
  }

  const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
  const lines = raw.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.warn(`Failed to parse line: ${line}`);
      return null;
    }
  }).filter(entry => entry !== null);
}

function analyzeMetrics(entries) {
  const metrics = {
    totalIncidents: 0,
    agentReviewed: 0,
    humanReviewed: 0,
    agentApproved: 0,
    humanApproved: 0,
    agentRejected: 0,
    humanRejected: 0,
    agentTime: 0,
    humanTime: 0,
    operations: {
      list: { count: 0, totalTime: 0 },
      preview: { count: 0, totalTime: 0 },
      approve: { count: 0, totalTime: 0 },
      reject: { count: 0, totalTime: 0 }
    },
    byPattern: {},
    weekly: {}
  };

  entries.forEach(entry => {
    // Count incidents
    if (entry.status === 'QUARANTINED' || entry.status === 'RELEASED' || entry.status === 'REJECTED') {
      metrics.totalIncidents++;
    }

    // Track agent vs human
    const reviewedBy = entry.approved_by || entry.rejected_by || 'unknown';
    const isAgent = reviewedBy.includes('agent') || reviewedBy.includes('Agent');
    
    if (entry.status === 'RELEASED') {
      if (isAgent) {
        metrics.agentReviewed++;
        metrics.agentApproved++;
      } else {
        metrics.humanReviewed++;
        metrics.humanApproved++;
      }
    } else if (entry.status === 'REJECTED') {
      if (isAgent) {
        metrics.agentReviewed++;
        metrics.agentRejected++;
      } else {
        metrics.humanReviewed++;
        metrics.humanRejected++;
      }
    }

    // Track operation times
    if (entry.duration_ms) {
      if (entry.action === 'list_quarantined') {
        metrics.operations.list.count++;
        metrics.operations.list.totalTime += entry.duration_ms;
      } else if (entry.action === 'preview_incident') {
        metrics.operations.preview.count++;
        metrics.operations.preview.totalTime += entry.duration_ms;
      } else if (entry.action === 'approve_patch') {
        metrics.operations.approve.count++;
        metrics.operations.approve.totalTime += entry.duration_ms;
      } else if (entry.action === 'reject_incident') {
        metrics.operations.reject.count++;
        metrics.operations.reject.totalTime += entry.duration_ms;
      }

      if (isAgent) {
        metrics.agentTime += entry.duration_ms;
      } else {
        metrics.humanTime += entry.duration_ms;
      }
    }

    // Track by pattern type (if available)
    if (entry.drift_report_ids && entry.drift_report_ids.length > 0) {
      // This would need to be enriched with pattern type from drift reports
      // For now, just count
    }

    // Weekly breakdown
    if (entry.timestamp) {
      const date = new Date(entry.timestamp);
      const week = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${week}`;
      
      if (!metrics.weekly[weekKey]) {
        metrics.weekly[weekKey] = {
          incidents: 0,
          agentApproved: 0,
          humanApproved: 0,
          agentTime: 0,
          humanTime: 0
        };
      }

      if (entry.status === 'RELEASED' || entry.status === 'REJECTED') {
        metrics.weekly[weekKey].incidents++;
        if (entry.status === 'RELEASED') {
          if (isAgent) {
            metrics.weekly[weekKey].agentApproved++;
          } else {
            metrics.weekly[weekKey].humanApproved++;
          }
        }

        if (entry.duration_ms) {
          if (isAgent) {
            metrics.weekly[weekKey].agentTime += entry.duration_ms;
          } else {
            metrics.weekly[weekKey].humanTime += entry.duration_ms;
          }
        }
      }
    }
  });

  return metrics;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function calculateAverages(metrics) {
  const averages = {};

  // Average time per operation
  Object.keys(metrics.operations).forEach(op => {
    const opData = metrics.operations[op];
    if (opData.count > 0) {
      averages[op] = {
        avgTimeMs: opData.totalTime / opData.count,
        avgTimeSec: (opData.totalTime / opData.count / 1000).toFixed(2),
        totalCount: opData.count
      };
    }
  });

  // Average time per incident (agent vs human)
  if (metrics.agentReviewed > 0) {
    averages.agentAvgTimeMs = metrics.agentTime / metrics.agentReviewed;
    averages.agentAvgTimeSec = (metrics.agentTime / metrics.agentReviewed / 1000).toFixed(2);
  }

  if (metrics.humanReviewed > 0) {
    averages.humanAvgTimeMs = metrics.humanTime / metrics.humanReviewed;
    averages.humanAvgTimeSec = (metrics.humanTime / metrics.humanReviewed / 1000).toFixed(2);
  }

  // Speedup calculation
  if (averages.agentAvgTimeMs && averages.humanAvgTimeMs) {
    averages.speedup = (averages.humanAvgTimeMs / averages.agentAvgTimeMs).toFixed(1);
  }

  // Auto-approval rate
  if (metrics.agentReviewed > 0) {
    averages.agentAutoApprovalRate = ((metrics.agentApproved / metrics.agentReviewed) * 100).toFixed(1);
  }

  return averages;
}

function generateReport(metrics, averages) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIncidents: metrics.totalIncidents,
      agentReviewed: metrics.agentReviewed,
      humanReviewed: metrics.humanReviewed,
      agentApprovalRate: metrics.agentReviewed > 0 
        ? ((metrics.agentApproved / metrics.agentReviewed) * 100).toFixed(1) + '%'
        : 'N/A',
      humanApprovalRate: metrics.humanReviewed > 0
        ? ((metrics.humanApproved / metrics.humanReviewed) * 100).toFixed(1) + '%'
        : 'N/A'
    },
    timeSavings: {
      agentTotalTime: `${(metrics.agentTime / 1000 / 60).toFixed(1)} minutes`,
      humanTotalTime: `${(metrics.humanTime / 1000 / 60).toFixed(1)} minutes`,
      timeSaved: `${((metrics.humanTime - metrics.agentTime) / 1000 / 60).toFixed(1)} minutes`,
      percentageSaved: metrics.humanTime > 0
        ? (((metrics.humanTime - metrics.agentTime) / metrics.humanTime) * 100).toFixed(1) + '%'
        : 'N/A',
      speedup: averages.speedup ? `${averages.speedup}x faster` : 'N/A'
    },
    averages: averages,
    weekly: metrics.weekly
  };

  return report;
}

function writeReport(report) {
  const jsonPath = path.join(OUTPUT_DIR, `metrics-${Date.now()}.json`);
  const markdownPath = path.join(OUTPUT_DIR, `metrics-${Date.now()}.md`);

  // Write JSON
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  // Write Markdown
  const markdown = `# Agent Metrics Report

Generated: ${report.generatedAt}

## Summary

- **Total Incidents**: ${report.summary.totalIncidents}
- **Agent Reviewed**: ${report.summary.agentReviewed}
- **Human Reviewed**: ${report.summary.humanReviewed}
- **Agent Approval Rate**: ${report.summary.agentApprovalRate}
- **Human Approval Rate**: ${report.summary.humanApprovalRate}

## Time Savings

- **Agent Total Time**: ${report.timeSavings.agentTotalTime}
- **Human Total Time**: ${report.timeSavings.humanTotalTime}
- **Time Saved**: ${report.timeSavings.timeSaved}
- **Percentage Saved**: ${report.timeSavings.percentageSaved}
- **Speedup**: ${report.timeSavings.speedup}

## Average Times

${Object.keys(report.averages).filter(k => k.includes('AvgTime')).map(k => {
  return `- **${k}**: ${report.averages[k]} seconds`;
}).join('\n')}

## Weekly Breakdown

${Object.keys(report.weekly).map(week => {
  const data = report.weekly[week];
  return `### ${week}
- Incidents: ${data.incidents}
- Agent Approved: ${data.agentApproved}
- Human Approved: ${data.humanApproved}
- Agent Time: ${(data.agentTime / 1000 / 60).toFixed(1)} minutes
- Human Time: ${(data.humanTime / 1000 / 60).toFixed(1)} minutes
`;
}).join('\n')}
`;

  fs.writeFileSync(markdownPath, markdown);

  console.log(`\n✅ Metrics report generated:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   Markdown: ${markdownPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total Incidents: ${report.summary.totalIncidents}`);
  console.log(`   Agent Reviewed: ${report.summary.agentReviewed}`);
  console.log(`   Time Saved: ${report.timeSavings.percentageSaved}`);
  console.log(`   Speedup: ${report.timeSavings.speedup}`);
}

// Main execution
function main() {
  console.log('📊 Analyzing agent metrics...\n');

  const entries = readAuditLog();
  console.log(`   Found ${entries.length} log entries`);

  if (entries.length === 0) {
    console.log('\n⚠️  No log entries found. Make sure audit_log.json exists and has data.');
    return;
  }

  const metrics = analyzeMetrics(entries);
  const averages = calculateAverages(metrics);
  const report = generateReport(metrics, averages);

  writeReport(report);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeMetrics, calculateAverages, generateReport };


#!/usr/bin/env node

/**
 * IRL Architecture Validation Agent
 *
 * Role: Principal Infrastructure Engineer performing design review
 * Evaluates whether the current implementation credibly supports the pitched architecture
 *
 * Usage:
 *   ANTHROPIC_API_KEY=your_key node agents/architecture-validator.js
 *
 * Output:
 *   - Saves report to agents/reports/architecture-validation-[timestamp].md
 *   - Exits with code 0 (credible) or 1 (issues found)
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-opus-4-5-20251101'; // Use the most capable model for validation
const OUTPUT_DIR = path.join(__dirname, 'reports');

// File patterns to analyze
const SOURCE_FILES = [
  'irl/src/sentinel.js',
  'irl/src/sidecar.js',
  'irl/src/driftReport.js',
  'irl/src/governance.js',
  'irl/src/storage.js',
  'irl/src/diff.js',
  'irl/src/patchManager.js',
  'irl/index.js',
  'README.md',
  'irl/pitch-deck.md',
  'IRL_MASTER_PLAN.md',
  'CLAUDE.md',
];

// The validation framework prompt
const VALIDATION_FRAMEWORK = `
# IRL Architecture Validation Prompt (Claude Code)

## Role:
You are a Principal Infrastructure Engineer performing a design review of an early-stage enterprise control plane product. Your job is to determine whether the current implementation credibly supports the pitched architecture, and to identify gaps, risks, and required changes.

## Context (Read Carefully)

We are building IRL — Integration Resilience Layer, a language-agnostic AI Output Firewall that sits in front of systems of record to prevent API drift and AI-generated data corruption.

### What IRL is pitched as:

- A Sidecar / Proxy
- Language-agnostic (HTTP)
- Deterministic (no non-auditable decisions)
- Privacy-first (no PII storage)
- Enforces:
  - Structural contracts
  - Semantic invariants
  - Quarantine / Block policies
- Designed to stop valid-but-wrong AI output

### What Already Exists (Expected):

**Implemented:**
- Structural fingerprinting (JSON type mapping)
- Deterministic key sorting
- Multi-tenant registry by integration name
- Baseline contract storage
- Drift detection (syntactic / type-level)
- NDJSON append-only audit logs
- processRequest(integrationName, payload) as the canonical entry point
- CLI-based governance actions

**Partially Implemented:**
- Quarantine logic
- Drift report generation

**Not Yet Implemented:**
- Express sidecar proxy
- Language-agnostic HTTP interface
- Semantic invariant enforcement
- AI-specific guardrails
- SLA / impact metrics
- Dashboard UI

## Your Task

### 1. Architecture Alignment Check
Evaluate whether the current codebase can realistically support the pitched IRL architecture without a rewrite.

Answer:
- What aligns well already?
- What is structurally missing?
- What assumptions in the pitch are not yet supported by code?

### 2. Gap Analysis Table
Produce a table with:

| Pitch Claim | Current Support | Gap | Severity |
|-------------|----------------|-----|----------|
| Language-agnostic proxy | Partial / None | ... | High |
| AI output firewall | ... | ... | ... |

Severity = Low / Medium / High / Existential

### 3. Determinism & Auditability Review
Assess:
- Are all decisions reproducible?
- Is anything non-deterministic or implicit?
- Would an auditor be able to explain why a payload was blocked?

Flag any violations of enterprise expectations.

### 4. Security & Compliance Reality Check
Given the "no PII storage" claim:
- Does the current fingerprinting truly prevent value leakage?
- Are there edge cases where sensitive data might leak?
- What needs to be hardened before SOC2 conversations?

### 5. AI Guardrail Readiness
Based on the existing Sentinel loop:
- Is it feasible to add semantic invariants without destabilizing the system?
- Where should invariant checks live?
- What design mistakes should be avoided?

### 6. Enterprise Buyer Skepticism Test
Pretend you are:
- A Fortune 500 platform architect
- A skeptical VC partner

Answer:
- What would you challenge in the pitch?
- What proof points are missing?
- What demo would you demand?

### 7. Execution Risk Assessment
Identify:
- The top 3 technical risks
- The top 2 product risks
- The single biggest "gotcha" that could kill adoption

### 8. Verdict
Give one of the following verdicts and justify it:

✅ Pitch is credible with current trajectory
⚠️ Pitch is directionally right but overstates readiness
❌ Pitch is misaligned with the current system

## Rules

- Be brutally honest
- Do NOT assume future features exist
- Do NOT soften feedback
- Treat this as a pre-investment technical diligence review

## Output Format

1. **Executive Summary** (5-7 bullets)
2. **Gap Analysis Table**
3. **Determinism & Auditability Review**
4. **Security & Compliance Reality Check**
5. **AI Guardrail Readiness**
6. **Enterprise Buyer Skepticism Test**
7. **Execution Risk Assessment**
8. **Final Verdict**

---

Now analyze the IRL codebase below and provide your assessment.
`;

async function readFile(filePath) {
  const absolutePath = path.join(__dirname, '..', filePath);
  try {
    const content = await fs.readFile(absolutePath, 'utf8');
    return { path: filePath, content, success: true };
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
    return { path: filePath, content: null, success: false };
  }
}

async function gatherCodebase() {
  console.log('📦 Gathering codebase files...\n');

  const fileReads = await Promise.all(SOURCE_FILES.map(readFile));
  const successfulReads = fileReads.filter(f => f.success);

  console.log(`✓ Successfully read ${successfulReads.length}/${SOURCE_FILES.length} files\n`);

  // Format as markdown code blocks
  let codebaseContext = '# IRL Codebase\n\n';

  for (const file of successfulReads) {
    const ext = path.extname(file.path).substring(1) || 'txt';
    codebaseContext += `## ${file.path}\n\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
  }

  return codebaseContext;
}

async function callClaudeAPI(prompt) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const requestBody = JSON.stringify({
    model: MODEL,
    max_tokens: 16000,
    temperature: 0.3, // Lower temperature for more consistent analysis
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

async function saveReport(content, timestamp) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const filename = `architecture-validation-${timestamp}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);

  const report = `# IRL Architecture Validation Report
Generated: ${new Date(timestamp).toISOString()}
Model: ${MODEL}

---

${content}
`;

  await fs.writeFile(filepath, report, 'utf8');

  // Also create/update a "latest" symlink
  const latestPath = path.join(OUTPUT_DIR, 'architecture-validation-latest.md');
  try {
    await fs.unlink(latestPath);
  } catch (error) {
    // Ignore if doesn't exist
  }
  await fs.writeFile(latestPath, report, 'utf8');

  return filepath;
}

function parseVerdict(content) {
  // Simple heuristic: look for the verdict emoji
  if (content.includes('✅ Pitch is credible')) {
    return 'credible';
  } else if (content.includes('⚠️ Pitch is directionally right')) {
    return 'overstated';
  } else if (content.includes('❌ Pitch is misaligned')) {
    return 'misaligned';
  }
  return 'unknown';
}

async function main() {
  console.log('🛡️  IRL Architecture Validation Agent\n');
  console.log('Role: Principal Infrastructure Engineer\n');
  console.log('═'.repeat(60) + '\n');

  try {
    // Step 1: Gather codebase
    const codebase = await gatherCodebase();

    // Step 2: Construct full prompt
    const fullPrompt = VALIDATION_FRAMEWORK + '\n\n' + codebase;

    console.log('🤖 Sending to Claude API for analysis...\n');
    console.log(`Model: ${MODEL}`);
    console.log(`Prompt size: ${fullPrompt.length.toLocaleString()} characters\n`);

    // Step 3: Call Claude API
    const response = await callClaudeAPI(fullPrompt);

    // Step 4: Extract content
    const analysisContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n');

    // Step 5: Parse verdict
    const verdict = parseVerdict(analysisContent);

    // Step 6: Save report
    const timestamp = Date.now();
    const reportPath = await saveReport(analysisContent, timestamp);

    // Step 7: Display results
    console.log('═'.repeat(60) + '\n');
    console.log('✅ Analysis complete!\n');
    console.log(`Report saved to: ${reportPath}\n`);
    console.log(`Verdict: ${verdict.toUpperCase()}\n`);

    // Display executive summary (first few lines)
    const lines = analysisContent.split('\n');
    const summaryEndIdx = Math.min(lines.indexOf('') || 20, 20);
    console.log('Executive Summary Preview:');
    console.log('─'.repeat(60));
    console.log(lines.slice(0, summaryEndIdx).join('\n'));
    console.log('─'.repeat(60) + '\n');

    console.log(`📄 Full report: ${reportPath}\n`);

    // Exit code based on verdict
    if (verdict === 'credible') {
      process.exit(0);
    } else if (verdict === 'overstated') {
      process.exit(0); // Still successful, just flagged
    } else {
      process.exit(1); // Misaligned or unknown
    }

  } catch (error) {
    console.error('❌ Error during validation:\n');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, gatherCodebase, callClaudeAPI };

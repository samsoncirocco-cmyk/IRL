/**
 * IRL Golden Path Demo
 * * This script demonstrates the "Self-Healing" loop:
 * 1. Detects drift in an incoming payload.
 * 2. Consults the Sentinel (Mock or Real AI).
 * 3. Generates and applies a Javascript patch.
 * 4. Verifies the system is resilient.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuration ---
const USE_REAL_AI = process.env.LIVE_AI === 'true';
const PORT = 3000;
const TARGET_URL = `http://localhost:${PORT}`;

// --- Mock AI Logic ---
async function getPatch(driftReport) {
    if (USE_REAL_AI) {
        console.log("🤖 Calling real LLM for patch generation...");
        // Future: Add your callClaudeAPI(driftReport) logic here
        return null;
    } else {
        console.log("🧪 Using Mock AI (Simulating thought...)");
        // Simulate the "thinking" delay for the demo feel
        await new Promise(r => setTimeout(r, 2000));

        return `
/**
 * Auto-generated Patch
 * Target: Finance Integration
 * Action: Map 'fname' to 'first_name' to prevent drift.
 */
module.exports = function(payload) {
  if (payload.fname && !payload.first_name) {
    console.log("🛠  Patch Applied: Mapping 'fname' to 'first_name'");
    payload.first_name = payload.fname;
    delete payload.fname;
  }
  return payload;
};
    `;
    }
}

// --- Demo Execution ---
async function runDemo() {
    console.log("🚀 Starting IRL Golden Path Demo...");

    // 1. Setup workspace
    const paths = ['quarantine', 'patches', 'released'];
    paths.forEach(p => {
        if (!fs.existsSync(p)) fs.mkdirSync(p);
    });

    // 2. Simulate an incoming "Drifting" payload
    const badPayload = {
        integration: "finance_api",
        data: {
            fname: "Samson",
            amount: 500.00
        }
    };

    console.log("📥 Received payload with legacy field 'fname'...");

    // 3. Get the patch
    const patchCode = await getPatch(badPayload);

    // 4. Save and Apply
    const patchPath = path.join(__dirname, '../patches/finance_fix.js');
    fs.writeFileSync(patchPath, patchCode);
    console.log(`✅ Patch saved to ${patchPath}`);

    // 5. Verification Simulation
    console.log("🕵️  Verifying patch integrity...");
    const patch = require(patchPath);
    const fixedPayload = patch({ ...badPayload.data });

    if (fixedPayload.first_name === "Samson") {
        console.log("✨ SUCCESS: System self-healed! 'first_name' is now correctly populated.");
    } else {
        console.log("❌ FAILURE: Patch did not resolve the drift.");
    }
}

runDemo().catch(err => console.error("💥 Demo Error:", err));
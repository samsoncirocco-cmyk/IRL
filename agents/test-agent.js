#!/usr/bin/env node

/**
 * Test script for Architecture Validation Agent
 *
 * This script tests the agent's ability to gather the codebase
 * without requiring an API key. It validates that all expected
 * files can be read and formatted correctly.
 *
 * Usage:
 *   node agents/test-agent.js
 */

const { gatherCodebase } = require('./architecture-validator.js');

async function runTests() {
  console.log('🧪 Testing Architecture Validation Agent\n');
  console.log('═'.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Codebase gathering
  console.log('Test 1: Gather codebase files...');
  try {
    const codebase = await gatherCodebase();

    if (!codebase || codebase.length === 0) {
      throw new Error('Codebase is empty');
    }

    console.log(`✅ PASS: Gathered ${codebase.length.toLocaleString()} characters`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }

  // Test 2: Check for expected files
  console.log('\nTest 2: Verify expected files are included...');
  try {
    const codebase = await gatherCodebase();
    const expectedFiles = [
      'sentinel.js',
      'sidecar.js',
      'driftReport.js',
      'README.md',
      'IRL_MASTER_PLAN.md'
    ];

    const missing = expectedFiles.filter(file => !codebase.includes(file));

    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`);
    }

    console.log(`✅ PASS: All expected files found`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }

  // Test 3: Check markdown formatting
  console.log('\nTest 3: Verify markdown formatting...');
  try {
    const codebase = await gatherCodebase();

    // Should have code fences
    if (!codebase.includes('```')) {
      throw new Error('No code fences found');
    }

    // Should have file headers
    if (!codebase.includes('## irl/src/sentinel.js')) {
      throw new Error('File headers not properly formatted');
    }

    console.log(`✅ PASS: Markdown formatting is correct`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }

  // Test 4: Size validation
  console.log('\nTest 4: Validate codebase size...');
  try {
    const codebase = await gatherCodebase();

    // Should be at least 10KB (rough estimate)
    const minSize = 10000;
    // Should be less than 500KB (to avoid token limits)
    const maxSize = 500000;

    if (codebase.length < minSize) {
      throw new Error(`Codebase too small: ${codebase.length} chars (expected > ${minSize})`);
    }

    if (codebase.length > maxSize) {
      throw new Error(`Codebase too large: ${codebase.length} chars (expected < ${maxSize})`);
    }

    console.log(`✅ PASS: Codebase size is reasonable (${codebase.length.toLocaleString()} chars)`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('Test Summary:\n');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);
  console.log('═'.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ Some tests failed. Please review the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! Agent is ready to use.\n');
    console.log('To run a full validation (requires ANTHROPIC_API_KEY):');
    console.log('  export ANTHROPIC_API_KEY=your_key_here');
    console.log('  node agents/architecture-validator.js\n');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };

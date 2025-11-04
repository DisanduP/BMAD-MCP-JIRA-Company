#!/usr/bin/env node

console.log('🚀 Debug: Starting BMAD Complete Workflow...');

const featureRequest = process.argv[2];
console.log(`📝 Debug: Feature request: "${featureRequest}"`);

if (!featureRequest) {
  console.error('❌ Please provide a feature request as an argument');
  process.exit(1);
}

console.log('🔧 Debug: Checking environment variables...');
console.log(`JIRA_EMAIL: ${process.env.JIRA_EMAIL ? 'Set' : 'Not set'}`);
console.log(`JIRA_API_TOKEN: ${process.env.JIRA_API_TOKEN ? 'Set' : 'Not set'}`);
console.log(`GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? 'Set' : 'Not set'}`);

console.log('📦 Debug: Testing axios import...');
try {
  const axios = require('axios');
  console.log('✅ axios imported successfully');
} catch (error) {
  console.error('❌ axios import failed:', error.message);
  process.exit(1);
}

console.log('🎯 Debug: Script loaded successfully, ready to run workflow');

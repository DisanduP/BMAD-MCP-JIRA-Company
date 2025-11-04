#!/usr/bin/env node

console.log('🔑 GitHub Token Setup Instructions:');
console.log('=====================================');
console.log('');
console.log('1. Go to: https://github.com/settings/tokens');
console.log('2. Click "Generate new token (classic)"');
console.log('3. Give it a name like "BMAD Workflow Token"');
console.log('4. Select these scopes:');
console.log('   - repo (Full control of private repositories)');
console.log('   - workflow (Update GitHub Action workflows)');
console.log('5. Click "Generate token"');
console.log('6. Copy the token (it starts with ghp_)');
console.log('');
console.log('Then update your .env file with the new token.');
console.log('');
console.log('Current .env file location: /Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company/.env');
console.log('');
console.log('⚠️  IMPORTANT: Keep this token secure and never commit it to git!');

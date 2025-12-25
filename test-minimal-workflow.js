#!/usr/bin/env node

const { execSync } = require('child_process');
const axios = require('axios');

async function testWorkflow() {
  console.log('🚀 Testing Minimal Workflow...');

  const repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
  const jiraBaseUrl = 'https://disandup6.atlassian.net';
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const issueKey = 'KAN-48';

  try {
    // Phase 1: Create branch
    console.log('📝 Phase 1: Creating branch...');
    const timestamp = Date.now();
    const branchName = `feature/test-minimal-${timestamp}`;

    execSync('git checkout v6-alpha', { cwd: repoPath, stdio: 'inherit' });
    execSync('git pull origin v6-alpha', { cwd: repoPath, stdio: 'inherit' });
    execSync(`git checkout -b ${branchName}`, { cwd: repoPath, stdio: 'inherit' });
    console.log(`✅ Branch created: ${branchName}`);

    // Phase 2: Update Jira
    console.log('🎫 Phase 2: Updating Jira...');
    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

    const transitionsResponse = await axios.get(
      `${jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
      { headers: { 'Authorization': `Basic ${auth}` } }
    );

    const transition = transitionsResponse.data.transitions.find(t =>
      t.name.toLowerCase() === 'in progress'
    );

    if (transition) {
      await axios.post(
        `${jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        { transition: { id: transition.id } },
        { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
      );
      console.log('✅ Jira updated to In Progress');
    }

    // Phase 3: Simulate development
    console.log('🤖 Phase 3: Simulating development...');
    const fs = require('fs');
    const featureFile = `feature-test-minimal.md`;
    fs.writeFileSync(featureFile, `# Test Feature\n\nThis is a test feature created by the workflow.`);
    console.log('✅ Feature file created');

    // Phase 4: Commit and push
    console.log('💾 Phase 4: Committing...');
    execSync('git add .', { cwd: repoPath, stdio: 'inherit' });
    execSync('git commit -m "feat: Test minimal workflow"', { cwd: repoPath, stdio: 'inherit' });
    execSync(`git push -u origin ${branchName}`, { cwd: repoPath, stdio: 'inherit' });
    console.log('✅ Changes committed and pushed');

    console.log('🎉 Minimal workflow completed successfully!');

  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

testWorkflow();

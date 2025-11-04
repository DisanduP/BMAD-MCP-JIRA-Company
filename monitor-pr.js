#!/usr/bin/env node

const axios = require('axios');

async function monitorPR() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = 'DisanduP';
  const repoName = 'BMAD-MCP-JIRA-Company';
  const prNumber = 3; // The PR we just created

  console.log(`👀 Monitoring PR #${prNumber} for merge...`);

  const checkInterval = setInterval(async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const pr = response.data;

      if (pr.merged) {
        console.log('✅ PR merged! Completing workflow...');
        clearInterval(checkInterval);

        // Update Jira to Done
        await updateJiraStatus('Done');
        console.log('✅ Jira updated to Done');

        process.exit(0);
      } else if (pr.state === 'closed') {
        console.log('❌ PR closed without merge');
        clearInterval(checkInterval);
        process.exit(1);
      } else {
        console.log(`⏳ PR #${prNumber} still open - checking again in 30 seconds...`);
      }

    } catch (error) {
      console.error('❌ Error checking PR status:', error.message);
    }
  }, 30000); // Check every 30 seconds

  console.log('Press Ctrl+C to stop monitoring');
}

async function updateJiraStatus(status) {
  const jiraBaseUrl = 'https://disandup6.atlassian.net';
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const issueKey = 'KAN-48';

  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    const transitionsResponse = await axios.get(
      `${jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
      { headers: { 'Authorization': `Basic ${auth}` } }
    );

    const transition = transitionsResponse.data.transitions.find(t =>
      t.name.toLowerCase() === status.toLowerCase()
    );

    if (transition) {
      await axios.post(
        `${jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        { transition: { id: transition.id } },
        { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
      );
      console.log(`✅ Jira status updated to: ${status}`);
    }
  } catch (error) {
    console.error('❌ Jira update failed:', error.message);
  }
}

monitorPR();

#!/usr/bin/env node

const axios = require('axios');

async function createPR() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = 'DisanduP';
  const repoName = 'BMAD-MCP-JIRA-Company';
  const branchName = 'feature/test-minimal-1762241902627';

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
      {
        title: 'feat: Test minimal workflow',
        head: branchName,
        base: 'v6-alpha',
        body: 'This PR was created by the BMAD workflow automation system.\n\n## Changes\n- Added test feature file\n- Updated workflow test script\n\n## Jira\n- Issue: KAN-48\n- Status: In Progress'
      },
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log(`✅ PR created: ${response.data.html_url}`);
    return response.data.number;

  } catch (error) {
    console.error('❌ PR creation failed:', error.response?.data || error.message);
  }
}

createPR();

#!/usr/bin/env node

const axios = require('axios');

async function testGitHubToken() {
  const githubToken = process.env.GITHUB_TOKEN;
  const owner = 'DisanduP';
  const repo = 'BMAD-MCP-JIRA-Company';

  console.log('Testing GitHub API token...');

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log('✅ GitHub token is valid!');
    console.log('Repository:', response.data.full_name);
    console.log('Default branch:', response.data.default_branch);

  } catch (error) {
    console.error('❌ GitHub token test failed:', error.response?.data?.message || error.message);
  }
}

testGitHubToken();

#!/usr/bin/env node

const axios = require('axios');

async function testPRCreation() {
  const githubToken = process.env.GITHUB_TOKEN;
  const owner = 'DisanduP';
  const repo = 'BMAD-MCP-JIRA-Company';

  console.log('Testing PR creation...');

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        title: 'Test PR Creation',
        head: 'feature/complete-workflow-implementation',
        base: 'v6-alpha',
        body: 'Testing PR creation from workflow\n\n**Jira Issue:** TEST-123\n\n🤖 **BMAD Agent Implementation**\nThis is a test PR.',
        draft: false
      },
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log('✅ PR created successfully!');
    console.log('PR Number:', response.data.number);
    console.log('PR URL:', response.data.html_url);

  } catch (error) {
    console.error('❌ PR creation failed:', error.response?.data?.message || error.message);
  }
}

testPRCreation();

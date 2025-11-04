#!/usr/bin/env node

const axios = require('axios');

async function testJiraConnection() {
  const jiraBaseUrl = 'https://disandup6.atlassian.net';
  const jiraEmail = process.env.JIRA_EMAIL || 'disandup6@gmail.com';
  const jiraToken = process.env.JIRA_API_TOKEN || 'YOUR_JIRA_API_TOKEN';

  console.log('Testing Jira connection...');

  try {
    const response = await axios.get(`${jiraBaseUrl}/rest/api/3/issue/KAN-48`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`
      }
    });

    console.log('✅ Jira connection successful!');
    console.log('Issue:', response.data.key, '-', response.data.fields.summary);

  } catch (error) {
    console.error('❌ Jira connection failed:', error.response?.data?.message || error.message);
  }
}

testJiraConnection();

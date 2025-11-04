#!/usr/bin/env node

// Direct execution instead of importing the class
const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BMADCompleteWorkflow {
  constructor() {
    this.repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
    this.jiraBaseUrl = 'https://disandup6.atlassian.net';
    this.jiraEmail = process.env.JIRA_EMAIL;
    this.jiraToken = process.env.JIRA_API_TOKEN;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubOwner = 'DisanduP';
    this.githubRepo = 'BMAD-MCP-JIRA-Company';
  }

  createFeatureBranch(featureName) {
    const timestamp = Date.now();
    const branchName = `feature/${featureName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${timestamp}`;

    console.log(`🌿 Creating feature branch: ${branchName}`);

    execSync('git checkout v6-alpha', { cwd: this.repoPath, stdio: 'inherit' });
    execSync('git pull origin v6-alpha', { cwd: this.repoPath, stdio: 'inherit' });
    execSync(`git checkout -b ${branchName}`, { cwd: this.repoPath, stdio: 'inherit' });

    return branchName;
  }

  commitAndPush(branchName, message) {
    console.log(`💾 Committing and pushing changes`);

    execSync('git add .', { cwd: this.repoPath, stdio: 'inherit' });
    execSync(`git commit -m "${message}"`, { cwd: this.repoPath, stdio: 'inherit' });
    execSync(`git push -u origin ${branchName}`, { cwd: this.repoPath, stdio: 'inherit' });

    return `https://github.com/${this.githubOwner}/${this.githubRepo}/tree/${branchName}`;
  }

  async updateJiraStatus(issueKey, status) {
    console.log(`🎫 Updating Jira ${issueKey} to: ${status}`);

    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');

    try {
      const transitionsResponse = await axios.get(
        `${this.jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        { headers: { 'Authorization': `Basic ${auth}` } }
      );

      const transition = transitionsResponse.data.transitions.find(t =>
        t.name.toLowerCase() === status.toLowerCase()
      );

      if (transition) {
        await axios.post(
          `${this.jiraBaseUrl}/rest/api/3/issue/${issueKey}/transitions`,
          { transition: { id: transition.id } },
          { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
        );
        console.log(`✅ Jira ${issueKey} moved to: ${status}`);
      } else {
        console.log(`⚠️ Transition to "${status}" not available`);
      }
    } catch (error) {
      console.error(`❌ Jira update failed: ${error.message}`);
    }
  }

  async simulateBMADDevelopment(featureName) {
    console.log(`🤖 Simulating BMAD development for: ${featureName}`);

    const featureFile = path.join(this.repoPath, `feature-${Date.now()}.md`);
    const content = `# ${featureName}

## Implementation
This feature was implemented by BMAD agents.

## Status
✅ Ready for review
`;

    fs.writeFileSync(featureFile, content);
    console.log(`✅ Feature file created: ${path.basename(featureFile)}`);
  }

  async createPullRequest(branchName, title, description) {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/pulls`,
        {
          title: `feat: ${title}`,
          head: branchName,
          base: 'v6-alpha',
          body: `${description}\n\n🤖 **BMAD Agent Implementation**\nThis PR was created automatically by the BMAD workflow.`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      console.log(`✅ PR created: ${response.data.html_url}`);
      return response.data.number;

    } catch (error) {
      console.error('❌ PR creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async runCompleteWorkflow(featureName, description, jiraIssueKey) {
    try {
      console.log(`🚀 Starting Complete BMAD Workflow`);
      console.log(`📋 Feature: ${featureName}`);
      console.log(`🎫 Jira: ${jiraIssueKey}`);

      // Phase 1: Branch Creation
      console.log(`\n📝 Phase 1: Branch Creation`);
      const branchName = this.createFeatureBranch(featureName);

      // Phase 2: Jira Update
      console.log(`\n🎫 Phase 2: Jira Update`);
      await this.updateJiraStatus(jiraIssueKey, 'In Progress');

      // Phase 3: Development
      console.log(`\n🤖 Phase 3: BMAD Development`);
      await this.simulateBMADDevelopment(featureName);

      // Phase 4: Commit & Push
      console.log(`\n💾 Phase 4: Commit & Push`);
      this.commitAndPush(branchName, `feat: ${featureName}`);

      // Phase 5: Create PR
      console.log(`\n🔄 Phase 5: Create PR`);
      const prNumber = await this.createPullRequest(branchName, featureName, description);

      console.log(`\n🎉 Workflow completed! PR #${prNumber} created for human review.`);

    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
    }
  }
}

async function runWorkflow() {
  const featureRequest = process.argv[2];

  if (!featureRequest) {
    console.error('❌ Please provide a feature request as an argument');
    console.log('Usage: node run-workflow.js "Your feature request"');
    process.exit(1);
  }

  console.log(`🚀 Starting BMAD Workflow for: "${featureRequest}"`);

  const workflow = new BMADCompleteWorkflow();
  const description = `Implementation of: ${featureRequest}`;
  const jiraIssueKey = 'KAN-48';

  await workflow.runCompleteWorkflow(featureRequest, description, jiraIssueKey);
}

runWorkflow();

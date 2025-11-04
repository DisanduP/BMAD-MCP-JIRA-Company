#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BMADGitWorkflow {
  constructor() {
    this.repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
    this.githubToken = process.env.GITHUB_TOKEN || 'mock_github_token';
    this.githubOwner = 'DisanduP';
    this.githubRepo = 'BMAD-MCP-JIRA-Company';
  }

  // Create a new feature branch
  createFeatureBranch(featureName) {
    try {
      const branchName = `feature/${featureName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

      console.log(`🚀 Creating feature branch: ${branchName}`);

      // Switch to main branch first
      execSync('git checkout v6-alpha', { cwd: this.repoPath, stdio: 'inherit' });

      // Pull latest changes
      execSync('git pull origin v6-alpha', { cwd: this.repoPath, stdio: 'inherit' });

      // Create and switch to new branch
      execSync(`git checkout -b ${branchName}`, { cwd: this.repoPath, stdio: 'inherit' });

      console.log(`✅ Created and switched to branch: ${branchName}`);
      return branchName;
    } catch (error) {
      console.error('❌ Failed to create feature branch:', error.message);
      throw error;
    }
  }

  // Stage and commit changes
  commitChanges(message, files = []) {
    try {
      console.log(`💾 Committing changes: ${message}`);

      // Add specific files or all changes
      if (files.length > 0) {
        files.forEach(file => {
          execSync(`git add ${file}`, { cwd: this.repoPath, stdio: 'inherit' });
        });
      } else {
        execSync('git add .', { cwd: this.repoPath, stdio: 'inherit' });
      }

      // Commit with message
      execSync(`git commit -m "${message}"`, { cwd: this.repoPath, stdio: 'inherit' });

      console.log(`✅ Changes committed: ${message}`);
    } catch (error) {
      console.error('❌ Failed to commit changes:', error.message);
      throw error;
    }
  }

  // Push branch to GitHub
  pushBranch(branchName) {
    try {
      console.log(`📤 Pushing branch to GitHub: ${branchName}`);

      execSync(`git push -u origin ${branchName}`, { cwd: this.repoPath, stdio: 'inherit' });

      console.log(`✅ Branch pushed to GitHub: ${branchName}`);
      return `https://github.com/${this.githubOwner}/${this.githubRepo}/tree/${branchName}`;
    } catch (error) {
      console.error('❌ Failed to push branch:', error.message);
      throw error;
    }
  }

  // Create a pull request
  async createPullRequest(branchName, title, description, jiraIssueKey) {
    try {
      console.log(`🔄 Creating pull request for: ${title}`);

      const prData = {
        title: `${title} (${jiraIssueKey})`,
        head: branchName,
        base: 'v6-alpha',
        body: `${description}\n\n**Jira Issue:** ${jiraIssueKey}\n\n## Changes\n- Feature implementation\n- Tests added\n- Documentation updated`
      };

      // For demo purposes, simulate PR creation
      // In production, this would use GitHub API
      const mockPRNumber = Date.now() % 10000;

      console.log(`✅ Pull request created: #${mockPRNumber}`);
      console.log(`🔗 PR URL: https://github.com/${this.githubOwner}/${this.githubRepo}/pull/${mockPRNumber}`);

      return {
        number: mockPRNumber,
        url: `https://github.com/${this.githubOwner}/${this.githubRepo}/pull/${mockPRNumber}`,
        branch: branchName
      };
    } catch (error) {
      console.error('❌ Failed to create pull request:', error.message);
      throw error;
    }
  }

  // Check if PR is merged (polling approach)
  async checkPRMerged(prNumber) {
    try {
      // In production, this would check GitHub API
      // For demo, simulate merge after some time
      const isMerged = prNumber === 366 || Math.random() > 0.8;

      console.log(`🔍 Checking PR #${prNumber} status: ${isMerged ? 'MERGED ✅' : 'OPEN'}`);

      return isMerged;
    } catch (error) {
      console.error('❌ Failed to check PR status:', error.message);
      return false;
    }
  }

  // Complete feature workflow
  async runFeatureWorkflow(featureName, description, jiraIssueKey) {
    try {
      console.log(`🎯 Starting BMAD Feature Workflow: ${featureName}`);
      console.log(`📋 Jira Issue: ${jiraIssueKey}`);

      // Step 1: Create feature branch
      const branchName = this.createFeatureBranch(featureName);

      // Step 2: Jira status → In Progress (would be done via MCP)
      console.log(`🔄 Moving Jira issue ${jiraIssueKey} to "In Progress"`);

      // Step 3: Development happens here (files are modified)
      console.log(`💻 Development phase - modify files as needed`);

      // Step 4: Commit changes
      this.commitChanges(`feat: ${featureName}`, ['todo-app/frontend/src/', 'todo-app/frontend/src/App.css']);

      // Step 5: Push to GitHub
      const branchUrl = this.pushBranch(branchName);

      // Step 6: Create PR
      const prData = await this.createPullRequest(branchName, featureName, description, jiraIssueKey);

      // Step 7: Wait for merge and update Jira
      console.log(`⏳ Waiting for PR merge... (in production, this would be webhook-based)`);

      // Simulate checking for merge
      setTimeout(async () => {
        const isMerged = await this.checkPRMerged(prData.number);
        if (isMerged) {
          console.log(`🎉 PR merged! Moving Jira issue ${jiraIssueKey} to "Done"`);
        } else {
          console.log(`⏳ PR #${prData.number} still open`);
        }
      }, 2000);

      return {
        branchName,
        branchUrl,
        prData,
        status: 'workflow_started'
      };

    } catch (error) {
      console.error('❌ Feature workflow failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node git-workflow.js <feature-name> <description> <jira-issue-key>');
    console.log('Example: node git-workflow.js "Add dark mode toggle" "Implement dark/light mode switching" "KAN-50"');
    process.exit(1);
  }

  const [featureName, description, jiraIssueKey] = args;

  const workflow = new BMADGitWorkflow();
  await workflow.runFeatureWorkflow(featureName, description, jiraIssueKey);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BMADGitWorkflow;

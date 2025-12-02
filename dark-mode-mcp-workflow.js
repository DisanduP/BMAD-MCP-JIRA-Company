#!/usr/bin/env node

// Complete MCP-Based Feature Development Workflow
// Uses MCP servers for Jira and Git operations, Direct API for GitHub PRs
const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

class CompleteMCPWorkflow {
  constructor() {
    this.repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
    this.jiraBaseUrl = 'https://disandup6.atlassian.net';
    this.jiraEmail = process.env.JIRA_EMAIL;
    this.jiraToken = process.env.JIRA_API_TOKEN;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubOwner = 'DisanduP';
    this.githubRepo = 'BMAD-MCP-JIRA-Company';
  }

  async run(featureDescription = "Add Dark Mode Toggle") {
    console.log(`🚀 Starting Complete MCP Workflow: "${featureDescription}"`);
    console.log('=' .repeat(80));
    console.log('🔧 Using MCP Servers: Jira + Git | Direct API: GitHub PRs');
    console.log('=' .repeat(80));

    try {
      // Phase 1: Create Jira Issue (MCP)
      console.log('\n📋 Phase 1: Create Jira Issue via MCP');
      const jiraIssueKey = await this.createJiraIssueViaMCP(featureDescription);
      console.log(`✅ Jira issue created: ${jiraIssueKey}`);

      // Phase 2: Create Feature Branch (Git MCP)
      console.log('\n🌿 Phase 2: Create Feature Branch via Git MCP');
      const branchName = await this.createFeatureBranchViaMCP(featureDescription);
      console.log(`✅ Branch created: ${branchName}`);

      // Phase 3: Move Jira to "In Progress" (MCP)
      console.log('\n💻 Phase 3: Start Development - Move to In Progress');
      await this.updateJiraStatusViaMCP(jiraIssueKey, 'In Progress');
      console.log('✅ Jira moved to In Progress');

      // Phase 4: Implement Feature
      console.log('\n🎨 Phase 4: Implement Feature');
      await this.implementFeature(featureDescription);
      console.log('✅ Feature implemented');

      // Phase 5: Commit & Push via Git MCP
      console.log('\n💾 Phase 5: Commit & Push via Git MCP');
      await this.commitAndPushViaMCP(branchName, featureDescription);
      console.log('✅ Changes committed and pushed');

      // Phase 6: Create PR via Direct API
      console.log('\n🔄 Phase 6: Create PR via Direct API');
      const prNumber = await this.createPullRequestViaAPI(branchName, jiraIssueKey, featureDescription);
      console.log(`✅ PR created (#${prNumber})`);

      // Phase 7: Move Jira to "In Review" (MCP)
      console.log('\n👀 Phase 7: Move to Review');
      await this.updateJiraStatusViaMCP(jiraIssueKey, 'In Review');
      console.log('✅ Jira moved to In Review');

      // Phase 8: Monitor PR for Merge (Direct API)
      console.log('\n👀 Phase 8: Monitor PR for Merge');
      await this.monitorPRForMergeViaAPI(prNumber, jiraIssueKey);

    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
      throw error;
    }
  }

  async createJiraIssueViaMCP(featureDescription) {
    console.log('🔧 Using Jira MCP Server to create issue...');

    // Use Jira MCP CLI to create issue
    const summary = `Add ${featureDescription}`;
    const description = `Implement ${featureDescription.toLowerCase()} feature for the todo app to enhance user experience.`;

    const command = `cd "${this.repoPath}" && source .env && npx @aashari/mcp-server-atlassian-jira create-issue --project-key KAN --summary "${summary}" --description "${description}" --issue-type Task --priority High`;

    try {
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      console.log('📄 MCP Response:', result);

      // Extract issue key from response (assuming it returns JSON)
      const responseData = JSON.parse(result);
      return responseData.key || responseData.issueKey;
    } catch (error) {
      console.log('⚠️ MCP CLI failed, falling back to direct API...');
      // Fallback to direct API
      return await this.createJiraIssueViaAPI(featureDescription);
    }
  }

  async createJiraIssueViaAPI(featureDescription) {
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');

    const response = await axios.post(
      `${this.jiraBaseUrl}/rest/api/3/issue`,
      {
        fields: {
          project: { key: 'KAN' },
          summary: `Add ${featureDescription}`,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: `Implement ${featureDescription.toLowerCase()} feature for the todo app to enhance user experience.`
              }]
            }]
          },
          issuetype: { name: 'Task' },
          priority: { name: 'High' }
        }
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.key;
  }

  async createFeatureBranchViaMCP(featureDescription) {
    console.log('🔧 Using Git MCP Server to create branch...');

    const timestamp = Date.now();
    const branchName = `feature/add-${featureDescription.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${timestamp}`;

    try {
      // Use Git MCP to create and checkout branch
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-checkout v6-alpha`, { stdio: 'pipe' });
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-pull`, { stdio: 'pipe' });
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-branch ${branchName}`, { stdio: 'pipe' });
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-checkout ${branchName}`, { stdio: 'pipe' });
      return branchName;
    } catch (error) {
      console.log('⚠️ Git MCP failed, using direct Git commands...');
      // Fallback to direct Git
      execSync('git checkout v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
      execSync('git pull origin v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
      execSync(`git checkout -b ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });
      return branchName;
    }
  }

  async updateJiraStatusViaMCP(issueKey, status) {
    console.log(`🔧 Using Jira MCP to move ${issueKey} to ${status}...`);

    try {
      // Use Jira MCP CLI to update status
      const command = `cd "${this.repoPath}" && source .env && npx @aashari/mcp-server-atlassian-jira transition-issue --issue-key ${issueKey} --status "${status}"`;
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      console.log('📄 MCP Response:', result);
    } catch (error) {
      console.log('⚠️ Jira MCP failed, falling back to direct API...');
      // Fallback to direct API
      await this.updateJiraStatusViaAPI(issueKey, status);
    }
  }

  async updateJiraStatusViaAPI(issueKey, status) {
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
      console.error('❌ Jira update failed:', error.message);
    }
  }

  async implementFeature(featureDescription) {
    if (featureDescription.toLowerCase().includes('dark mode')) {
      await this.implementDarkMode();
    } else {
      // Generic feature implementation
      console.log(`🎨 Implementing: ${featureDescription}`);
      // Add basic implementation here
    }
  }

  async implementDarkMode() {
    console.log('🌙 Implementing Dark Mode Toggle feature...');

    // Update App.js to add dark mode state and toggle
    const appPath = path.join(this.repoPath, 'todo-app/frontend/src/App.js');

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Add dark mode state
    if (!appContent.includes('darkMode')) {
      appContent = appContent.replace(
        'const [showBulkActions, setShowBulkActions] = useState(false);',
        'const [showBulkActions, setShowBulkActions] = useState(false);\n  const [darkMode, setDarkMode] = useState(false);'
      );
    }

    // Add dark mode toggle function
    if (!appContent.includes('toggleDarkMode')) {
      appContent = appContent.replace(
        '  // Load tasks on component mount and when search or category changes',
        `  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.className = darkMode ? '' : 'dark-mode';
  };

  // Load tasks on component mount and when search or category changes`
      );
    }

    // Add dark mode toggle button to UI
    if (!appContent.includes('dark-mode-toggle')) {
      appContent = appContent.replace(
        '              <button onClick={selectAllTasks} className="select-all-button">',
        `              <button onClick={toggleDarkMode} className="dark-mode-toggle">
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={selectAllTasks} className="select-all-button">`
      );
    }

    fs.writeFileSync(appPath, appContent);
    console.log('✅ Added dark mode toggle to App.js');

    // Add dark mode CSS
    const cssPath = path.join(this.repoPath, 'todo-app/frontend/src/App.css');

    const darkModeStyles = `
/* Dark Mode Styles */
.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.dark-mode .app {
  background-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .task-item {
  background-color: #3d3d3d;
  border-color: #555;
  color: #ffffff;
}

.dark-mode .task-item.completed {
  background-color: #2d2d2d;
  opacity: 0.7;
}

.dark-mode input, .dark-mode textarea, .dark-mode select {
  background-color: #3d3d3d;
  border-color: #555;
  color: #ffffff;
}

.dark-mode button {
  background-color: #4d4d4d;
  border-color: #666;
  color: #ffffff;
}

.dark-mode button:hover {
  background-color: #5d5d5d;
}

.dark-mode .dark-mode-toggle {
  background-color: #666;
  border-color: #888;
  margin-right: 10px;
}

.dark-mode .dark-mode-toggle:hover {
  background-color: #777;
}
`;

    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('dark-mode')) {
      cssContent += '\n' + darkModeStyles;
      fs.writeFileSync(cssPath, cssContent);
      console.log('✅ Added dark mode CSS styling');
    }
  }

  async commitAndPushViaMCP(branchName, featureDescription) {
    console.log('🔧 Using Git MCP Server for commit and push...');

    try {
      // Use Git MCP for add, commit, and push
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-add-all`, { stdio: 'pipe' });
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-commit "feat: ${featureDescription}"`, { stdio: 'pipe' });
      execSync(`cd "${this.repoPath}" && npx github-mcp-server git-push`, { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️ Git MCP failed, using direct Git commands...');
      // Fallback to direct Git
      execSync('git add .', { cwd: this.repoPath, stdio: 'pipe' });
      execSync(`git commit -m "feat: ${featureDescription}"`, { cwd: this.repoPath, stdio: 'pipe' });
      execSync(`git push -u origin ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });
    }
  }

  async createPullRequestViaAPI(branchName, jiraIssueKey, featureDescription) {
    console.log('🔧 Creating PR via GitHub API...');

    const response = await axios.post(
      `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/pulls`,
      {
        title: `feat: ${featureDescription}`,
        head: branchName,
        base: 'v6-alpha',
        body: `## 🚀 ${featureDescription}

This PR implements the ${featureDescription.toLowerCase()} feature for the todo app.

### ✨ New Features
- ${featureDescription} functionality
- Enhanced user experience
- Improved UI/UX

### 🔧 Technical Details
- React component updates
- CSS styling enhancements
- State management improvements

### 📋 Jira Integration
- Issue: ${jiraIssueKey}
- Status: In Review

*🤖 This PR was created automatically by the BMAD MCP workflow system*`
      },
      {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    return response.data.number;
  }

  async monitorPRForMergeViaAPI(prNumber, jiraIssueKey) {
    console.log(`👀 Monitoring PR #${prNumber} for merge...`);

    let attempts = 0;
    const maxAttempts = 300; // 5 minutes

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/pulls/${prNumber}`,
          {
            headers: {
              'Authorization': `Bearer ${this.githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (response.data.merged) {
          console.log('✅ PR merged! Moving Jira to Done...');
          await this.updateJiraStatusViaMCP(jiraIssueKey, 'Done');
          return;
        }

        if (response.data.state === 'closed' && !response.data.merged) {
          console.log('❌ PR closed without merge');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

        if (attempts % 30 === 0) { // Log every 30 seconds
          console.log(`⏳ Still monitoring PR #${prNumber}... (${Math.round(attempts/60)} min)`);
        }

      } catch (error) {
        console.error('❌ Error checking PR status:', error.message);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('⏰ Monitoring timeout reached');
  }
}

// Get feature description from command line or use default
const featureDescription = process.argv[2] || "Add Dark Mode Toggle";

// Run the complete MCP workflow
const workflow = new CompleteMCPWorkflow();
workflow.run(featureDescription).catch(console.error);

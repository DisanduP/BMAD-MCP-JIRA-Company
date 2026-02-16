# BMAD MCP Server Setup Guide

## 🚀 Complete MCP Integration Setup for Jira + GitHub Automation

This guide provides step-by-step instructions for setting up the BMAD (Bot-Managed Automated Development) system with MCP (Model Context Protocol) servers for automated Jira and GitHub workflow management.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Jira MCP Server Setup](#jira-mcp-server-setup)
- [GitHub MCP Server Setup](#github-mcp-server-setup)
- [BMAD System Configuration](#bmad-system-configuration)
- [Environment Variables](#environment-variables)
- [Workflow Scripts](#workflow-scripts)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: v2.30.0 or higher
- **Operating System**: macOS, Linux, or Windows

### Accounts Required
- **Atlassian Jira Account**: With API token access
- **GitHub Account**: With repository access and personal access token
- **GitHub Repository**: For the project codebase

### Development Environment
```bash
# Check versions
node --version  # Should be v18+
npm --version   # Should be v8+
git --version   # Should be v2.30+
```

## 📊 Jira MCP Server Setup

### 1. Install Jira MCP Server

```bash
# Install the Atlassian Jira MCP server globally
npm install -g @aashari/mcp-server-atlassian-jira

# Verify installation
npx @aashari/mcp-server-atlassian-jira --version
```

### 2. Create Jira API Token

1. **Log into Atlassian:**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Name it "BMAD-MCP-Jira"
   - Copy the generated token (keep it secure!)

2. **Get Your Jira Site Name:**
   - Your Jira URL is typically: `https://YOUR-SITE.atlassian.net`
   - The site name is `YOUR-SITE` (everything before `.atlassian.net`)

### 3. Configure Jira Environment Variables

Create a `.env` file in your project root:

```bash
# Jira Configuration
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JIRA_SITE_NAME=your-site-name
JIRA_BASE_URL=https://your-site-name.atlassian.net
```

### 4. Test Jira MCP Connection

```bash
# Test Jira connection with environment variables
source .env && npx @aashari/mcp-server-atlassian-jira ls-projects

# Expected output: List of your Jira projects
```

### 5. Verify Jira Project Access

```bash
# List available projects
source .env && npx @aashari/mcp-server-atlassian-jira ls-projects

# Check specific project details
source .env && npx @aashari/mcp-server-atlassian-jira get-project --project-key YOUR_PROJECT_KEY
```

## 🐙 GitHub MCP Server Setup

### 1. Install GitHub MCP Server

```bash
# Install the GitHub MCP server globally
npm install -g github-mcp-server

# Verify installation
npx github-mcp-server --help
```

### 2. Create GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Navigate to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)

2. **Name and Create:**
   - Token name: "BMAD-MCP-GitHub"
   - Copy the token immediately (you won't see it again!)

### 3. Configure GitHub Environment Variables

Add to your `.env` file:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_OWNER=YourGitHubUsername
GITHUB_REPO=YourRepositoryName
```

### 4. Test GitHub MCP Connection

```bash
# Test GitHub MCP connection
source .env && npx github-mcp-server git-status

# Expected output: Current repository status
```

### 5. Verify Repository Access

```bash
# Check repository information
source .env && npx github-mcp-server git-status

# Test branch operations
source .env && npx github-mcp-server git-branch
```

## 🤖 BMAD System Configuration

### 1. Project Structure Setup

Create the following directory structure:

```
your-project/
├── .env                    # Environment variables (DO NOT COMMIT)
├── package.json           # Node.js dependencies
├── mcp-config.json        # MCP server configuration
├── complete-mcp-workflow.js # Main workflow script
├── enhanced-task-dates-workflow.js
├── dark-mode-mcp-workflow.js
└── todo-app/              # Your application code
    ├── server.js
    ├── package.json
    └── frontend/
        ├── src/
        │   ├── App.js
        │   └── App.css
        └── package.json
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install axios dotenv

# Install development dependencies (optional)
npm install --save-dev nodemon
```

### 3. Create MCP Configuration

Create `mcp-config.json`:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@aashari/mcp-server-atlassian-jira"],
      "env": {
        "ATLASSIAN_SITE_NAME": "your-site-name",
        "ATLASSIAN_USER_EMAIL": "your-email@example.com",
        "ATLASSIAN_API_TOKEN": "ATATT3xFfGF0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    },
    "github": {
      "command": "npx",
      "args": ["github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

### 4. Environment Variables Template

Create `.env.example` for other developers:

```bash
# Jira Configuration
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JIRA_SITE_NAME=your-site-name
JIRA_BASE_URL=https://your-site-name.atlassian.net

# GitHub Configuration
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_OWNER=YourGitHubUsername
GITHUB_REPO=YourRepositoryName

# Application Configuration
NODE_ENV=development
PORT=3001
```

## 📝 Workflow Scripts

### Complete MCP Workflow Script

The main workflow script (`complete-mcp-workflow.js`) handles:

1. **Jira Issue Creation** - Creates new feature tickets
2. **Git Branch Management** - Creates feature branches
3. **Status Transitions** - Moves Jira issues through workflow
4. **Code Implementation** - Adds features to your application
5. **Commit & Push** - Commits changes via Git MCP
6. **PR Creation** - Creates pull requests via GitHub API
7. **PR Monitoring** - Waits for merge and updates Jira

### Usage Examples

```bash
# Run complete workflow for a new feature
node complete-mcp-workflow.js "Add Dark Mode Toggle"

# Run specific workflow scripts
node enhanced-task-dates-workflow.js
node dark-mode-mcp-workflow.js
```

## 🎯 Usage Examples

### Example 1: Complete Feature Workflow

```bash
# 1. Start the workflow
node complete-mcp-workflow.js "Add User Authentication"

# 2. The system will:
#    - Create Jira issue: "Add User Authentication"
#    - Create branch: feature/add-user-authentication-[timestamp]
#    - Move Jira to "In Progress"
#    - Implement authentication feature
#    - Commit and push changes
#    - Create pull request
#    - Move Jira to "In Review"
#    - Monitor PR for merge
#    - Move Jira to "Done" when merged
```

### Example 2: Manual MCP Operations

```bash
# Jira Operations
source .env && npx @aashari/mcp-server-atlassian-jira ls-projects
source .env && npx @aashari/mcp-server-atlassian-jira get-issue --issue-key PROJ-123
source .env && npx @aashari/mcp-server-atlassian-jira ls-issues --project-key PROJ

# Git Operations
source .env && npx github-mcp-server git-status
source .env && npx github-mcp-server git-branch
source .env && npx github-mcp-server git-log
```

### Example 3: Testing the Setup

```bash
# Test Jira MCP
source .env && npx @aashari/mcp-server-atlassian-jira ls-projects | head -5

# Test GitHub MCP
source .env && npx github-mcp-server git-status

# Test workflow script
node complete-mcp-workflow.js "Test Feature"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Jira MCP Authentication Errors

**Error:** `Missing Atlassian credentials`

**Solution:**
```bash
# Check environment variables
echo $JIRA_EMAIL
echo $JIRA_API_TOKEN
echo $JIRA_SITE_NAME

# Test with explicit environment variables
ATLASSIAN_SITE_NAME=your-site ATLASSIAN_USER_EMAIL=your@email.com ATLASSIAN_API_TOKEN=your-token npx @aashari/mcp-server-atlassian-jira ls-projects
```

#### 2. GitHub MCP Repository Errors

**Error:** `Repository not found` or `Authentication failed`

**Solution:**
```bash
# Verify GitHub token scopes
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user

# Check repository access
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/repos/YOUR_OWNER/YOUR_REPO

# Ensure you're in the correct directory
pwd && ls -la
```

#### 3. Workflow Script Failures

**Error:** `Command failed` or `API Error`

**Solutions:**
```bash
# Check Node.js version
node --version

# Verify all dependencies are installed
npm install

# Test individual components
node -e "require('axios'); console.log('Axios OK')"
node -e "require('dotenv').config(); console.log('Dotenv OK')"

# Check file permissions
ls -la complete-mcp-workflow.js
```

#### 4. Pull Request Creation Issues

**Error:** `422 Unprocessable Entity`

**Common Causes:**
- Branch not pushed to remote
- Base branch doesn't exist
- Repository permissions insufficient

**Solution:**
```bash
# Ensure branch is pushed
git push -u origin feature/your-branch

# Verify branches exist
git branch -r

# Check GitHub permissions
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user/repos
```

### Debug Mode

Enable detailed logging:

```bash
# Jira MCP debug
DEBUG=mcp:* source .env && npx @aashari/mcp-server-atlassian-jira ls-projects

# GitHub MCP debug
DEBUG=github-mcp:* source .env && npx github-mcp-server git-status

# Node.js debug
DEBUG=* node complete-mcp-workflow.js "Test Feature"
```

## ⚙️ Advanced Configuration

### Custom Workflow Scripts

Create custom workflow scripts by extending the base `CompleteMCPWorkflow` class:

```javascript
const { CompleteMCPWorkflow } = require('./complete-mcp-workflow');

class CustomWorkflow extends CompleteMCPWorkflow {
  async implementFeature(featureDescription) {
    // Custom implementation logic
    if (featureDescription.includes('authentication')) {
      await this.implementAuthentication();
    } else {
      await super.implementFeature(featureDescription);
    }
  }

  async implementAuthentication() {
    // Custom authentication implementation
    console.log('🔐 Implementing authentication...');
    // Your custom code here
  }
}
```

### MCP Server Customization

Modify `mcp-config.json` for custom MCP server configurations:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@aashari/mcp-server-atlassian-jira"],
      "env": {
        "ATLASSIAN_SITE_NAME": "your-site",
        "ATLASSIAN_USER_EMAIL": "your@email.com",
        "ATLASSIAN_API_TOKEN": "your-token"
      },
      "timeout": 30000
    },
    "github": {
      "command": "npx",
      "args": ["github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      },
      "workingDirectory": "/path/to/repo"
    }
  }
}
```

### CI/CD Integration

Integrate BMAD workflows with CI/CD pipelines:

```yaml
# .github/workflows/bmad-automation.yml
name: BMAD Feature Automation

on:
  workflow_dispatch:
    inputs:
      feature_description:
        description: 'Feature description'
        required: true

jobs:
  automate-feature:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run BMAD workflow
        run: node complete-mcp-workflow.js "${{ github.event.inputs.feature_description }}"
        env:
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📚 Additional Resources

### Documentation Links
- [Jira MCP Server Documentation](https://www.npmjs.com/package/@aashari/mcp-server-atlassian-jira)
- [GitHub MCP Server Documentation](https://www.npmjs.com/package/github-mcp-server)
- [Atlassian Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [GitHub REST API](https://docs.github.com/en/rest)

### Community Support
- [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
- [MCP Community Discord](https://discord.gg/mcp)
- [GitHub MCP Issues](https://github.com/github/github-mcp-server/issues)

### Security Best Practices
- Never commit `.env` files to version control
- Use GitHub Secrets for CI/CD pipelines
- Rotate API tokens regularly
- Limit token scopes to minimum required permissions
- Use environment-specific configurations

---

## 🎉 Quick Start Checklist

- [ ] Install Node.js and npm
- [ ] Create Jira API token
- [ ] Create GitHub personal access token
- [ ] Clone or create your project repository
- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Install MCP servers globally
- [ ] Test Jira MCP connection
- [ ] Test GitHub MCP connection
- [ ] Run a test workflow
- [ ] Customize workflows for your needs

**Happy automating! 🚀**

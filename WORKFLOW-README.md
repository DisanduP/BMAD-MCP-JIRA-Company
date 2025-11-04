# BMAD Complete Workflow

A comprehensive Git + Jira integration workflow for feature development that automates the entire development lifecycle.

## Overview

This workflow automates:
- Feature branch creation from `v6-alpha`
- Jira status updates (To Do → In Progress → In Review → Done)
- Git commits and pushes
- Pull request creation
- PR merge monitoring with automatic Jira completion

## Prerequisites

1. **Git Repository**: Must be on `v6-alpha` branch
2. **Jira Access**: Valid API token and issue access
3. **GitHub Access**: Repository push permissions
4. **Node.js**: For running the workflow script

## Usage

```bash
node complete-workflow.js "Feature Name" "Feature Description" "JIRA-KEY"
```

### Example

```bash
node complete-workflow.js "Add user authentication" "Implement login/logout functionality" "KAN-51"
```

## Workflow Phases

### Phase 1: Planning & Setup
- Creates timestamped feature branch: `feature/feature-name-timestamp`
- Switches from `v6-alpha` and pulls latest changes

### Phase 2: Development Started
- Moves Jira issue to "In Progress"
- Adds comment with branch information

### Phase 3: BMAD Agent Development
- **NEW**: Triggers BMAD agents to implement the feature automatically
- Agents analyze requirements and create/modify necessary files
- No manual development required - agents handle the implementation

### Phase 4: Commit & Push
- Stages and commits all changes (including agent-generated files)
- Pushes to remote repository

### Phase 5: Pull Request Creation
- **NEW**: Creates real GitHub pull request (if token provided)
- Falls back to simulation if no GitHub token
- Moves Jira to "In Review"
- Adds PR link to Jira comments

### Phase 6: Merge Monitoring
- Monitors PR status every 30 seconds
- When merged: moves Jira to "Done"
- Adds completion comment

## Configuration

Edit the constructor in `complete-workflow.js` or set environment variables:

```javascript
this.repoPath = '/path/to/your/repo';
this.jiraBaseUrl = 'https://yourcompany.atlassian.net';
this.jiraEmail = process.env.JIRA_EMAIL || 'your-email@company.com';
this.jiraToken = process.env.JIRA_API_TOKEN || 'your-jira-api-token';
this.githubToken = process.env.GITHUB_TOKEN || 'your-github-token'; // For real PRs
this.githubOwner = 'your-github-username';
this.githubRepo = 'your-repo-name';
```

### Environment Variables

Create a `.env` file or export variables:

```bash
export JIRA_EMAIL=your-email@company.com
export JIRA_API_TOKEN=your-jira-api-token
export GITHUB_TOKEN=your-github-personal-access-token  # Enables real PRs
```

#### Getting a GitHub Personal Access Token:

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "BMAD Workflow"
4. Select scopes: `repo` (full control of private repositories)
5. Copy the token and add to your `.env` file

## Human Review Process

The workflow creates PRs automatically, but **human review is required**:

### When PR is Created:
1. **You get notified** that a PR was created
2. **Review the code** changes made by BMAD agents
3. **Test the feature** if needed
4. **Approve and merge** the PR when ready

### After Merge:
- Workflow automatically detects the merge
- **Jira issue moves to "Done"**
- **Success comment added** to Jira
- **Workflow completes**

### Without GitHub Token:
- PR creation is **simulated** (no real PR)
- Merge detection uses **random simulation**
- Still updates Jira but no actual PR tracking

## Jira Integration

The workflow automatically:
- Updates issue status through transitions
- Adds detailed comments with links and status
- Handles transition validation

## GitHub Integration

Currently uses simulation for PR creation. For production:

1. Install GitHub CLI: `gh auth login`
2. Replace `createPullRequest` method with actual GitHub API calls
3. Set up webhooks for real-time merge detection

## Error Handling

- Validates Jira transitions before attempting
- Provides clear error messages
- Exits gracefully on failures

## Monitoring

The workflow runs continuously until PR merge, checking every 30 seconds. Use Ctrl+C to stop monitoring if needed.

## Next Steps

1. **Real GitHub API**: Replace simulation with actual GitHub API calls
2. **Webhooks**: Set up GitHub webhooks for instant merge notifications
3. **CI/CD Integration**: Add automated testing and deployment
4. **Slack/Teams Notifications**: Add team notifications on status changes

## Troubleshooting

- **Jira Transition Errors**: Check if the status transition is available for your workflow
- **Git Push Errors**: Ensure you have push permissions to the repository
- **Branch Conflicts**: Resolve merge conflicts before running workflow

## Related Files

- `mcp-config.json`: Jira MCP server configuration
- `test-mcp-client.js`: MCP connectivity testing
- `git-workflow.js`: Previous Git workflow implementation

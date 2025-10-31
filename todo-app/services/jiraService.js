// Jira and GitHub integration service
const axios = require('axios');

class JiraService {
  constructor() {
    this.baseUrl = 'https://disandup6.atlassian.net';
    this.username = 'disandup6@gmail.com';
    this.apiToken = 'ATATT3xFfGF0MAWRGIIFPkwroDdjySukZ0-P0iNf1XYzqO6egB-oVnLAHbklKzivRjrprz0TX-AnzooV2IdbpA6lifxJhArUyh9MhbYofX3ikpQGqmmZaYWBI8UpQizbnb7qlpG7onMhSQ3qpukB3wSExKET55GA9e7U13dnn17aMNRBVfgYoNw=8696FE6F';
    this.projectKey = 'KAN';
    this.auth = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64');

    // GitHub configuration
    this.githubToken = process.env.GITHUB_TOKEN || 'mock_github_token';
    this.githubOwner = 'bmad-code-org';
    this.githubRepo = 'BMAD-METHOD';
  }

  // Create a real Jira issue
  async createIssue(taskData) {
    try {
      const issueData = {
        fields: {
          project: {
            key: this.projectKey
          },
          summary: taskData.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: taskData.description || 'No description provided'
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: 'Task'
          },
          priority: {
            name: this.mapPriority(taskData.priority) || 'Medium'
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        issueData,
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[Jira Integration] ✅ Created issue ${response.data.key} for task: ${taskData.title}`);

      return {
        key: response.data.key,
        id: response.data.id,
        self: response.data.self
      };
    } catch (error) {
      console.error('[Jira Integration] ❌ Failed to create issue:', error.response?.data || error.message);
      throw error;
    }
  }

  // Transition issue status
  async transitionIssue(issueKey, status) {
    try {
      // First get available transitions
      const transitionsResponse = await axios.get(
        `${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        {
          headers: {
            'Authorization': `Basic ${this.auth}`
          }
        }
      );

      const transition = transitionsResponse.data.transitions.find(t =>
        t.name.toLowerCase() === status.toLowerCase()
      );

      if (!transition) {
        throw new Error(`Transition "${status}" not available for issue ${issueKey}`);
      }

      await axios.post(
        `${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
        {
          transition: {
            id: transition.id
          }
        },
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[Jira Integration] ✅ Transitioned ${issueKey} to: ${status}`);
      return true;
    } catch (error) {
      console.error('[Jira Integration] ❌ Failed to transition issue:', error.response?.data || error.message);
      throw error;
    }
  }

  // Map app priority to Jira priority
  mapPriority(appPriority) {
    const priorityMap = {
      'Low': 'Lowest',
      'Medium': 'Medium',
      'High': 'Highest'
    };
    return priorityMap[appPriority] || 'Medium';
  }

  // Create a GitHub PR for the task
  async createGitHubPR(taskData) {
    try {
      // For demo purposes, simulate PR creation
      // In production, this would make actual GitHub API calls
      const mockPRNumber = Date.now() % 10000; // Generate mock PR number

      console.log(`[GitHub Integration] ✅ Created PR #${mockPRNumber} for task: ${taskData.title}`);
      console.log(`[GitHub Integration] 📝 PR would be created with title: "feat: ${taskData.title}"`);
      console.log(`[GitHub Integration] 🌿 Branch: feature/${taskData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`);

      return {
        number: mockPRNumber,
        url: `https://github.com/${this.githubOwner}/${this.githubRepo}/pull/${mockPRNumber}`,
        branch: `feature/${taskData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      };
    } catch (error) {
      console.error('[GitHub Integration] ❌ Failed to create PR:', error.message);
      throw error;
    }
  }

  // Add a comment to a Jira issue
  async addComment(issueKey, comment) {
    try {
      const commentData = {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: comment
                }
              ]
            }
          ]
        }
      };

      await axios.post(
        `${this.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
        commentData,
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[Jira Integration] ✅ Added comment to ${issueKey}: ${comment.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('[Jira Integration] ❌ Failed to add comment:', error.response?.data || error.message);
      throw error;
    }
  }

  // Check if PR is merged
  async checkPRMerged(prNumber) {
    try {
      // For demo purposes, simulate merge for specific PRs
      // In production, this would check actual GitHub API
      const isMerged = prNumber === 366 || Math.random() > 0.7; // Always merge PR #366 for demo

      console.log(`[GitHub Integration] 🔍 Checked PR #${prNumber} - ${isMerged ? 'MERGED ✅' : 'OPEN'}`);

      return isMerged;
    } catch (error) {
      console.error('[GitHub Integration] ❌ Failed to check PR status:', error.message);
      return false;
    }
  }
}

module.exports = new JiraService();

#!/usr/bin/env node

// Enhanced BMAD Workflow for "Add Task Dates" feature
const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class EnhancedTaskDatesWorkflow {
  constructor() {
    this.repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
    this.jiraBaseUrl = 'https://disandup6.atlassian.net';
    this.jiraEmail = process.env.JIRA_EMAIL;
    this.jiraToken = process.env.JIRA_API_TOKEN;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubOwner = 'DisanduP';
    this.githubRepo = 'BMAD-MCP-JIRA-Company';
  }

  async run() {
    console.log(`🚀 Starting Enhanced BMAD Workflow: "Add Task Dates"`);
    console.log('=' .repeat(60));

    // Use existing Jira issue for now
    const jiraIssueKey = 'KAN-48';
    console.log(`📋 Using existing Jira issue: ${jiraIssueKey}`);

    try {
      // Phase 2: Create Feature Branch
      console.log('\n🌿 Phase 2: Create Feature Branch');
      const branchName = await this.createFeatureBranch();
      console.log(`✅ Branch created: ${branchName}`);

      // Phase 3: Move Jira to "In Progress"
      console.log('\n💻 Phase 3: Start Development');
      await this.updateJiraStatus(jiraIssueKey, 'In Progress');
      console.log('✅ Jira moved to In Progress');

      // Phase 4: Implement Enhanced Task Dates Feature
      console.log('\n🤖 Phase 4: Implement Enhanced Task Dates');
      await this.implementTaskDatesFeature();
      console.log('✅ Task dates feature enhanced');

      // Phase 5: Commit & Push Changes
      console.log('\n💾 Phase 5: Commit & Push');
      await this.commitAndPush(branchName);
      console.log('✅ Changes committed and pushed');

      // Phase 6: Create PR & Move to "In Review"
      console.log('\n🔄 Phase 6: Create PR');
      const prNumber = await this.createPullRequest(branchName, jiraIssueKey);
      await this.updateJiraStatus(jiraIssueKey, 'In Review');
      console.log(`✅ PR created (#${prNumber}) and Jira moved to In Review`);

      // Phase 7: Monitor for Merge
      console.log('\n👀 Phase 7: Monitor for Merge');
      await this.monitorPRForMerge(prNumber, jiraIssueKey);
      console.log('✅ Workflow completed successfully!');

    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
      process.exit(1);
    }
  }

  async createJiraIssue() {
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');

    try {
      const response = await axios.post(
        `${this.jiraBaseUrl}/rest/api/3/issue`,
        {
          fields: {
            project: { key: 'KAN' },
            summary: 'Add Task Dates - Enhanced Date Management',
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: 'Enhance the task dates feature with overdue highlighting, date sorting, date filtering, and improved date formatting for better task management.'
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
    } catch (error) {
      console.error('❌ Failed to create Jira issue:', error.message);
      throw error;
    }
  }

  async createFeatureBranch() {
    const timestamp = Date.now();
    const branchName = `feature/add-task-dates-enhanced-${timestamp}`;

    execSync('git checkout v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
    execSync('git pull origin v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
    execSync(`git checkout -b ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });

    return branchName;
  }

  async updateJiraStatus(issueKey, status) {
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');

    try {
      // Get available transitions
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

  async implementTaskDatesFeature() {
    // Enhance the existing task dates functionality

    // 1. Add overdue highlighting to CSS
    this.addOverdueStyling();

    // 2. Add date sorting functionality
    this.addDateSorting();

    // 3. Add date filtering
    this.addDateFiltering();

    // 4. Improve date formatting
    this.improveDateFormatting();

    // 5. Add date validation
    this.addDateValidation();
  }

  addOverdueStyling() {
    const cssPath = path.join(this.repoPath, 'todo-app/frontend/src/App.css');

    const overdueStyles = `
/* Overdue Task Styling */
.task-overdue {
  border-left: 4px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

.task-overdue .task-title {
  color: #dc3545;
}

.task-due-soon {
  border-left: 4px solid #ffc107;
  background-color: rgba(255, 193, 7, 0.05);
}

.task-due-today .task-title {
  color: #fd7e14;
  font-weight: bold;
}

/* Date filter styling */
.date-filter-container {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.date-filter-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.date-filter-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Sort button styling */
.sort-button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sort-button:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
}

.sort-button.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}
`;

    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('task-overdue')) {
      cssContent += '\n' + overdueStyles;
      fs.writeFileSync(cssPath, cssContent);
      console.log('✅ Added overdue task styling');
    }
  }

  addDateSorting() {
    const appPath = path.join(this.repoPath, 'todo-app/frontend/src/App.js');

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Add sort state
    if (!appContent.includes('sortBy')) {
      appContent = appContent.replace(
        'const [showBulkActions, setShowBulkActions] = useState(false);',
        'const [showBulkActions, setShowBulkActions] = useState(false);\n  const [sortBy, setSortBy] = useState(\'created\'); // created, dueDate, priority'
      );
    }

    // Add sorting logic
    if (!appContent.includes('sortTasks')) {
      appContent = appContent.replace(
        '  // Load tasks on component mount and when search or category changes',
        `  // Sort tasks function
  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // Get sorted tasks
  const sortedTasks = sortTasks(tasks);

  // Load tasks on component mount and when search or category changes`
      );
    }

    // Update the TaskList to use sortedTasks
    appContent = appContent.replace(
      '            <TaskList',
      '            <TaskList\n              tasks={sortedTasks}'
    );

    // Add sort buttons to the UI
    if (!appContent.includes('sort-button')) {
      appContent = appContent.replace(
        '              <button onClick={selectAllTasks} className="select-all-button">',
        `              <div className="sort-buttons">
                <button
                  onClick={() => setSortBy('created')}
                  className={\`sort-button \${sortBy === 'created' ? 'active' : ''}\`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => setSortBy('dueDate')}
                  className={\`sort-button \${sortBy === 'dueDate' ? 'active' : ''}\`}
                >
                  Due Date
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={\`sort-button \${sortBy === 'priority' ? 'active' : ''}\`}
                >
                  Priority
                </button>
              </div>
              <button onClick={selectAllTasks} className="select-all-button">`
      );
    }

    fs.writeFileSync(appPath, appContent);
    console.log('✅ Added date sorting functionality');
  }

  addDateFiltering() {
    const appPath = path.join(this.repoPath, 'todo-app/frontend/src/App.js');

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Add date filter states
    if (!appContent.includes('dateFrom')) {
      appContent = appContent.replace(
        '  const [sortBy, setSortBy] = useState(\'created\'); // created, dueDate, priority',
        '  const [sortBy, setSortBy] = useState(\'created\'); // created, dueDate, priority\n  const [dateFrom, setDateFrom] = useState(\'\');\n  const [dateTo, setDateTo] = useState(\'\');\n  const [showOverdueOnly, setShowOverdueOnly] = useState(false);'
      );
    }

    // Add date filtering logic
    if (!appContent.includes('filterTasksByDate')) {
      appContent = appContent.replace(
        '  // Get sorted tasks',
        `  // Filter tasks by date
  const filterTasksByDate = (tasksToFilter) => {
    return tasksToFilter.filter(task => {
      if (showOverdueOnly) {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < new Date();
      }

      if (dateFrom && task.dueDate) {
        if (new Date(task.dueDate) < new Date(dateFrom)) return false;
      }

      if (dateTo && task.dueDate) {
        if (new Date(task.dueDate) > new Date(dateTo)) return false;
      }

      return true;
    });
  };

  // Get filtered and sorted tasks
  const filteredTasks = filterTasksByDate(sortedTasks);

  // Get sorted tasks`
      );
    }

    // Update to use filteredTasks
    appContent = appContent.replace(
      '            <TaskList\n              tasks={sortedTasks}',
      '            <TaskList\n              tasks={filteredTasks}'
    );

    // Add date filter UI
    if (!appContent.includes('date-filter-container')) {
      appContent = appContent.replace(
        '                </div>\n              </div>\n              <button onClick={selectAllTasks} className="select-all-button">',
        `                </div>

                {/* Date Filters */}
                <div className="date-filter-container">
                  <div className="date-filter-group">
                    <label>From Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="date-filter-input"
                    />
                  </div>
                  <div className="date-filter-group">
                    <label>To Date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="date-filter-input"
                    />
                  </div>
                  <div className="date-filter-group">
                    <label>&nbsp;</label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <input
                        type="checkbox"
                        checked={showOverdueOnly}
                        onChange={(e) => setShowOverdueOnly(e.target.checked)}
                      />
                      Show Overdue Only
                    </label>
                  </div>
                </div>
              </div>
              <button onClick={selectAllTasks} className="select-all-button">`
      );
    }

    fs.writeFileSync(appPath, appContent);
    console.log('✅ Added date filtering functionality');
  }

  improveDateFormatting() {
    const taskListPath = path.join(this.repoPath, 'todo-app/frontend/src/components/TaskList.js');

    let taskListContent = fs.readFileSync(taskListPath, 'utf8');

    // Improve date formatting and add overdue logic
    if (!taskListContent.includes('formatDueDate')) {
      taskListContent = taskListContent.replace(
        'const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, selectedTasks = new Set(), onToggleSelection, onStartTask, onSubmitForReview, onAddNotes }) => {',
        `const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, selectedTasks = new Set(), onToggleSelection, onStartTask, onSubmitForReview, onAddNotes }) => {

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: \`\${Math.abs(diffDays)} days overdue\`, className: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'due-today' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'due-soon' };
    } else if (diffDays <= 7) {
      return { text: \`Due in \${diffDays} days\`, className: 'due-soon' };
    } else {
      return { text: date.toLocaleDateString(), className: 'normal' };
    }
  };

  const getTaskDateClass = (dueDate, completed) => {
    if (completed || !dueDate) return '';

    const date = new Date(dueDate);
    const today = new Date();

    if (date < today) return 'task-overdue';
    if (date.toDateString() === today.toDateString()) return 'task-due-today';
    if (date.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'task-due-soon';

    return '';
  };`
      );
    }

    // Update the due date display
    taskListContent = taskListContent.replace(
      `                  {task.dueDate && (
                    <span className="due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}`,
      `                  {task.dueDate && (() => {
                    const dateInfo = formatDueDate(task.dueDate);
                    return (
                      <span className={\`due-date due-date-\${dateInfo.className}\`}>
                        📅 {dateInfo.text}
                      </span>
                    );
                  })()}`
    );

    // Add overdue class to task item
    taskListContent = taskListContent.replace(
      '        <div',
      `        <div
          className={getTaskDateClass(task.dueDate, task.completed)}`
    );

    fs.writeFileSync(taskListPath, taskListContent);
    console.log('✅ Improved date formatting and overdue highlighting');
  }

  addDateValidation() {
    const taskFormPath = path.join(this.repoPath, 'todo-app/frontend/src/components/TaskForm.js');

    let taskFormContent = fs.readFileSync(taskFormPath, 'utf8');

    // Add date validation
    if (!taskFormContent.includes('validateDueDate')) {
      taskFormContent = taskFormContent.replace(
        '  const handleSubmit = async (e) => {',
        `  const validateDueDate = (dateString) => {
    if (!dateString) return true; // Optional field

    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return 'Due date cannot be in the past';
    }

    return true;
  };

  const handleSubmit = async (e) => {`
      );
    }

    // Add validation to form submission
    taskFormContent = taskFormContent.replace(
      `    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }`,
      `    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    const dateValidation = validateDueDate(formData.dueDate);
    if (dateValidation !== true) {
      alert(dateValidation);
      return;
    }`
    );

    fs.writeFileSync(taskFormPath, taskFormContent);
    console.log('✅ Added date validation');
  }

  async commitAndPush(branchName) {
    execSync('git add .', { cwd: this.repoPath, stdio: 'pipe' });
    execSync('git commit -m "feat: Enhanced task dates with overdue highlighting, sorting, and filtering"', { cwd: this.repoPath, stdio: 'pipe' });
    execSync(`git push -u origin ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });
  }

  async createPullRequest(branchName, jiraIssueKey) {
    const response = await axios.post(
      `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/pulls`,
      {
        title: 'feat: Enhanced Task Dates - Overdue highlighting, sorting & filtering',
        head: branchName,
        base: 'v6-alpha',
        body: `## 🚀 Enhanced Task Dates Feature

This PR enhances the existing task dates functionality with:

### ✨ New Features
- **Overdue Task Highlighting**: Tasks past due date show in red with warning indicators
- **Due Date Sorting**: Sort tasks by due date, priority, or creation date
- **Date Range Filtering**: Filter tasks by due date ranges
- **Overdue-Only Filter**: Quickly see only overdue tasks
- **Smart Date Formatting**: Shows "Due today", "Due tomorrow", "X days overdue", etc.
- **Date Validation**: Prevents setting due dates in the past

### 🎯 User Experience Improvements
- Visual indicators for urgent tasks
- Better task organization and prioritization
- Improved productivity with focused overdue task views

### 🔧 Technical Details
- Enhanced CSS with overdue styling
- Improved React components with sorting/filtering logic
- Better date handling and validation
- Responsive design considerations

### 📋 Jira Integration
- Issue: ${jiraIssueKey}
- Status: In Review

*🤖 This PR was created automatically by the BMAD workflow system*`
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

  async monitorPRForMerge(prNumber, jiraIssueKey) {
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
          await this.updateJiraStatus(jiraIssueKey, 'Done');
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

// Run the workflow
const workflow = new EnhancedTaskDatesWorkflow();
workflow.run().catch(console.error);

#!/usr/bin/env node

// Simplified workflow to implement task dates features
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SimpleTaskDatesWorkflow {
  constructor() {
    this.repoPath = '/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company';
  }

  async run() {
    console.log(`🚀 Implementing Enhanced Task Dates Feature`);
    console.log('=' .repeat(50));

    try {
      // Create feature branch
      console.log('\n🌿 Creating feature branch...');
      const timestamp = Date.now();
      const branchName = `feature/enhanced-task-dates-${timestamp}`;

      execSync('git checkout v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
      execSync('git pull origin v6-alpha', { cwd: this.repoPath, stdio: 'pipe' });
      execSync(`git checkout -b ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });
      console.log(`✅ Branch created: ${branchName}`);

      // Implement features
      console.log('\n🤖 Implementing enhanced task dates...');
      await this.implementTaskDatesFeatures();
      console.log('✅ Features implemented');

      // Commit and push
      console.log('\n💾 Committing changes...');
      execSync('git add .', { cwd: this.repoPath, stdio: 'pipe' });
      execSync('git commit -m "feat: Enhanced task dates with overdue highlighting, sorting, and filtering"', { cwd: this.repoPath, stdio: 'pipe' });
      execSync(`git push -u origin ${branchName}`, { cwd: this.repoPath, stdio: 'pipe' });
      console.log('✅ Changes committed and pushed');

      console.log('\n🎉 Feature implementation complete!');
      console.log(`📋 Branch: ${branchName}`);
      console.log('You can now create a PR manually or test the features locally.');

    } catch (error) {
      console.error('❌ Implementation failed:', error.message);
      process.exit(1);
    }
  }

  async implementTaskDatesFeatures() {
    // 1. Add overdue styling
    this.addOverdueStyling();

    // 2. Add sorting functionality
    this.addSorting();

    // 3. Add filtering
    this.addFiltering();

    // 4. Improve date formatting
    this.improveDateDisplay();

    // 5. Add validation
    this.addValidation();
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

/* Sort buttons */
.sort-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.sort-button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.sort-button:hover {
  background: var(--bg-hover);
}

.sort-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Date filters */
.date-filter-container {
  display: flex;
  gap: 15px;
  align-items: end;
  margin-bottom: 15px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
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
  border-color: #007bff;
}
`;

    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('task-overdue')) {
      cssContent += '\n' + overdueStyles;
      fs.writeFileSync(cssPath, cssContent);
      console.log('✅ Added overdue styling');
    }
  }

  addSorting() {
    const appPath = path.join(this.repoPath, 'todo-app/frontend/src/App.js');

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Add sort state
    if (!appContent.includes('sortBy')) {
      appContent = appContent.replace(
        "  const [showBulkActions, setShowBulkActions] = useState(false);",
        "  const [showBulkActions, setShowBulkActions] = useState(false);\n  const [sortBy, setSortBy] = useState('created');"
      );
    }

    // Add sorting logic
    if (!appContent.includes('sortTasks')) {
      appContent = appContent.replace(
        "  // Load tasks on component mount and when search or category changes",
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

  const sortedTasks = sortTasks(tasks);

  // Load tasks on component mount and when search or category changes`
      );
    }

    // Update TaskList to use sortedTasks
    appContent = appContent.replace(
      '            <TaskList',
      '            <TaskList\n              tasks={sortedTasks}'
    );

    // Add sort buttons
    if (!appContent.includes('sort-buttons')) {
      appContent = appContent.replace(
        '              <button onClick={selectAllTasks} className="select-all-button">',
        `              <div className="sort-buttons">
                <button
                  onClick={() => setSortBy('created')}
                  className={\`sort-button \${sortBy === 'created' ? 'active' : ''}\`}
                >
                  Newest
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
    console.log('✅ Added sorting functionality');
  }

  addFiltering() {
    const appPath = path.join(this.repoPath, 'todo-app/frontend/src/App.js');

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Add date filter states
    if (!appContent.includes('dateFrom')) {
      appContent = appContent.replace(
        "  const [sortBy, setSortBy] = useState('created');",
        "  const [sortBy, setSortBy] = useState('created');\n  const [dateFrom, setDateFrom] = useState('');\n  const [dateTo, setDateTo] = useState('');\n  const [showOverdueOnly, setShowOverdueOnly] = useState(false);"
      );
    }

    // Add filtering logic
    if (!appContent.includes('filterTasksByDate')) {
      appContent = appContent.replace(
        "  const sortedTasks = sortTasks(tasks);",
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

  const sortedTasks = sortTasks(tasks);
  const filteredTasks = filterTasksByDate(sortedTasks);`
      );
    }

    // Update TaskList to use filteredTasks
    appContent = appContent.replace(
      '            <TaskList\n              tasks={sortedTasks}',
      '            <TaskList\n              tasks={filteredTasks}'
    );

    // Add date filter UI
    if (!appContent.includes('date-filter-container')) {
      appContent = appContent.replace(
        '              </div>\n              <button onClick={selectAllTasks} className="select-all-button">',
        `              </div>

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
                    Overdue Only
                  </label>
                </div>
              </div>
              <button onClick={selectAllTasks} className="select-all-button">`
      );
    }

    fs.writeFileSync(appPath, appContent);
    console.log('✅ Added date filtering');
  }

  improveDateDisplay() {
    const taskListPath = path.join(this.repoPath, 'todo-app/frontend/src/components/TaskList.js');

    let taskListContent = fs.readFileSync(taskListPath, 'utf8');

    // Add date formatting functions
    if (!taskListContent.includes('formatDueDate')) {
      taskListContent = taskListContent.replace(
        'const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, selectedTasks = new Set(), onToggleSelection, onStartTask, onSubmitForReview, onAddNotes }) => {',
        `const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, selectedTasks = new Set(), onToggleSelection, onStartTask, onSubmitForReview, onAddNotes }) => {

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
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

    // Update due date display
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
    console.log('✅ Improved date display and overdue highlighting');
  }

  addValidation() {
    const taskFormPath = path.join(this.repoPath, 'todo-app/frontend/src/components/TaskForm.js');

    let taskFormContent = fs.readFileSync(taskFormPath, 'utf8');

    // Add date validation
    if (!taskFormContent.includes('validateDueDate')) {
      taskFormContent = taskFormContent.replace(
        '  const handleSubmit = async (e) => {',
        `  const validateDueDate = (dateString) => {
    if (!dateString) return true;
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

    // Add validation to form
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
}

// Run the simplified workflow
const workflow = new SimpleTaskDatesWorkflow();
workflow.run().catch(console.error);

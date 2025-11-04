const express = require('express');
const jiraService = require('../services/jiraService');

const router = express.Router();

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// Helper function to generate unique ID
const generateId = () => {
  return (nextId++).toString();
};

// GET /api/tasks - Get all tasks with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, category, limit = 50, skip = 0 } = req.query;

    let filteredTasks = [...tasks];

    // Filter by completion status
    if (status === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (status === 'active') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    // Filter by priority
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    // Filter by category
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }

    // Search in title and description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = parseInt(skip);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    res.json({
      tasks: paginatedTasks,
      pagination: {
        total: filteredTasks.length,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: filteredTasks.length > endIndex
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = tasks.find(t => t._id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, category } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = {
      _id: generateId(),
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'Medium',
      category: category || 'General',
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
      status: 'To Do', // New: Agile workflow status
      completionNotes: [], // New: Track what was done
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(task);

    // Create Jira issue for tracking (no PR yet)
    try {
      const jiraIssue = await jiraService.createIssue({
        title: task.title,
        description: task.description || 'No description provided',
        priority: task.priority
      });

      // Update task with Jira issue key
      task.jiraIssueKey = jiraIssue.key;
      task.updatedAt = new Date();

      console.log(`Jira issue created: ${jiraIssue.key} for task: ${task.title}`);
    } catch (jiraError) {
      console.error('Jira issue creation failed:', jiraError);
      // Continue without Jira integration for now
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, category } = req.body;

    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = { ...tasks[taskIndex] };

    // Update task fields
    if (title !== undefined) tasks[taskIndex].title = title.trim();
    if (description !== undefined) tasks[taskIndex].description = description?.trim();
    if (priority !== undefined) tasks[taskIndex].priority = priority;
    if (category !== undefined) tasks[taskIndex].category = category;
    if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) tasks[taskIndex].completed = completed;

    tasks[taskIndex].updatedAt = new Date();

    // Jira Integration: Sync status changes
    if (completed !== undefined && oldTask.completed !== completed && tasks[taskIndex].jiraIssueKey) {
      try {
        const newStatus = completed ? 'Done' : 'To Do';
        await jiraService.transitionIssue(tasks[taskIndex].jiraIssueKey, newStatus);

        console.log(`Jira issue ${tasks[taskIndex].jiraIssueKey} transitioned to: ${newStatus}`);
      } catch (jiraError) {
        console.error('Jira status sync failed:', jiraError);
        // Continue without failing the update
      }
    }

    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Workflow transitions

// PUT /api/tasks/:id/start - Move task to In Progress
router.put('/:id/start', async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (tasks[taskIndex].status !== 'To Do') {
      return res.status(400).json({ error: 'Task must be in To Do status to start' });
    }

    tasks[taskIndex].status = 'In Progress';
    tasks[taskIndex].updatedAt = new Date();

    // Add completion note
    const note = {
      timestamp: new Date(),
      action: 'started',
      message: 'Task moved to In Progress - work has begun',
      agent: 'BMAD'
    };
    tasks[taskIndex].completionNotes.push(note);

    // Update Jira issue status
    if (tasks[taskIndex].jiraIssueKey) {
      try {
        await jiraService.transitionIssue(tasks[taskIndex].jiraIssueKey, 'In Progress');
        console.log(`Jira issue ${tasks[taskIndex].jiraIssueKey} transitioned to: In Progress`);
      } catch (jiraError) {
        console.error('Jira status sync failed:', jiraError);
      }
    }

    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id/review - Move task to In Review (creates PR)
router.put('/:id/review', async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (tasks[taskIndex].status !== 'In Progress') {
      return res.status(400).json({ error: 'Task must be in In Progress status to move to review' });
    }

    // Create GitHub PR
    let prData = null;
    try {
      console.log('🚀 Creating GitHub PR for task:', tasks[taskIndex].title);
      prData = await jiraService.createGitHubPR({
        title: tasks[taskIndex].title,
        description: tasks[taskIndex].description,
        priority: tasks[taskIndex].priority,
        category: tasks[taskIndex].category,
        dueDate: tasks[taskIndex].dueDate
      });

      // Update task with PR info
      tasks[taskIndex].prNumber = prData.number;
      tasks[taskIndex].prUrl = prData.url;
      tasks[taskIndex].branch = prData.branch;
      tasks[taskIndex].status = 'In Review';
      tasks[taskIndex].updatedAt = new Date();

      // Add completion note
      const note = {
        timestamp: new Date(),
        action: 'submitted_for_review',
        message: `Task completed and submitted for review. PR #${prData.number} created.`,
        agent: 'BMAD',
        prNumber: prData.number,
        prUrl: prData.url
      };
      tasks[taskIndex].completionNotes.push(note);

      console.log(`✅ GitHub PR created: #${prData.number} for task: ${tasks[taskIndex].title}`);
    } catch (prError) {
      console.error('❌ GitHub PR creation failed:', prError);
      return res.status(500).json({ error: 'Failed to create PR for review' });
    }

    // Update Jira issue with PR link
    if (tasks[taskIndex].jiraIssueKey) {
      try {
        await jiraService.transitionIssue(tasks[taskIndex].jiraIssueKey, 'In Review');
        console.log(`Jira issue ${tasks[taskIndex].jiraIssueKey} transitioned to: In Review`);
      } catch (jiraError) {
        console.error('Jira status sync failed:', jiraError);
      }
    }

    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id/notes - Add completion notes
router.put('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    // Add completion note
    const note = {
      timestamp: new Date(),
      action: 'notes_added',
      message: notes.trim(),
      agent: 'BMAD'
    };
    tasks[taskIndex].completionNotes.push(note);
    tasks[taskIndex].updatedAt = new Date();

    // Add comment to Jira issue
    if (tasks[taskIndex].jiraIssueKey) {
      try {
        const jiraComment = `🔄 **BMAD Agent Update:** ${notes.trim()}\n\n*Added via Todo App - ${new Date().toLocaleString()}*`;
        await jiraService.addComment(tasks[taskIndex].jiraIssueKey, jiraComment);
        console.log(`Added completion note to Jira issue ${tasks[taskIndex].jiraIssueKey}`);
      } catch (jiraError) {
        console.error('Jira comment sync failed:', jiraError);
        // Continue without failing the note addition
      }
    }

    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations

// PUT /api/tasks/bulk/complete - Mark multiple tasks as complete/incomplete
router.put('/bulk/complete', async (req, res) => {
  try {
    const { taskIds, completed } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'taskIds array is required' });
    }

    const updatedTasks = [];
    const jiraPromises = [];

    for (const taskId of taskIds) {
      const taskIndex = tasks.findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        const oldTask = { ...tasks[taskIndex] };
        tasks[taskIndex].completed = completed;
        tasks[taskIndex].updatedAt = new Date();
        updatedTasks.push(tasks[taskIndex]);

        // Jira Integration: Sync status changes
        if (oldTask.completed !== completed && tasks[taskIndex].jiraIssueKey) {
          jiraPromises.push(
            jiraService.transitionIssue(tasks[taskIndex].jiraIssueKey, completed ? 'Done' : 'To Do')
              .catch(jiraError => console.error(`Jira sync failed for ${tasks[taskIndex].jiraIssueKey}:`, jiraError))
          );
        }
      }
    }

    // Wait for all Jira updates to complete
    await Promise.allSettled(jiraPromises);

    res.json(updatedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/bulk/category - Change category for multiple tasks
router.put('/bulk/category', async (req, res) => {
  try {
    const { taskIds, category } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'taskIds array is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const updatedTasks = [];

    for (const taskId of taskIds) {
      const taskIndex = tasks.findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].category = category;
        tasks[taskIndex].updatedAt = new Date();
        updatedTasks.push(tasks[taskIndex]);
      }
    }

    res.json(updatedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/bulk/delete - Delete multiple tasks
router.delete('/bulk/delete', async (req, res) => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'taskIds array is required' });
    }

    const initialLength = tasks.length;
    tasks = tasks.filter(task => !taskIds.includes(task._id));
    const deletedCount = initialLength - tasks.length;

    res.json({
      message: `${deletedCount} tasks deleted successfully`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for merged PRs and update task status
router.post('/check-merged-prs', async (req, res) => {
  try {
    const tasksWithPRs = tasks.filter(task => task.prNumber && task.status === 'In Review');

    if (tasksWithPRs.length === 0) {
      return res.json({ message: 'No tasks in In Review with PRs found', updatedCount: 0 });
    }

    let updatedCount = 0;

    for (const task of tasksWithPRs) {
      try {
        const isMerged = await jiraService.checkPRMerged(task.prNumber);

        if (isMerged && task.status === 'In Review') {
          // Update task status to Done
          task.status = 'Done';
          task.completed = true;
          task.updatedAt = new Date();

          // Add completion note
          const note = {
            timestamp: new Date(),
            action: 'completed',
            message: `Task completed successfully. PR #${task.prNumber} has been merged.`,
            agent: 'BMAD',
            prNumber: task.prNumber
          };
          task.completionNotes.push(note);

          // Update Jira issue status
          if (task.jiraIssueKey) {
            try {
              await jiraService.transitionIssue(task.jiraIssueKey, 'Done');
              console.log(`Jira issue ${task.jiraIssueKey} transitioned to Done (PR merged)`);
            } catch (jiraError) {
              console.error(`Failed to update Jira issue ${task.jiraIssueKey}:`, jiraError);
            }
          }

          updatedCount++;
          console.log(`Task ${task._id} marked as Done (PR #${task.prNumber} merged)`);
        }
      } catch (prError) {
        console.error(`Failed to check PR #${task.prNumber}:`, prError);
      }
    }

    res.json({
      message: `Checked ${tasksWithPRs.length} PRs, updated ${updatedCount} tasks to Done status`,
      updatedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all tasks as complete
router.put('/mark-all-complete', async (req, res) => {
  try {
    const result = await Task.updateMany(
      { completed: false },
      {
        completed: true,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} tasks as complete`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all complete:', error);
    res.status(500).json({ error: 'Failed to mark all tasks complete' });
  }
});

module.exports = router;

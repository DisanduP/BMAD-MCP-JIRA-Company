const express = require('express');
const jiraService = require('../services/jiraService');

const router = express.Router();

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// In-memory storage for categories
let categories = [
  { id: '1', name: 'General', color: '#6b7280', createdAt: new Date() },
  { id: '2', name: 'Work', color: '#3b82f6', createdAt: new Date() },
  { id: '3', name: 'Personal', color: '#10b981', createdAt: new Date() },
  { id: '4', name: 'Shopping', color: '#f59e0b', createdAt: new Date() },
  { id: '5', name: 'Health', color: '#ef4444', createdAt: new Date() },
  { id: '6', name: 'Learning', color: '#8b5cf6', createdAt: new Date() }
];
let nextCategoryId = 7;

// Helper function to generate unique ID
const generateId = () => {
  return (nextId++).toString();
};

// Helper function to generate unique category ID
const generateCategoryId = () => {
  return (nextCategoryId++).toString();
};

// ==================== CATEGORY MANAGEMENT ENDPOINTS ====================

// GET /api/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    res.json({
      categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
      total: categories.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id - Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = categories.find(c => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Valid hex color is required (e.g., #ff0000)' });
    }

    // Check if category name already exists
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    const category = {
      id: generateCategoryId(),
      name: name.trim(),
      color: color.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    categories.push(category);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    const categoryIndex = categories.findIndex(c => c.id === req.params.id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      // Check if another category with this name exists
      const existingCategory = categories.find(c =>
        c.id !== req.params.id && c.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (existingCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      categories[categoryIndex].name = name.trim();
    }

    if (color !== undefined) {
      if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).json({ error: 'Valid hex color is required (e.g., #ff0000)' });
      }
      categories[categoryIndex].color = color.toLowerCase();
    }

    categories[categoryIndex].updatedAt = new Date();
    res.json(categories[categoryIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const categoryIndex = categories.findIndex(c => c.id === req.params.id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[categoryIndex];

    // Check if category is being used by any tasks
    const tasksUsingCategory = tasks.filter(task => task.category === category.name);
    if (tasksUsingCategory.length > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${category.name}" because it is used by ${tasksUsingCategory.length} task(s). Please reassign or delete these tasks first.`
      });
    }

    categories.splice(categoryIndex, 1);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ENDPOINTS ====================
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

    // Validate category exists
    let taskCategory = 'General'; // default
    if (category) {
      const categoryExists = categories.find(c => c.name === category);
      if (!categoryExists) {
        return res.status(400).json({ error: `Category "${category}" does not exist. Please create the category first or use an existing one.` });
      }
      taskCategory = category;
    }

    const task = {
      _id: generateId(),
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'Medium',
      category: taskCategory,
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
    
    // Validate and update category
    if (category !== undefined) {
      if (category) {
        const categoryExists = categories.find(c => c.name === category);
        if (!categoryExists) {
          return res.status(400).json({ error: `Category "${category}" does not exist. Please create the category first or use an existing one.` });
        }
      }
      tasks[taskIndex].category = category || 'General';
    }
    
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

// GET /api/tasks/export - Export all tasks as JSON
router.get('/export', async (req, res) => {
  try {
    // Create export data with metadata
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalTasks: tasks.length,
        appVersion: 'v6-alpha'
      },
      tasks: tasks.map(task => ({
        // Exclude internal fields like _id, jiraIssueKey, prNumber, etc.
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate,
        completed: task.completed,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completionNotes: task.completionNotes || []
      }))
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.json"`);

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/import - Import tasks from JSON
router.post('/import', async (req, res) => {
  try {
    const { importData, options = {} } = req.body;

    if (!importData || !importData.tasks || !Array.isArray(importData.tasks)) {
      return res.status(400).json({ error: 'Invalid import data format. Expected { tasks: [...] }' });
    }

    const { skipDuplicates = false, updateExisting = false } = options;
    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const importedTask of importData.tasks) {
      try {
        // Validate required fields
        if (!importedTask.title || typeof importedTask.title !== 'string') {
          errors.push(`Task missing valid title: ${JSON.stringify(importedTask)}`);
          continue;
        }

        // Check for duplicates by title and creation date
        const existingTask = tasks.find(task =>
          task.title.trim().toLowerCase() === importedTask.title.trim().toLowerCase() &&
          task.createdAt &&
          importedTask.createdAt &&
          new Date(task.createdAt).getTime() === new Date(importedTask.createdAt).getTime()
        );

        if (existingTask) {
          if (skipDuplicates) {
            skippedCount++;
            continue;
          } else if (updateExisting) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t._id === existingTask._id);
            tasks[taskIndex] = {
              ...existingTask,
              title: importedTask.title.trim(),
              description: importedTask.description?.trim(),
              priority: importedTask.priority || 'Medium',
              category: importedTask.category || 'General',
              dueDate: importedTask.dueDate ? new Date(importedTask.dueDate) : null,
              completed: importedTask.completed || false,
              status: importedTask.status || 'To Do',
              completionNotes: importedTask.completionNotes || [],
              updatedAt: new Date()
            };
            updatedCount++;
            continue;
          } else {
            errors.push(`Duplicate task found: "${importedTask.title}"`);
            continue;
          }
        }

        // Create new task
        const newTask = {
          _id: generateId(),
          title: importedTask.title.trim(),
          description: importedTask.description?.trim(),
          priority: importedTask.priority || 'Medium',
          category: importedTask.category || 'General',
          dueDate: importedTask.dueDate ? new Date(importedTask.dueDate) : null,
          completed: importedTask.completed || false,
          status: importedTask.status || 'To Do',
          completionNotes: importedTask.completionNotes || [],
          createdAt: importedTask.createdAt ? new Date(importedTask.createdAt) : new Date(),
          updatedAt: new Date()
        };

        tasks.push(newTask);
        importedCount++;

      } catch (taskError) {
        errors.push(`Error importing task "${importedTask.title}": ${taskError.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${importedCount} tasks imported, ${updatedCount} updated, ${skippedCount} skipped.`,
      stats: {
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length,
        totalProcessed: importData.tasks.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

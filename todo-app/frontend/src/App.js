import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

const API_BASE_URL = 'http://localhost:3002/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState('created'); // created, dueDate, priority
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch tasks from API with search and category filter
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task =>
        task._id === id ? updatedTask : task
      ));
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle task completion
  const toggleComplete = async (id, currentCompleted) => {
    await updateTask(id, { completed: !currentCompleted });
  };

  // Bulk actions
  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllTasks = () => {
    const allTaskIds = new Set(tasks.map(task => task._id));
    setSelectedTasks(allTaskIds);
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.size} selected tasks?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bulk/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: Array.from(selectedTasks) }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete selected tasks');
      }

      setTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
      clearSelection();
    } catch (err) {
      setError(err.message);
    }
  };

  const bulkMarkComplete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: Array.from(selectedTasks), completed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark tasks as complete');
      }

      const updatedTasks = await response.json();
      setTasks(prev => prev.map(task =>
        selectedTasks.has(task._id)
          ? updatedTasks.find(updated => updated._id === task._id) || task
          : task
      ));
      clearSelection();
    } catch (err) {
      setError(err.message);
    }
  };

  const bulkChangeCategory = async (newCategory) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bulk/category`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: Array.from(selectedTasks), category: newCategory }),
      });

      if (!response.ok) {
        throw new Error('Failed to change category for selected tasks');
      }

      const updatedTasks = await response.json();
      setTasks(prev => prev.map(task =>
        selectedTasks.has(task._id)
          ? updatedTasks.find(updated => updated._id === task._id) || task
          : task
      ));
      clearSelection();
    } catch (err) {
      setError(err.message);
    }
  };

  const checkMergedPRs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-merged-prs`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to check merged PRs');
      }

      const result = await response.json();
      console.log(result.message);

      // Refresh tasks to get updated status
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Workflow actions
  const startTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}/start`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const submitForReview = async (taskId) => {
    if (!window.confirm('Are you sure you want to submit this task for review? This will create a PR.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}/review`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to submit for review');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const addCompletionNotes = async (taskId, notes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to add notes');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Sort tasks function
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

  // Filter tasks by date
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

  // Filter tasks based on selected category
  const categoryFilteredTasks = tasks.filter(task => {
    if (filterCategory === "All") return true;
    return task.category === filterCategory;
  });

  // Get filtered and sorted tasks
  const filteredTasks = filterTasksByDate(sortTasks(categoryFilteredTasks));

  // Get sorted tasks
  const sortedTasks = sortTasks(tasks);

  // Mark all tasks as complete
  const markAllComplete = async () => {
    if (window.confirm('Are you sure you want to mark all tasks as complete?')) {
      try {
        const response = await fetch('http://localhost:3001/api/tasks/mark-all-complete', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Refresh tasks
          fetchTasks();
          alert('All tasks marked as complete!');
        } else {
          alert('Failed to mark all tasks complete');
        }
      } catch (error) {
        console.error('Error marking all complete:', error);
        alert('Error marking all tasks complete');
      }
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.className = darkMode ? '' : 'dark-mode';
  };

  // Load tasks on component mount and when search or category changes
  useEffect(() => {
    fetchTasks();
  }, [debouncedSearchTerm, selectedCategory, fetchTasks]);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">TODO App with Jira Integration</h1>
            <p className="app-subtitle">Manage your tasks and sync with Jira automatically</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={fetchTasks} className="retry-button">Retry</button>
        </div>
      )}

      <main className="app-main">
        {/* Statistics Dashboard */}
        <div className="stats-container">
          <h2 className="stats-title">Task Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{tasks.filter(t => !t.completed).length}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="category-stats">
            <h3 className="category-stats-title">Tasks by Category</h3>
            <div className="category-breakdown">
              {['General', 'Work', 'Personal', 'Shopping', 'Health', 'Learning'].map(category => {
                const categoryTasks = tasks.filter(t => t.category === category);
                const completedInCategory = categoryTasks.filter(t => t.completed).length;
                const percentage = categoryTasks.length > 0 ? Math.round((completedInCategory / categoryTasks.length) * 100) : 0;

                return (
                  <div key={category} className="category-stat">
                    <div className="category-info">
                      <span className={`category-badge category-${category.toLowerCase()}`}>
                        {category}
                      </span>
                      <span className="category-count">
                        {categoryTasks.length} tasks
                      </span>
                    </div>
                    <div className="category-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{percentage}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <h2 className="tasks-title">Tasks</h2>
            <div className="header-actions">
              <div className="filters-container">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-container">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                  >
                    <option value="">All Categories</option>
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>
              </div>
              <div className="sort-buttons">
                <button
                  onClick={() => setSortBy('created')}
                  className={`sort-button ${sortBy === 'created' ? 'active' : ''}`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => setSortBy('dueDate')}
                  className={`sort-button ${sortBy === 'dueDate' ? 'active' : ''}`}
                >
                  Due Date
                </button>
                <button
                  onClick={() => setSortBy('priority')}
                  className={`sort-button ${sortBy === 'priority' ? 'active' : ''}`}
                >
                  Priority
                </button>
              </div>
              <button onClick={toggleDarkMode} className="dark-mode-toggle">
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="task-filter"
              >
                <option value="All">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="UI Enhancement">UI Enhancement</option>
                <option value="Bug Fix">Bug Fix</option>
              </select>
              <button onClick={selectAllTasks} className="select-all-button">
                Select All
              </button>
              <button onClick={checkMergedPRs} className="check-prs-button">
                🔄 Check Merged PRs
              </button>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="add-task-button"
              >
                Add Task
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="bulk-actions">
              <div className="bulk-actions-header">
                <span className="bulk-selection-count">
                  {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                </span>
                <button onClick={clearSelection} className="bulk-clear-button">
                  Clear Selection
                </button>
              </div>
              <div className="bulk-actions-buttons">
                <button onClick={bulkMarkComplete} className="bulk-action-button bulk-complete">
                  ✅ Mark Complete
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkChangeCategory(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bulk-category-select"
                  defaultValue=""
                >
                  <option value="" disabled>Change Category</option>
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                </select>
                <button onClick={bulkDelete} className="bulk-action-button bulk-delete">
                  🗑️ Delete Selected
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <div className="task-form-container">
              <TaskForm
                task={editingTask}
                onSubmit={editingTask ? (data) => updateTask(editingTask._id, data) : createTask}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              />
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={deleteTask}
              onToggleComplete={toggleComplete}
              selectedTasks={selectedTasks}
              onToggleSelection={toggleTaskSelection}
              onStartTask={startTask}
              onSubmitForReview={submitForReview}
              onAddNotes={addCompletionNotes}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Backend API: <code>http://localhost:3002/api/tasks</code></p>
        <p>Jira Integration: Automatic issue creation and status sync</p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, selectedTasks = new Set(), onToggleSelection, onStartTask, onSubmitForReview, onAddNotes }) => {
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  const toggleNotes = (taskId) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedNotes(newExpanded);
  };
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3 className="empty-title">No tasks yet</h3>
        <p className="empty-text">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`task-item ${task.completed ? 'task-completed' : 'task-active'} ${selectedTasks.has(task._id) ? 'task-selected' : ''}`}
        >
          <div className="task-content">
            <div className="task-main">
              {/* Selection checkbox */}
              <input
                type="checkbox"
                checked={selectedTasks.has(task._id)}
                onChange={() => onToggleSelection(task._id)}
                className="selection-checkbox"
                title="Select task for bulk actions"
              />

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task._id, task.completed)}
                className="task-checkbox"
              />

              <div className="task-details">
                <h3 className={`task-title ${task.completed ? 'task-title-completed' : ''}`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className={`task-description ${task.completed ? 'task-description-completed' : ''}`}>
                    {task.description}
                  </p>
                )}

                <div className="task-meta">
                  <span className={`category-badge category-${task.category.toLowerCase()}`}>
                    {task.category}
                  </span>
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>

                  {task.dueDate && (
                    <span className="due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}

                  {task.jiraIssueKey && (
                    <span className="jira-link">
                      Jira: {task.jiraIssueKey}
                    </span>
                  )}

                  {task.prNumber && (
                    <span className="pr-link">
                      PR: #{task.prNumber}
                    </span>
                  )}

                  {task.status && (
                    <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  )}

                  {task.completionNotes && task.completionNotes.length > 0 && (
                    <span className="notes-indicator" title={`${task.completionNotes.length} completion notes`}>
                      📝 {task.completionNotes.length}
                    </span>
                  )}
                </div>

                {/* Completion Notes */}
                {task.completionNotes && task.completionNotes.length > 0 && (
                  <div className="completion-notes-section">
                    <button
                      onClick={() => toggleNotes(task._id)}
                      className="notes-toggle-button"
                    >
                      {expandedNotes.has(task._id) ? '🔽 Hide Notes' : '🔼 Show Notes'} ({task.completionNotes.length})
                    </button>

                    {expandedNotes.has(task._id) && (
                      <div className="completion-notes">
                        {task.completionNotes.map((note, index) => (
                          <div key={index} className="completion-note">
                            <div className="note-header">
                              <span className="note-agent">{note.agent}</span>
                              <span className="note-timestamp">
                                {new Date(note.timestamp).toLocaleString()}
                              </span>
                              <span className="note-action">{note.action.replace('_', ' ')}</span>
                            </div>
                            <div className="note-message">{note.message}</div>
                            {note.prNumber && (
                              <div className="note-pr-link">
                                <a href={note.prUrl} target="_blank" rel="noopener noreferrer">
                                  View PR #{note.prNumber}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="task-actions">
              <button
                onClick={() => onEdit(task)}
                className="action-button edit-button"
                title="Edit task"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="action-button delete-button"
                title="Delete task"
              >
                🗑️
              </button>

              {/* Workflow Actions */}
              {task.status === 'To Do' && (
                <button
                  onClick={() => onStartTask(task._id)}
                  className="action-button start-button"
                  title="Start working on this task"
                >
                  ▶️
                </button>
              )}

              {task.status === 'In Progress' && (
                <>
                  <button
                    onClick={() => onSubmitForReview(task._id)}
                    className="action-button review-button"
                    title="Submit for review (creates PR)"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Add completion notes:');
                      if (notes && notes.trim()) {
                        onAddNotes(task._id, notes);
                      }
                    }}
                    className="action-button notes-button"
                    title="Add completion notes"
                  >
                    📝
                  </button>
                </>
              )}

              {task.status === 'In Review' && (
                <span className="pr-status" title={`PR #${task.prNumber} is under review`}>
                  🔄
                </span>
              )}

              {task.status === 'Done' && (
                <span className="completed-status" title="Task completed">
                  ✅
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;

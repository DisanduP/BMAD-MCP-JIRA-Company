const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  jiraIssueKey: {
    type: String
  }
}, {
  timestamps: true
});

// Index for performance
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ completed: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);

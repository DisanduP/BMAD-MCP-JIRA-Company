const mongoose = require('mongoose');
const Task = require('./models/Task');

// Test database connection
const testDBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app-test');
    console.log('✅ Test DB connected');
    return true;
  } catch (error) {
    console.log('❌ Test DB connection failed:', error.message);
    return false;
  }
};

// Test task creation
const testTaskCreation = async () => {
  try {
    const task = new Task({
      title: 'Test Task',
      description: 'Test description',
      priority: 'High',
      dueDate: new Date('2025-11-01')
    });

    const saved = await task.save();
    console.log('✅ Task creation successful:', saved._id);

    // Test validation - empty title
    try {
      const invalidTask = new Task({ title: '' });
      await invalidTask.save();
      console.log('❌ Validation failed: empty title accepted');
    } catch (error) {
      console.log('✅ Validation working: empty title rejected');
    }

    return saved._id;
  } catch (error) {
    console.log('❌ Task creation failed:', error.message);
    return null;
  }
};

// Test task queries
const testTaskQueries = async (taskId) => {
  try {
    // Find by ID
    const task = await Task.findById(taskId);
    console.log('✅ Find by ID successful');

    // Find all
    const allTasks = await Task.find();
    console.log(`✅ Find all successful: ${allTasks.length} tasks`);

    // Test search
    const searchResults = await Task.find({ $text: { $search: 'Test' } });
    console.log(`✅ Text search successful: ${searchResults.length} results`);

    return true;
  } catch (error) {
    console.log('❌ Query tests failed:', error.message);
    return false;
  }
};

// Test task updates
const testTaskUpdates = async (taskId) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      taskId,
      {
        completed: true,
        description: 'Updated description'
      },
      { new: true }
    );
    console.log('✅ Task update successful:', updated.completed);

    return true;
  } catch (error) {
    console.log('❌ Task update failed:', error.message);
    return false;
  }
};

// Test task deletion
const testTaskDeletion = async (taskId) => {
  try {
    await Task.findByIdAndDelete(taskId);
    console.log('✅ Task deletion successful');

    // Verify deletion
    const deleted = await Task.findById(taskId);
    if (!deleted) {
      console.log('✅ Deletion verified: task not found');
    } else {
      console.log('❌ Deletion failed: task still exists');
    }

    return true;
  } catch (error) {
    console.log('❌ Task deletion failed:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting QA Tests for TODO App Backend\n');

  const dbConnected = await testDBConnection();
  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connection');
    return;
  }

  const taskId = await testTaskCreation();
  if (!taskId) {
    console.log('❌ Cannot proceed without task creation');
    return;
  }

  await testTaskQueries(taskId);
  await testTaskUpdates(taskId);
  await testTaskDeletion(taskId);

  // Cleanup
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  console.log('\n✅ QA Testing Complete');
};

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

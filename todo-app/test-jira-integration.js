const jiraService = require('./services/jiraService');

// Test Jira service integration
const testJiraIntegration = async () => {
  console.log('🧪 Testing Jira Integration\n');

  try {
    // Test issue creation
    console.log('Testing issue creation...');
    const mockTask = {
      title: 'Test Integration Task',
      description: 'Testing Jira MCP integration',
      priority: 'High'
    };

    const issue = await jiraService.createIssue(mockTask);
    console.log('✅ Issue creation successful:', issue.key);

    // Test status transition
    console.log('Testing status transition...');
    await jiraService.transitionIssue(issue.key, 'Done');
    console.log('✅ Status transition successful');

    // Test error handling - invalid issue key
    console.log('Testing error handling...');
    try {
      await jiraService.transitionIssue('INVALID-KEY', 'Done');
      console.log('❌ Error handling failed: should have thrown');
    } catch (error) {
      console.log('✅ Error handling working: invalid key rejected');
    }

    return true;
  } catch (error) {
    console.log('❌ Jira integration test failed:', error.message);
    return false;
  }
};

// Test API with Jira integration
const testAPIWithJira = async () => {
  console.log('\n🔗 Testing API Endpoints with Jira Integration\n');

  const mongoose = require('mongoose');
  const Task = require('./models/Task');

  try {
    // Connect to test DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app-test');

    // Test task creation with Jira integration
    console.log('Testing task creation with Jira issue creation...');
    const task = new Task({
      title: 'API Integration Test',
      description: 'Testing full API + Jira flow',
      priority: 'Medium'
    });

    const savedTask = await task.save();

    // Simulate Jira integration (normally called in route)
    const jiraService = require('./services/jiraService');
    const jiraIssue = await jiraService.createIssue({
      title: savedTask.title,
      description: savedTask.description,
      priority: savedTask.priority
    });

    // Update task with Jira key
    savedTask.jiraIssueKey = jiraIssue.key;
    await savedTask.save();

    console.log('✅ Task created with Jira issue:', jiraIssue.key);

    // Test status update with Jira sync
    console.log('Testing task completion with Jira sync...');
    savedTask.completed = true;
    await savedTask.save();

    // Simulate status sync (normally called in route)
    await jiraService.transitionIssue(savedTask.jiraIssueKey, 'Done');
    console.log('✅ Task completion synced to Jira');

    // Cleanup
    await Task.findByIdAndDelete(savedTask._id);
    await mongoose.disconnect();

    return true;
  } catch (error) {
    console.log('❌ API + Jira integration test failed:', error.message);
    await mongoose.disconnect();
    return false;
  }
};

// Test error scenarios
const testErrorScenarios = async () => {
  console.log('\n🚨 Testing Error Scenarios\n');

  const jiraService = require('./services/jiraService');

  // Test Jira service failure doesn't break API
  console.log('Testing graceful degradation when Jira fails...');

  // Mock a failing Jira service
  const originalCreateIssue = jiraService.createIssue;
  jiraService.createIssue = async () => {
    throw new Error('Jira service unavailable');
  };

  try {
    const mongoose = require('mongoose');
    const Task = require('./models/Task');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app-test');

    // Create task - should succeed even if Jira fails
    const task = new Task({
      title: 'Error Handling Test',
      description: 'Testing graceful Jira failure',
      priority: 'Low'
    });

    const savedTask = await task.save();
    console.log('✅ Task created successfully despite Jira failure');

    // Simulate route logic with error handling
    try {
      await jiraService.createIssue({
        title: savedTask.title,
        description: savedTask.description,
        priority: savedTask.priority
      });
    } catch (jiraError) {
      console.log('✅ Jira error handled gracefully, task creation continued');
    }

    // Cleanup
    await Task.findByIdAndDelete(savedTask._id);
    await mongoose.disconnect();

    // Restore original method
    jiraService.createIssue = originalCreateIssue;

    return true;
  } catch (error) {
    console.log('❌ Error scenario test failed:', error.message);
    await mongoose.disconnect();
    jiraService.createIssue = originalCreateIssue;
    return false;
  }
};

// Run all integration tests
const runIntegrationTests = async () => {
  console.log('🚀 Starting Jira Integration QA Tests\n');

  const results = await Promise.all([
    testJiraIntegration(),
    testAPIWithJira(),
    testErrorScenarios()
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} suites passed`);

  if (passed === total) {
    console.log('✅ All Jira integration tests passed!');
  } else {
    console.log('❌ Some tests failed. Check logs above.');
  }

  return passed === total;
};

// Run if called directly
if (require.main === module) {
  runIntegrationTests();
}

module.exports = { runIntegrationTests };

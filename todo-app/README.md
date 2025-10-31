# TODO App Backend

Node.js/Express API for the TODO application with MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB locally or update MONGODB_URI in .env

3. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks (with optional filters: status, priority, search)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Task Schema

```json
{
  "title": "string (required)",
  "description": "string",
  "priority": "Low|Medium|High",
  "dueDate": "ISO date string",
  "completed": "boolean",
  "jiraIssueKey": "string"
}
```

## Jira Integration

The API now includes Jira MCP integration:

- **Task Creation**: Automatically creates a Jira issue in the KAN project when a task is added
- **Status Sync**: Updates Jira issue status when task completion changes
- **Issue Linking**: Tasks are linked to their corresponding Jira issues via `jiraIssueKey`

### MCP Tools Used
- `jira_create_issue`: Creates issues for new tasks
- `jira_transition_issue`: Syncs task completion status

### Configuration
Jira integration is configured through VS Code MCP settings. The service uses the KAN project for issue management.

## Development

- Uses Express.js for routing
- Mongoose for MongoDB ODM
- CORS enabled for frontend integration
- Input validation and error handling

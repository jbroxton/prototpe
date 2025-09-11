# Internal Projects API Guide for LLMs

This API allows LLMs to read and write project management data including projects, user stories, and acceptance criteria.

## Base URL
`http://localhost:3000/api/internal-projects`

## API Endpoints

### 1. Projects Management

#### List All Projects
```
GET /api/internal-projects
```
Returns all projects with summary statistics.

#### Get Specific Project
```
GET /api/internal-projects?projectId={projectId}
```
Returns detailed information about a specific project including all user stories.

#### Create New Project
```
POST /api/internal-projects
Content-Type: application/json

{
  "name": "Project Name",
  "about": "Project description",
  "status": "Not Started" | "In Progress" | "Completed",
  "userStories": [] // optional, can add stories immediately
}
```

#### Update Project
```
PUT /api/internal-projects
Content-Type: application/json

{
  "projectId": "proj-123",
  "name": "Updated Name",
  "about": "Updated description",
  "status": "In Progress",
  "userStories": [...] // complete array of user stories
}
```

#### Delete Project
```
DELETE /api/internal-projects?projectId={projectId}
```

### 1.a Minimal Summary (LLM-optimized)
```
GET /api/internal-projects/summary
```
Returns minimal list for quick scan:
```json
{
  "success": true,
  "projects": [
    { "id": "...", "name": "...", "status": "In Progress", "storyCount": 3, "completedCount": 1 }
  ]
}
```

### 1.b Full Export
```
GET /api/internal-projects/export
```
Returns full structured data matching the UI "LLM-Readable Format" view.

### 2. User Stories Management

#### Get All Stories for a Project
```
GET /api/internal-projects/stories?projectId={projectId}
```

#### Add User Story
```
POST /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "action": "add",
  "story": {
    "title": "User can login",
    "description": "As a user, I want to login so that I can access my account",
    "status": "Not Started",
    "priority": "High",
    "acceptanceCriteria": []
  }
}
```

#### Update User Story
```
POST /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "action": "update",
  "story": {
    "id": "US1",
    "title": "Updated title",
    "description": "Updated description",
    "status": "In Progress",
    "priority": "Medium"
  }
}
```

#### Delete User Story
```
POST /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "action": "delete",
  "story": {
    "id": "US1"
  }
}
```

### 3. Acceptance Criteria Management

#### Add Acceptance Criteria
```
PUT /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "storyId": "US1",
  "action": "add",
  "acceptanceCriteria": {
    "description": "Given user is on login page, When they enter valid credentials, Then they should be redirected to dashboard",
    "status": "Not Started"
  }
}
```

#### Update Acceptance Criteria
```
PUT /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "storyId": "US1",
  "action": "update",
  "acceptanceCriteria": {
    "id": "AC1",
    "description": "Updated criteria",
    "status": "Completed"
  }
}
```

#### Delete Acceptance Criteria
```
PUT /api/internal-projects/stories
Content-Type: application/json

{
  "projectId": "proj-123",
  "storyId": "US1",
  "action": "delete",
  "acceptanceCriteria": {
    "id": "AC1"
  }
}
```

## Data Structure

### Project
```json
{
  "id": "proj-123",
  "name": "Project Name",
  "about": "Description",
  "status": "In Progress",
  "userStories": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### User Story
```json
{
  "id": "US1",
  "title": "Story Title",
  "description": "As a..., I want..., So that...",
  "status": "Not Started" | "In Progress" | "Completed",
  "priority": "Low" | "Medium" | "High",
  "acceptanceCriteria": [...]
}
```

### Acceptance Criteria
```json
{
  "id": "AC1",
  "description": "Given..., When..., Then...",
  "status": "Not Started" | "In Progress" | "Completed"
}
```

## Example: Complete Project Creation Flow

```javascript
// 1. Create a new project
const project = await fetch('/api/internal-projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'E-commerce Platform',
    about: 'Building a modern e-commerce platform',
    status: 'In Progress'
  })
}).then(r => r.json());

// 2. Add a user story
await fetch('/api/internal-projects/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: project.data.id,
    action: 'add',
    story: {
      title: 'User Authentication',
      description: 'As a user, I want to register and login',
      status: 'In Progress',
      priority: 'High'
    }
  })
});

// 3. Add acceptance criteria
await fetch('/api/internal-projects/stories', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: project.data.id,
    storyId: 'US1',
    action: 'add',
    acceptanceCriteria: {
      description: 'Given user is on registration page, When they submit valid data, Then account should be created',
      status: 'Not Started'
    }
  })
});
```

## Notes for LLMs

1. Always use the API endpoints to persist data (not localStorage).
2. IDs: User Story IDs are presented as `US{number}` and AC as `AC{number}`; these are derived from numeric fields in the database.
3. Validation: Status must be one of: "Not Started", "In Progress", "Completed". Priority must be one of: "Low", "Medium", "High". Invalid values return 400.
4. Persistence: Data is stored in PostgreSQL via Prisma; no in-memory storage.

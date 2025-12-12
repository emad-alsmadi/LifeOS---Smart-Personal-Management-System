# LifeOS API Endpoints

This document provides a comprehensive list of all available API endpoints.

> **Authentication:** All endpoints, except for `/auth/signup` and `/auth/login`, require a valid JSON Web Token (JWT) to be included in the `Authorization` header of the request.
> 
> `Authorization: Bearer YOUR_JWT_TOKEN`

---

## Authentication (`/auth`)

### Sign Up
- **POST** `/auth/signup`
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`

### Login
- **POST** `/auth/login`
- **Body:** `{ "email": "...", "password": "..." }`

---

## Pillars (`/pillars`)

- **GET** `/pillars`: Get all pillars.
- **POST** `/pillars`: Create a new pillar.
- **GET** `/pillars/categories/all`: Get all unique pillar categories.
- **GET** `/pillars/goals/names`: Get names of all goals for dropdowns.
- **GET** `/pillars/:id`: Get a single pillar by ID.
- **PUT** `/pillars/:id`: Update a pillar by ID.
- **DELETE** `/pillars/:id`: Delete a pillar by ID.

---

## Goals (`/goals`)

- **GET** `/goals`: Get all goals.
- **POST** `/goals`: Create a new goal.
- **GET** `/goals/categories/all`: Get all unique goal categories.
- **GET** `/goals/pillars/names`: Get names of all pillars for dropdowns.
- **GET** `/goals/visions/names`: Get names of all visions for dropdowns.
- **GET** `/goals/:id`: Get a single goal by ID.
- **PUT** `/goals/:id`: Update a goal by ID.
- **DELETE** `/goals/:id`: Delete a goal by ID.

---

## Objectives (`/objectives`)

- **GET** `/objectives`: Get all objectives.
- **POST** `/objectives`: Create a new objective.
- **GET** `/objectives/:id`: Get a single objective by ID.
- **PUT** `/objectives/:id`: Update an objective by ID.
- **DELETE** `/objectives/:id`: Delete an objective by ID.

---

## Projects (`/projects`)

- **GET** `/projects`: Get all projects.
- **POST** `/projects`: Create a new project.
- **GET** `/projects/visions/names`: Get names of all visions for dropdowns.
- **GET** `/projects/:id`: Get a single project by ID.
- **PUT** `/projects/:id`: Update a project by ID.
- **DELETE** `/projects/:id`: Delete a project by ID.

---

## Tasks (`/tasks`)

- **GET** `/tasks`: Get all tasks.
- **POST** `/tasks`: Create a new task.
- **GET** `/tasks/project/:projectId`: Get tasks by project.
- **GET** `/tasks/objective/:objectiveId`: Get tasks by objective.
- **GET** `/tasks/:id`: Get a single task by ID.
- **PUT** `/tasks/:id`: Update a task by ID.
- **DELETE** `/tasks/:id`: Delete a task by ID.

---

## Habits (`/habits`)

- **GET** `/habits`: Get all habits.
- **POST** `/habits`: Create a new habit.
- **GET** `/habits/:id`: Get a single habit by ID.
- **PUT** `/habits/:id`: Update a habit by ID.
- **DELETE** `/habits/:id`: Delete a habit by ID.
- **POST** `/habits/:id/complete`: Mark habit as completed for a date.
- **POST** `/habits/:id/uncomplete`: Unmark habit as completed for a date.

---

## Notes (`/notes`)

- **GET** `/notes`: Get all notes.
- **POST** `/notes`: Create a new note.
- **GET** `/notes/search`: Search notes by title, content, or tags.
- **GET** `/notes/category/:category`: Get notes by category.
- **GET** `/notes/:id`: Get a single note by ID.
- **PUT** `/notes/:id`: Update a note by ID.
- **DELETE** `/notes/:id`: Delete a note by ID.
- **PATCH** `/notes/:id/favorite`: Toggle favorite status.
- **PATCH** `/notes/:id/pin`: Toggle pinned status.

---

## Events (`/events`)

- **GET** `/events`: Get all events.
- **POST** `/events`: Create a new event.
- **GET** `/events/range/:start/:end`: Get events by date range.
- **GET** `/events/type/:type`: Get events by type.
- **GET** `/events/:id`: Get a single event by ID.
- **PUT** `/events/:id`: Update an event by ID.
- **DELETE** `/events/:id`: Delete an event by ID.
- **PATCH** `/events/:id/status`: Update event status.

---

## Visions (`/visions`)

- **GET** `/visions`: Get all visions.
- **POST** `/visions`: Create a new vision.
- **GET** `/visions/:id`: Get a single vision by ID.
- **PUT** `/visions/:id`: Update a vision by ID.
- **DELETE** `/visions/:id`: Delete a vision by ID.
- **GET** `/visions/goals/names`: Get names of all goals for dropdowns.
- **GET** `/visions/pillars/names`: Get names of all pillars for dropdowns.
- **GET** `/visions/projects/names`: Get names of all projects for dropdowns.

> **IMPORTANT "Rollup" Behavior:** When creating (`POST`) or updating (`PUT`) a vision, you only need to send an array of `pillar` IDs. The server will automatically find all goals linked to those pillars and associate them with the vision.

---

## Request/Response Examples

### Create a Pillar
```http
POST /pillars
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Health & Fitness",
  "description": "Maintaining physical and mental well-being",
  "category": "Health",
  "color": "#10b981",
  "icon": "Heart"
}
```

### Create a Goal
```http
POST /goals
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Run a Marathon",
  "description": "Complete a full marathon within 6 months",
  "status": "Active",
  "priority": "High",
  "category": "Health",
  "pillars": ["pillar_id_here"],
  "targetDate": "2024-06-15T00:00:00.000Z",
  "progress": 25
}
```

### Create a Task
```http
POST /tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Buy running shoes",
  "description": "Purchase proper running shoes for training",
  "status": "Not Started",
  "priority": "Medium",
  "type": "Personal",
  "projectId": "project_id_here",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "estimatedHours": 2
}
```

### Create a Habit
```http
POST /habits
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Daily Exercise",
  "description": "30 minutes of physical activity",
  "frequency": "Daily",
  "targetCount": 1,
  "category": "Health",
  "reminderTime": "07:00"
}
```

### Create a Note
```http
POST /notes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Training Plan Ideas",
  "content": "Consider adding strength training to the marathon prep",
  "category": "Work",
  "tags": ["training", "marathon", "fitness"],
  "isFavorite": false,
  "isPinned": false,
  "color": "#ffffff"
}
```

### Create an Event
```http
POST /events
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Marathon Race",
  "description": "Annual city marathon",
  "startDate": "2024-06-15T08:00:00.000Z",
  "endDate": "2024-06-15T14:00:00.000Z",
  "allDay": false,
  "type": "Event",
  "priority": "High",
  "location": "Central Park",
  "color": "#ef4444"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "data": {
    "field": "Specific field error"
  },
  "stack": "Error stack trace (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
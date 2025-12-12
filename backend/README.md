<<<<<<< HEAD
# LifeOS Backend API

A comprehensive REST API for the LifeOS life management application.

## 🚀 Features

- **Authentication**: JWT-based user authentication
- **Pillars**: Life pillars management (Health, Career, Relationships, etc.)
- **Goals**: Goal setting and tracking
- **Objectives**: Specific objectives linked to goals
- **Projects**: Project management with tasks
- **Tasks**: Task management with priorities and dependencies
- **Habits**: Habit tracking with streaks
- **Notes**: Note-taking with categories and tags
- **Events**: Calendar events and scheduling
- **User Management**: User profiles and settings

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/lifeos

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### Pillars
- `GET /pillars` - Get all pillars
- `POST /pillars` - Create new pillar
- `GET /pillars/:id` - Get single pillar
- `PUT /pillars/:id` - Update pillar
- `DELETE /pillars/:id` - Delete pillar

### Goals
- `GET /goals` - Get all goals
- `POST /goals` - Create new goal
- `GET /goals/:id` - Get single goal
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal

### Objectives
- `GET /objectives` - Get all objectives
- `POST /objectives` - Create new objective
- `GET /objectives/:id` - Get single objective
- `PUT /objectives/:id` - Update objective
- `DELETE /objectives/:id` - Delete objective

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get single project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/project/:projectId` - Get tasks by project
- `GET /tasks/objective/:objectiveId` - Get tasks by objective

### Habits
- `GET /habits` - Get all habits
- `POST /habits` - Create new habit
- `GET /habits/:id` - Get single habit
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `POST /habits/:id/complete` - Mark habit as completed
- `POST /habits/:id/uncomplete` - Unmark habit as completed

### Notes
- `GET /notes` - Get all notes
- `POST /notes` - Create new note
- `GET /notes/:id` - Get single note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /notes/search` - Search notes
- `GET /notes/category/:category` - Get notes by category
- `PATCH /notes/:id/favorite` - Toggle favorite status
- `PATCH /notes/:id/pin` - Toggle pinned status

### Events
- `GET /events` - Get all events
- `POST /events` - Create new event
- `GET /events/:id` - Get single event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/range/:start/:end` - Get events by date range
- `GET /events/type/:type` - Get events by type
- `PATCH /events/:id/status` - Update event status

## 🔐 Authentication

All endpoints (except `/auth/*`) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📊 Database Schema

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)

### Pillar
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `category`: String (enum)
- `color`: String
- `icon`: String
- `goals`: Array of ObjectIds (ref: Goal)
- `isActive`: Boolean
- `priority`: Number
- `notes`: String

### Goal
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `status`: String (enum)
- `priority`: String (enum)
- `category`: String (enum)
- `pillars`: Array of ObjectIds (ref: Pillar)
- `objectives`: Array of ObjectIds (ref: Objective)
- `targetDate`: Date
- `startDate`: Date
- `completionDate`: Date
- `progress`: Number (0-100)
- `milestones`: Array
- `tags`: Array of Strings
- `notes`: String
- `isPublic`: Boolean

### Objective
- `userId`: ObjectId (ref: User)
- `title`: String (required)
- `description`: String
- `status`: String (enum)
- `priority`: String (enum)
- `relatedGoals`: Array of ObjectIds (ref: Goal)
- `relatedProjects`: Array of ObjectIds (ref: Project)
- `deadline`: Date
- `category`: String

### Project
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `status`: String (enum)
- `priority`: String (enum)
- `category`: String (enum)
- `objectives`: Array of ObjectIds (ref: Objective)
- `goals`: Array of ObjectIds (ref: Goal)
- `startDate`: Date
- `endDate`: Date
- `targetDate`: Date
- `progress`: Number (0-100)
- `budget`: Object
- `team`: Array
- `tags`: Array of Strings
- `attachments`: Array
- `notes`: String
- `isPublic`: Boolean
- `color`: String

### Task
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `status`: String (enum)
- `priority`: String (enum)
- `type`: String (enum)
- `projectId`: ObjectId (ref: Project)
- `objectiveId`: ObjectId (ref: Objective)
- `dueDate`: Date
- `estimatedHours`: Number
- `actualHours`: Number
- `notes`: String
- `tags`: Array of Strings
- `attachments`: Array
- `dependencies`: Array of ObjectIds (ref: Task)

### Habit
- `userId`: ObjectId (ref: User)
- `name`: String (required)
- `description`: String
- `frequency`: String (enum)
- `targetCount`: Number
- `currentStreak`: Number
- `longestStreak`: Number
- `completedDates`: Array of Strings
- `category`: String (enum)
- `reminderTime`: String
- `isActive`: Boolean
- `notes`: String

### Note
- `userId`: ObjectId (ref: User)
- `title`: String (required)
- `content`: String
- `category`: String (enum)
- `tags`: Array of Strings
- `isFavorite`: Boolean
- `isPinned`: Boolean
- `color`: String
- `attachments`: Array
- `relatedItems`: Object

### Event
- `userId`: ObjectId (ref: User)
- `title`: String (required)
- `description`: String
- `startDate`: Date (required)
- `endDate`: Date (required)
- `allDay`: Boolean
- `type`: String (enum)
- `priority`: String (enum)
- `status`: String (enum)
- `location`: String
- `color`: String
- `recurring`: Object
- `attendees`: Array
- `relatedItems`: Object
- `reminders`: Array
- `notes`: String

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Error handling middleware
- User-specific data isolation

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure `MONGO_URI` for your production database
- Set appropriate `CORS_ORIGIN`

## 📝 License

This project is licensed under the MIT License. 
=======
# lifeos
backend project
>>>>>>> a205f449134266c095684506444f48ec2d6f7963

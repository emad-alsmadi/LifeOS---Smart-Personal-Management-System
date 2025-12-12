const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const isAuth = require('../middleware/is-auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// GET /tasks - Get all tasks
router.get('/', taskController.getTasks);

// GET /tasks/project/:projectId - Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);

// GET /tasks/objective/:objectiveId - Get tasks by objective
router.get('/objective/:objectiveId', taskController.getTasksByObjective);

// GET /tasks/progress-summary - Get overall task progress summary
router.get('/progress-summary', taskController.getTaskProgressSummary);

// GET /tasks/:id - Get single task
router.get('/:id', taskController.getTask);

// POST /tasks - Create new task
router.post('/', taskController.createTask);

// PUT /tasks/:id - Update task
router.put('/:id', taskController.updateTask);

// DELETE /tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
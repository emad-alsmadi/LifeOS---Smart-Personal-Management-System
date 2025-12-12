const express = require('express');
const router = express.Router();
const objectiveController = require('../controllers/objectiveController');
const isAuth = require('../middleware/is-auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// GET /objectives - Get all objectives
router.get('/', objectiveController.getObjectives);

// GET /objectives/names - Get all objective names for dropdown
router.get('/names/all', objectiveController.getObjectiveNames);

// GET /objectives/goals/names - Get all goal names for dropdown
router.get('/goals/names', objectiveController.getGoalNames);

// GET /objectives/projects/names - Get all project names for dropdown
router.get('/projects/names', objectiveController.getProjectNames);

// GET /objectives/progress-summary - Get overall objective progress summary
router.get('/progress-summary', objectiveController.getObjectiveProgressSummary);
// GET /objectives/with-project-progress - Get all objectives with progress calculated by related projects
router.get('/with-project-progress', objectiveController.getObjectivesWithProjectProgress);

// GET /objectives/:id - Get single objective
router.get('/:id', objectiveController.getObjective);

// POST /objectives - Create new objective
router.post('/', objectiveController.createObjective);

// PUT /objectives/:id - Update objective
router.put('/:id', objectiveController.updateObjective);

// DELETE /objectives/:id - Delete objective
router.delete('/:id', objectiveController.deleteObjective);

module.exports = router; 
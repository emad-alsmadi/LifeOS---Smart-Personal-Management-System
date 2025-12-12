const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/is-auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new goal
router.post('/', goalController.createGoal);

// Get all goals
router.get('/', goalController.getGoals);

// Get all categories for dropdown
router.get('/categories/all', goalController.getCategories);
// GET /goals/progress-summary - Get overall goal progress summary
router.get('/progress-summary', goalController.getGoalProgressSummary);
// GET /goals/with-objective-progress - Get all goals with progress calculated by related objectives
router.get('/with-objective-progress', goalController.getGoalsWithObjectiveProgress);

// Get a single goal by ID
router.get('/:id', goalController.getGoalById);

// Update a goal
router.put('/:id', goalController.updateGoal);

// Delete a goal
router.delete('/:id', goalController.deleteGoal);


module.exports = router;
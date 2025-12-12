const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const isAuth = require('../middleware/is-auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// GET /habits - Get all habits
router.get('/', habitController.getHabits);

// GET /habits/:id - Get single habit
router.get('/:id', habitController.getHabit);

// POST /habits - Create new habit
router.post('/', habitController.createHabit);

// PUT /habits/:id - Update habit
router.put('/:id', habitController.updateHabit);

// DELETE /habits/:id - Delete habit
router.delete('/:id', habitController.deleteHabit);

// POST /habits/:id/complete - Mark habit as completed
router.post('/:id/complete', habitController.completeHabit);

// POST /habits/:id/uncomplete - Unmark habit as completed
router.post('/:id/uncomplete', habitController.uncompleteHabit);

module.exports = router;
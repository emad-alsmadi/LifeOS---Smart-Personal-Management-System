const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const goalRoutes = require('./goalRoutes');
const projectRoutes = require('./projectRoutes');
const objectiveRoutes = require('./objectiveRoutes');
const taskRoutes = require('./taskRoutes');
const habitRoutes = require('./habitRoutes');
const noteRoutes = require('./noteRoutes');
const eventRoutes = require('./eventRoutes');


// Use routes
router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/projects', projectRoutes);
router.use('/objectives', objectiveRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/notes', noteRoutes);
router.use('/events', eventRoutes);



// Base route
router.get('/', (req, res) => {
    res.send('🚀 LifeOS API is running!');
});

module.exports = router;
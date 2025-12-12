const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const isAuth = require('../middleware/is-auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// GET /events - Get all events
router.get('/', eventController.getEvents);

// GET /events/range/:start/:end - Get events by date range
router.get('/range/:start/:end', eventController.getEventsByDateRange);

// GET /events/type/:type - Get events by type
router.get('/type/:type', eventController.getEventsByType);

// GET /events/:id - Get single event
router.get('/:id', eventController.getEvent);

// POST /events - Create new event
router.post('/', eventController.createEvent);

// PUT /events/:id - Update event
router.put('/:id', eventController.updateEvent);

// DELETE /events/:id - Delete event
router.delete('/:id', eventController.deleteEvent);

// PATCH /events/:id/status - Update event status
router.patch('/:id/status', eventController.updateEventStatus);

module.exports = router; 
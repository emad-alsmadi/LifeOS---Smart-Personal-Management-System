const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const isAuth = require('../middleware/is-auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// GET /notes - Get all notes
router.get('/', noteController.getNotes);

// GET /notes/search - Search notes
router.get('/search', noteController.searchNotes);

// GET /notes/category/:category - Get notes by category
router.get('/category/:category', noteController.getNotesByCategory);

// GET /notes/:id - Get single note
router.get('/:id', noteController.getNote);

// POST /notes - Create new note
router.post('/', noteController.createNote);

// PUT /notes/:id - Update note
router.put('/:id', noteController.updateNote);

// DELETE /notes/:id - Delete note
router.delete('/:id', noteController.deleteNote);

// PATCH /notes/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', noteController.toggleFavorite);

// PATCH /notes/:id/pin - Toggle pinned status
router.patch('/:id/pin', noteController.togglePinned);

module.exports = router; 
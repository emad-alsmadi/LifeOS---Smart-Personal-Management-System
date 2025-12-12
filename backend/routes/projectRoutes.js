const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const isAuth = require('../middleware/is-auth');

router.use(isAuth);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/progress-summary', projectController.getProjectProgressSummary);
router.get('/with-task-progress', projectController.getProjectsWithTaskProgress);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
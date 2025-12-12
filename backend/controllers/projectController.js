const Project = require('../models/Project');
// Removed: const Vision = require('../models/Vision');
const Task = require('../models/Task');

// Helper to calculate task progress (partial credit)
/*function getTaskProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
}*/
// Helper to calculate project progress (partial credit, same as tasks)
function getProjectProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
}

// Utility: Calculate project progress by tasks
async function calculateProjectProgress(projectId) {
  const tasks = await Task.find({ projectId });
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { totalTasks: total, completedTasks: completed, progressPercent: percent };
}

// Endpoint: Get all projects with progress calculated by tasks
exports.getProjectsWithTaskProgress = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    
    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
      const progress = await calculateProjectProgress(project._id);
      // Get associated tasks for this project
      const tasks = await Task.find({ projectId: project._id }).select('_id name status priority dueDate');
      
      const result = { 
        ...project.toObject(), 
        ...progress,
        tasks: tasks // Include the actual task objects
      };
      return result;
    }));
    
    res.json(projectsWithProgress);
  } catch (err) {
    console.error('Error in getProjectsWithTaskProgress:', err);
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Endpoint: Get overall project progress summary for the user
exports.getProjectProgressSummary = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    let totalTasks = 0;
    let completedTasks = 0;
    for (const project of projects) {
      const tasks = await Task.find({ projectId: project._id });
      totalTasks += tasks.length;
      completedTasks += tasks.filter(t => t.status === 'Completed').length;
    }
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    res.json({ totalProjects: projects.length, totalTasks, completedTasks, progressPercent: percent });
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    const { name, status, priority, objectives, startDate, dueDate } = req.body;
    const project = new Project({
      userId: req.user._id,
      name,
      status,
      priority,
      objectives,
      startDate,
      dueDate,
    });
    await project.save();
    const populatedProject = await Project.findById(project._id).populate('objectives', 'title');
    res.status(201).json(populatedProject);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Get all projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    // Add progress to each project
    const projectsWithProgress = projects.map(project => ({
      ...project.toObject(),
      progress: getProjectProgress(project.status)
    }));
    res.json(projectsWithProgress);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Add progress to the project
    const projectWithProgress = {
      ...project.toObject(),
      progress: getProjectProgress(project.status)
    };
    res.json(projectWithProgress);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Update a project
exports.updateProject = async (req, res, next) => {
  try {
    const { name, status, priority, objectives, startDate, dueDate } = req.body;
    const projectId = req.params.id;

    // Find the old project
    const oldProject = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!oldProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update the project
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId: req.user._id },
      { name, status, priority, objectives, startDate, dueDate },
      { new: true }
    ).populate('objectives', 'title');

    res.json(project);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};
exports.getObjectiveNames = async (req, res, next) => {
  try {
    const objectives = await Objective.find({ userId: req.userId }).select('title');
    res.json(objectives);
  } catch (error) {
    next(error);
  }
}; 
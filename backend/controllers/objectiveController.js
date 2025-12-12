const Objective = require('../models/Objective');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Helper to calculate task progress (partial credit)
/*function getTaskProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
}*/
// Helper to calculate project progress (partial credit)
async function getProjectProgress(projectId) {
  const tasks = await Task.find({ projectId });
  if (!tasks.length) return 0;
  const progresses = tasks.map(t => getTaskProgress(t.status));
  const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length;
  return Math.round(avg);
}

// Helper to calculate objective progress (partial credit, same as tasks)
function getObjectiveProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
}

// Helper to calculate goal progress
async function getGoalProgress(goal) {
  const objectiveIds = (goal.objectives || []).map(o => (typeof o === 'string' ? o : o._id));
  if (!objectiveIds.length) return 0;
  const objectives = await Objective.find({ _id: { $in: objectiveIds } });
  const progresses = await Promise.all(objectives.map(getObjectiveProgress));
  const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length;
  return Math.round(avg);
}

// Utility: Calculate project progress by tasks (reuse from projectController if needed)
async function calculateProjectProgress(projectId) {
  const tasks = await Task.find({ projectId });
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { totalTasks: total, completedTasks: completed, progressPercent: percent };
}

// Utility: Calculate objective progress as average of related projects' progress
async function calculateObjectiveProgress(objective) {
  const projectIds = (objective.relatedProjects || []).map(p => (typeof p === 'string' ? p : p._id));
  if (!projectIds.length) return { projectCount: 0, progressPercent: 0 };
  const progresses = await Promise.all(projectIds.map(async (projectId) => {
    const { progressPercent } = await calculateProjectProgress(projectId);
    return progressPercent;
  }));
  const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length;
  return { projectCount: projectIds.length, progressPercent: Math.round(avg) };
}

// Get all objectives for a user
exports.getObjectives = async (req, res, next) => {
  try {
    const objectives = await Objective.find({ userId: req.userId })
      .populate('relatedGoals', 'name status')
      .populate('relatedProjects', 'name status')
      .sort({ createdAt: -1 });
    // Add progress to each objective
    const objectivesWithProgress = objectives.map(obj => ({
      ...obj.toObject(),
      progress: getObjectiveProgress(obj.status)
    }));
    res.status(200).json(objectivesWithProgress);
  } catch (error) {
    next(error);
  }
};

// Get single objective by ID
exports.getObjective = async (req, res, next) => {
  try {
    const objective = await Objective.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    })
    .populate('relatedGoals', 'name status description')
    .populate('relatedProjects', 'name status description');
    
    if (!objective) {
      const error = new Error('Objective not found');
      error.statusCode = 404;
      throw error;
    }
    // Add progress to the objective
    const objectiveWithProgress = {
      ...objective.toObject(),
      progress: getObjectiveProgress(objective.status)
    };
    res.status(200).json(objectiveWithProgress);
  } catch (error) {
    next(error);
  }
};

// Create new objective
exports.createObjective = async (req, res, next) => {
  try {
    const { title, status, priority, relatedGoals, relatedProjects } = req.body;
    
    const objective = new Objective({
      userId: req.userId,
      title,
      status,
      priority,
      relatedGoals,
      relatedProjects
    });
    
    const savedObjective = await objective.save();
    // Populate relatedProjects and relatedGoals before returning
    const populatedObjective = await Objective.findById(savedObjective._id)
      .populate('relatedGoals', 'name status')
      .populate('relatedProjects', 'name status');
    res.status(201).json(populatedObjective);
  } catch (error) {
    next(error);
  }
};

// Update objective
exports.updateObjective = async (req, res, next) => {
  try {
    const { title, status, priority, relatedGoals, relatedProjects } = req.body;
    
    await Objective.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        title,
        status,
        priority,
        relatedGoals,
        relatedProjects
      },
      { new: true, runValidators: true }
    );
    // Populate relatedProjects and relatedGoals before returning
    const populatedObjective = await Objective.findById(req.params.id)
      .populate('relatedGoals', 'name status')
      .populate('relatedProjects', 'name status');
    if (!populatedObjective) {
      const error = new Error('Objective not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(populatedObjective);
  } catch (error) {
    next(error);
  }
};

// Delete objective
exports.deleteObjective = async (req, res, next) => {
  try {
    const objective = await Objective.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!objective) {
      const error = new Error('Objective not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({ message: 'Objective deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 

// Get all objective names for dropdown
exports.getObjectiveNames = async (req, res, next) => {
  try {
    const objectives = await Objective.find({ userId: req.userId }).select('title');
    res.json(objectives);
  } catch (error) {
    next(error);
  }
}; 

// Get all goal names for dropdown
exports.getGoalNames = async (req, res, next) => {
  try {
    const Goal = require('../models/Goal');
    const goals = await Goal.find({ userId: req.userId }).select('name');
    res.json(goals);
  } catch (error) {
    next(error);
  }
};

// Get all project names for dropdown
exports.getProjectNames = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projects = await Project.find({ userId: req.userId }).select('name');
    res.json(projects);
  } catch (error) {
    next(error);
  }
}; 

// Endpoint: Get all objectives with progress calculated by related projects
exports.getObjectivesWithProjectProgress = async (req, res, next) => {
  try {
    const objectives = await Objective.find({ userId: req.userId })
      .populate('relatedGoals', 'name status')
      .populate('relatedProjects', 'name status')
      .sort({ createdAt: -1 });
    const objectivesWithProgress = await Promise.all(objectives.map(async (obj) => {
      const progress = await calculateObjectiveProgress(obj);
      return { ...obj.toObject(), ...progress };
    }));
    res.status(200).json(objectivesWithProgress);
  } catch (error) {
    next(error);
  }
};

// Endpoint: Get overall objective progress summary for the user
exports.getObjectiveProgressSummary = async (req, res, next) => {
  try {
    const objectives = await Objective.find({ userId: req.userId });
    let totalProjects = 0;
    let totalProgress = 0;
    let countedObjectives = 0;
    for (const obj of objectives) {
      const { projectCount, progressPercent } = await calculateObjectiveProgress(obj);
      if (projectCount > 0) {
        totalProjects += projectCount;
        totalProgress += progressPercent;
        countedObjectives++;
      }
    }
    const avgProgress = countedObjectives > 0 ? Math.round(totalProgress / countedObjectives) : 0;
    res.status(200).json({ totalObjectives: objectives.length, totalProjects, avgProgressPercent: avgProgress });
  } catch (error) {
    next(error);
  }
}; 
const Goal = require('../models/Goal');
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

// Helper to calculate objective progress (status-based)
async function getObjectiveProgress(objective) {
  const projectIds = (objective.relatedProjects || []).map(p => (typeof p === 'string' ? p : p._id));
  if (!projectIds.length) return 0;
  const progresses = await Promise.all(projectIds.map(getProjectProgress));
  const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length;
  return Math.round(avg);
}

// Helper to calculate goal progress (partial credit, same as tasks)
function getGoalProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
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
  try {
    const projectIds = (objective.relatedProjects || []).map(p => (typeof p === 'string' ? p : p._id));
    if (!projectIds.length) return { projectCount: 0, progressPercent: 0 };
    const progresses = await Promise.all(projectIds.map(async (projectId) => {
      const { progressPercent } = await calculateProjectProgress(projectId);
      return progressPercent;
    }));
    const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length;
    return { projectCount: projectIds.length, progressPercent: Math.round(avg) };
  } catch (err) {
    console.error('Error in calculateObjectiveProgress:', err);
    throw err;
  }
}

// Utility: Calculate goal progress as average of related objectives' progress
async function calculateGoalProgress(goal) {
  try {
    const objectiveIds = (goal.objectives || []).map(o => (typeof o === 'string' ? o : o._id));
    if (!objectiveIds.length) return { objectiveCount: 0, progressPercent: 0 };
    const objectives = await Objective.find({ _id: { $in: objectiveIds } });
    const progresses = await Promise.all(objectives.map(calculateObjectiveProgress));
    const avg = progresses.reduce((a, b) => a + b.progressPercent, 0) / progresses.length;
    return { objectiveCount: objectives.length, progressPercent: Math.round(avg) };
  } catch (err) {
    console.error('Error in calculateGoalProgress:', err);
    throw err;
  }
}

// Create a new goal
exports.createGoal = async (req, res, next) => {
  try {
    const { name, status, category, objectives } = req.body;
    const goal = new Goal({
      userId: req.user._id,
      name,
      status,
      category,
      objectives
    });
    await goal.save();

    const populatedGoal = await Goal.findById(goal._id);
    res.status(201).json(populatedGoal);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Get all goals
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    // Add progress to each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal.toObject(),
      progress: getGoalProgress(goal.status)
    }));
    res.json(goalsWithProgress);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Get a single goal by ID
exports.getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    // Add progress to the goal
    const goalWithProgress = {
      ...goal.toObject(),
      progress: getGoalProgress(goal.status)
    };
    res.json(goalWithProgress);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Update a goal
exports.updateGoal = async (req, res, next) => {
  try {
    const { name, status, category, objectives } = req.body;
    const oldGoal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!oldGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update the goal
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, status, category, objectives },
      { new: true }
    );

    res.json(goal);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Delete a goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Get all categories for dropdown
exports.getCategories = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    const categories = [...new Set(goals.flatMap(goal => goal.category))];
    res.json(categories);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

// Endpoint: Get all goals with progress calculated by related objectives
exports.getGoalsWithObjectiveProgress = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const progress = await calculateGoalProgress(goal);
      return { ...goal.toObject(), ...progress };
    }));
    res.json(goalsWithProgress);
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
    next(err);
  }
};

// Endpoint: Get overall goal progress summary for the user
exports.getGoalProgressSummary = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    let totalObjectives = 0;
    let totalProgress = 0;
    let countedGoals = 0;
    for (const goal of goals) {
      const { objectiveCount, progressPercent } = await calculateGoalProgress(goal);
      if (objectiveCount > 0) {
        totalObjectives += objectiveCount;
        totalProgress += progressPercent;
        countedGoals++;
      }
    }
    const avgProgress = countedGoals > 0 ? Math.round(totalProgress / countedGoals) : 0;
    res.json({ totalGoals: goals.length, totalObjectives, avgProgressPercent: avgProgress });
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
    next(err);
  }
};

const Task = require('../models/Task');

// Helper to calculate task progress (partial credit)
function getTaskProgress(status) {
  if (status === 'Completed') return 100;
  if (status === 'In Progress') return 50;
  return 0;
}

// Get all tasks for a user
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .populate('projectId', 'name status')
      .populate('objectiveId', 'title status')
      .sort({ createdAt: -1 });
    // Add progress to each task
    const tasksWithProgress = tasks.map(task => ({
      ...task.toObject(),
      progress: getTaskProgress(task.status)
    }));
    res.status(200).json(tasksWithProgress);
  } catch (error) {
    next(error);
  }
};

// Get single task by ID
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    })
    .populate('projectId', 'name status description')
    .populate('objectiveId', 'title status description')
    .populate('dependencies', 'name status');
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    // Add progress to the task
    const taskWithProgress = {
      ...task.toObject(),
      progress: getTaskProgress(task.status)
    };
    res.status(200).json(taskWithProgress);
  } catch (error) {
    next(error);
  }
};

// Create new task
exports.createTask = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      status, 
      priority, 
      type, 
      projectId, 
      objectiveId, 
      dueDate, 
      estimatedHours, 
      notes, 
      tags, 
      dependencies 
    } = req.body;
    
    // Ensure type has a default value if not provided
    const taskType = type && type.trim() ? type.trim() : 'General';
    
    const task = new Task({
      userId: req.userId,
      name,
      description,
      status,
      priority,
      type: taskType,
      projectId,
      objectiveId,
      dueDate,
      estimatedHours,
      notes,
      tags,
      dependencies
    });
    
    const savedTask = await task.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      status, 
      priority, 
      type, 
      projectId, 
      objectiveId, 
      dueDate, 
      estimatedHours, 
      actualHours,
      notes, 
      tags, 
      dependencies 
    } = req.body;
    
    // Ensure type has a default value if not provided
    const taskType = type && type.trim() ? type.trim() : 'General';
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        name,
        description,
        status,
        priority,
        type: taskType,
        projectId,
        objectiveId,
        dueDate,
        estimatedHours,
        actualHours,
        notes,
        tags,
        dependencies
      },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get tasks by project
exports.getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ 
      userId: req.userId, 
      projectId: req.params.projectId 
    })
    .populate('objectiveId', 'title status')
    .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get tasks by objective
exports.getTasksByObjective = async (req, res, next) => {
  try {
    const tasks = await Task.find({ 
      userId: req.userId, 
      objectiveId: req.params.objectiveId 
    })
    .populate('projectId', 'name status')
    .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Endpoint: Get overall task progress for the user
exports.getTaskProgressSummary = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    res.status(200).json({
      totalTasks: total,
      completedTasks: completed,
      progressPercent: percent
    });
  } catch (error) {
    next(error);
  }
};

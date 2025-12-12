const Habit = require('../models/Habit');

// Get all habits for a user
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(habits);
  } catch (error) {
    next(error);
  }
};

// Get single habit by ID
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(habit);
  } catch (error) {
    next(error);
  }
};

// Create new habit
exports.createHabit = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      frequency, 
      targetCount, 
      category, 
      reminderTime, 
      notes 
    } = req.body;
    
    const habit = new Habit({
      userId: req.userId,
      name,
      description,
      frequency,
      targetCount,
      category,
      reminderTime,
      notes
    });
    
    const savedHabit = await habit.save();
    
    res.status(201).json(savedHabit);
  } catch (error) {
    next(error);
  }
};

// Update habit
exports.updateHabit = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      frequency, 
      targetCount, 
      category, 
      reminderTime, 
      isActive,
      notes 
    } = req.body;
    
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        name,
        description,
        frequency,
        targetCount,
        category,
        reminderTime,
        isActive,
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(habit);
  } catch (error) {
    next(error);
  }
};

// Delete habit
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Mark habit as completed for a specific date
exports.completeHabit = async (req, res, next) => {
  try {
    const { date } = req.body; // Format: 'YYYY-MM-DD'
    
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Check if already completed for this date
    if (habit.completedDates.includes(date)) {
      return res.status(400).json({ message: 'Habit already completed for this date' });
    }
    
    // Add date to completed dates
    habit.completedDates.push(date);
    
    // Update streaks
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (habit.completedDates.includes(yesterdayStr)) {
      habit.currentStreak += 1;
    } else {
      habit.currentStreak = 1;
    }
    
    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }
    
    await habit.save();
    
    res.status(200).json(habit);
  } catch (error) {
    next(error);
  }
};

// Unmark habit as completed for a specific date
exports.uncompleteHabit = async (req, res, next) => {
  try {
    const { date } = req.body; // Format: 'YYYY-MM-DD'
    
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Remove date from completed dates
    habit.completedDates = habit.completedDates.filter(d => d !== date);
    
    // Recalculate streaks
    // This is a simplified version - you might want to implement more sophisticated streak calculation
    habit.currentStreak = 0;
    
    await habit.save();
    
    res.status(200).json(habit);
  } catch (error) {
    next(error);
  }
};

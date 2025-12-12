const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  completedDates: [{
    type: String, // Format: 'YYYY-MM-DD'
    default: []
  }],
  category: {
    type: String,
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);

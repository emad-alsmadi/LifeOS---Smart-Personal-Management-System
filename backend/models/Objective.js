const mongoose = require('mongoose');

const objectiveSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Next', 'Paused'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  relatedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Objective', objectiveSchema); 
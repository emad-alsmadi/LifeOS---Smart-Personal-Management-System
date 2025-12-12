const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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

  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused', 'Next'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  objectiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective'
  },
  dueDate: {
    type: Date
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

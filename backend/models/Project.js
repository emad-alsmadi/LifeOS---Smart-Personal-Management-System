const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
    enum: ['Active', 'Completed', 'Next', 'Paused'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  objectives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective'
  }],
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

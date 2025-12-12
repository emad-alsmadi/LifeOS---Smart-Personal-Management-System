const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
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
  category: {
    type: String,
    trim: true,
    required: true
  },
  objectives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);

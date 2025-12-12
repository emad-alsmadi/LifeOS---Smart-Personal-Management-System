const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  content: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  category: {
    type: String,
    trim: true,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#ffffff'
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema); 
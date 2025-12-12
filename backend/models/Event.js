const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  description: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: [
      'Task', 'task',
      'Meeting', 'meeting',
      'Appointment', 'appointment',
      'Reminder', 'reminder',
      'Event', 'event',
      'Deadline', 'deadline'
    ],
    default: 'Event'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
